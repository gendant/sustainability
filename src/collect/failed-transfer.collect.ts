import { HTTPResponse as Response } from "puppeteer";
import { PageContext } from "../types";
import { CollectMeta } from "../types/audit";
import { CollectFailedTransferTraces, FailedRequest } from "../types/traces";
import * as util from "../utils/utils";
import Collect from "./collect";

const debug = util.debugGenerator("Failed transfer collect");

export default class CollectFailedTransfers extends Collect {
  static get meta() {
    return {
      id: "failedtransfercollect",
      passContext: "networkidle0",
      debug: util.debugGenerator("Failed transfer collect"),
    } as CollectMeta;
  }

  static async collect(
    pageContext: PageContext
  ): Promise<CollectFailedTransferTraces | undefined> {
    const debug = CollectFailedTransfers.meta.debug;
    debug("running");
    try {
      const { page } = pageContext;
      const result: FailedRequest[] = [];
      page.on("response", (response: Response) => {
        const status = response.status();
        const url = response.url();
        if (status >= 400) {
          const information = {
            url,
            code: status,
            statusText: response.statusText(),
            failureText: response.request().failure()?.errorText,

            requestId: response.request()._requestId,
          };

          result.push(information);
        }
      });

      debug("done");
      return {
        failed: result,
      };
    } catch (error) {
      util.log(`Error: At failed transfer collect with message: ${error}`);
      return undefined;
    }
  }
}
