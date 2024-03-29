import { HTTPRequest as Request } from "puppeteer";
import { PageContext } from "../types";
import { CollectMeta } from "../types/audit";
import { PrivateSettings } from "../types/settings";
import {
  ByteFormat,
  CDPDataPrivate,
  CollectTransferTraces,
  ProtocolData,
  Record,
} from "../types/traces";
import * as util from "../utils/utils";
import Collect from "./collect";

const APPLICABLE_COMPRESSION_MIME_TYPES = [
  "text/css",
  "text/javascript",
  "text/html",
  "text/xml",
  "text/plain",
  "application/javascript",
  "application/x-font-woff",
  "application/x-javascript",
  "application/vnd.ms-fontobject",
  "application/x-font-opentype",
  "application/x-font-truetype",
  "application/x-font-ttf",
  "application/xml",
  "application/json",
  "application/font-sfnt",
  "font/eot",
  "font/opentype",
  "font/otf",
  "font/woff",
  "font/ttf",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon",
];
export default class CollectTransfer extends Collect {
  static get meta() {
    return {
      id: "transfercollect",
      passContext: "networkidle0",
      debug: util.debugGenerator("Transfer collect"),
    } as CollectMeta;
  }

  static get context() {
    return this.passContext;
  }

  static async collect(
    pageContext: PageContext,
    settings: PrivateSettings
  ): Promise<CollectTransferTraces | undefined> {
    const { page } = pageContext;
    let requestFinishedHandler: any;
    try {
      const debug = CollectTransfer.meta.debug;
      debug("running");
      const results: Record[] = [];
      const protocol: ProtocolData[] = [];
      const CDP: CDPDataPrivate[] = [];
      const client = await page.target().createCDPSession();
      await client.send("Network.enable");

      client.on("Network.loadingFinished", (data: any) => {
        const length = data?.encodedDataLength;
        const { requestId } = data;
        CDP.push({
          requestId,
          encodedDataLength: length,
        });
      });

      client.on("Network.responseReceived", (data: any) => {
        if (data?.response && data.response.protocol) {
          protocol.push({
            protocol: data.response.protocol,
            requestId: data.requestId,
          });
        }
      });

      page.on(
        "requestfinished",
        (requestFinishedHandler = async (request: Request) => {
          const response = request.response();
          const responseHeaders = response?.headers()!;
          let responseBody: Buffer;
          let uncompressedSize: ByteFormat;
          let gzipSize: ByteFormat;

          if (response) {
            try {
              responseBody = await response.buffer();
              if (
                APPLICABLE_COMPRESSION_MIME_TYPES.includes(
                  responseHeaders["content-type"]
                )
              ) {
                const gzipSizeValue = async (bodyBuffer: Buffer) =>
                  page.evaluate(async (input) => {
                    const string2ab = (string: string) => {
                      const buf = new ArrayBuffer(string.length * 2); // 2 bytes for each char
                      const bufView = new Uint16Array(buf);
                      for (
                        let i = 0, stringLength = string.length;
                        i < stringLength;
                        i++
                      ) {
                        bufView[i] = string.charCodeAt(i);
                      }

                      return buf;
                    };

                    // @ts-ignore
                    const cs = new CompressionStream("gzip");
                    const writer = cs.writable.getWriter();
                    writer.write(string2ab(input));
                    writer.close();
                    let totalSize = 0;
                    const reader = cs.readable.getReader();
                    while (true) {
                      const { value, done } = await reader.read();
                      if (done) break;
                      totalSize += value.byteLength;
                    }

                    return totalSize;
                  }, bodyBuffer.toString("utf-8"));
                gzipSize = {
                  value: await gzipSizeValue(responseBody),
                  units: "bytes",
                };
              } else {
                gzipSize = {
                  value: 0,
                  units: "bytes",
                };
              }

              uncompressedSize = {
                value: responseBody.length,
                units: "bytes",
              };
            } catch (error) {
              const contentLengthFromResponseHeader =
                response.headers()["content-length"];
              if (contentLengthFromResponseHeader) {
                uncompressedSize = {
                  value: Number(contentLengthFromResponseHeader),
                  units: "bytes",
                };
              } else {
                uncompressedSize = {
                  value: 0,
                  units: "bytes",
                };
              }

              gzipSize = {
                value: 0,
                units: "bytes",
              };

              debug("failed at redirect response");
              util.log(
                `Error: Transfer collect failed at ${request.url()} with message: ${error}`
              );
            }

            const requestId = request._requestId;

            //for images get equivalent webp value
            let nonWebPImageEstimatedSavings;

            if (
              request.resourceType() === "image" &&
              !/^data:/.test(request.url()) &&
              !/\.(?:webp)/.test(request.url())
            ) {
              try {
                const encodedWebPResponseSize = await client.send(
                  "Audits.getEncodedResponse",
                  { requestId, encoding: "webp", quality: 0.7, sizeOnly: true }
                );
                if (encodedWebPResponseSize) {
                  const { originalSize, encodedSize } = encodedWebPResponseSize;
                  nonWebPImageEstimatedSavings = Number(
                    (1 - encodedSize / originalSize).toFixed(2)
                  );
                }
              } catch (error) {
                debug("failed at encoding webp image");
                util.log(
                  `Error: Transfer collect webp image encoding failed at ${request.url()} with message: ${error}`
                );
              }
            }

            const information: Record = {
              request: {
                requestId,
                url: new URL(request.url()),
                resourceType: request.resourceType(),
                method: request.method(),
                headers: request.headers(),
                timestamp: Date.now(),
                protocol: protocol.find((p) => p.requestId === requestId)
                  ?.protocol,
              },
              response: {
                remoteAddress: response.remoteAddress(),
                status: response.status(),
                url: new URL(response.url()),
                fromServiceWorker: response.fromServiceWorker(),
                headers: responseHeaders,
                uncompressedSize,
                gzipSize,
                timestamp: Date.now(),
                ...(nonWebPImageEstimatedSavings
                  ? { nonWebPImageEstimatedSavings }
                  : {}),
              },
              CDP: {
                compressedSize: {
                  value:
                    CDP.find((r: any) => r.requestId === requestId)
                      ?.encodedDataLength ?? 0,
                  units: "bytes",
                },
              },
            };

            results.push(information);
          }
        })
      );

      await util.safeNavigateTimeout(
        page,
        "networkidle0",
        settings.maxNavigationTime,
        debug
      );

      debug("done");
      return {
        record: results,
      };
    } catch (error) {
      util.log(`Error: Transfer collect failed with message: ${error}`);
      return undefined;
    } finally {
      page.off("requestfinished", requestFinishedHandler);
    }
  }
}
