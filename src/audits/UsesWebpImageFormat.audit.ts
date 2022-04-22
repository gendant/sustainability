import { Meta, Result, SkipResult } from "../types/audit";
import { Traces } from "../types/traces";
import * as util from "../utils/utils";
import Audit from "./audit";

const MIN_WEBP_VALID_THRESHOLD = 0.05;

export default class UsesWebpImageFormatAudit extends Audit {
  static get meta() {
    return {
      id: "webpimages",
      title: "Uses WebP image format",
      failureTitle: `Ensure WebP image are used`,
      description:
        "WebP images provides superior lossless and lossy compression for images on the web. They maintain a low file size and high quality at the same time.  Although browser support is good (95%) you may use WebP images along with other fallback sources.",
      category: "design",
      collectors: [
        "lazymediacollect",
        "mediacollect",
        "transfercollect",
        "redirectcollect",
      ],
    } as Meta;
  }

  /**
   *
   * @applicable if the page has requested images.
   * Get image format using the MIME/type (header: content-type),
   * (careful with this: because sometimes as in AWS S3 the content-type defaults to binary/octet-stream)
   * WebP should be used against PNG, JPG, JPEG or GIF images
   */

  static async audit(traces: Traces): Promise<Result | SkipResult> {
    const debug = util.debugGenerator("UsesWebPImageFormat Audit");
    try {
      const mediaImages = [
        ...(traces.lazyMedia ? [traces.lazyMedia.lazyImages] : []).flat(),
        ...traces.record
          .filter((r) => r.request.resourceType === "image")
          .map((r) => r.response.url.toString()),
      ].filter((img) => !/^data:/.test(img)); //skip base64 img

      const isAuditApplicable = (): boolean => {
        if (!mediaImages.length) return false;
        if (!mediaImages.some((url) => /\.(?:jpg|gif|png|webp|jpeg)/.test(url)))
          return false;

        return true;
      };

      if (isAuditApplicable()) {
        debug("running");
        const auditUrls = new Map<string, number>();

        mediaImages.filter((url) => {
          if (/\.(?:webp)/.test(url)) return false;
          if (!/\.(?:jpg|gif|png|jpeg)/.test(url)) return false;
          const urlLastSegment = util.getUrlLastSegment(url);
          const estimatedSavings = traces.record.find(
            (r) => r.response.url.toString() === url
          )?.response.nonWebPImageEstimatedSavings;
          if (
            !(estimatedSavings && estimatedSavings >= MIN_WEBP_VALID_THRESHOLD)
          )
            return false;

          auditUrls.set(urlLastSegment, estimatedSavings);
          return true;
        });

        const score = Number(auditUrls.size === 0);
        const meta = util.successOrFailureMeta(
          UsesWebpImageFormatAudit.meta,
          score
        );
        debug("done");
        return {
          meta,
          score,
          scoreDisplayMode: "binary",
          ...(auditUrls.size > 0
            ? {
                extendedInfo: {
                  value: Array.from(auditUrls.entries()).flatMap((a) => [
                    { name: a[0], savings: a[1] },
                  ]),
                },
              }
            : {}),
        };
      }

      debug("skipping non applicable audit");

      return {
        meta: util.skipMeta(UsesWebpImageFormatAudit.meta),
        scoreDisplayMode: "skip",
      };
    } catch (error) {
      debug(`Failed with error: ${error}`);
      return {
        meta: util.skipMeta(UsesWebpImageFormatAudit.meta),
        scoreDisplayMode: "skip",
      };
    }
  }
}
