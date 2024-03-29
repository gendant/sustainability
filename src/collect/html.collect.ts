import { DEFAULT } from "../settings/settings";
import { PageContext } from "../types";
import { CollectMeta } from "../types/audit";
import { CollectHtmlTraces } from "../types/traces";
import * as util from "../utils/utils";
import Collect from "./collect";

export default class CollectHTML extends Collect {
  static get meta() {
    return {
      id: "htmlcollect",
      passContext: "networkidle0",
      debug: util.debugGenerator("HTML Collect"),
    } as CollectMeta;
  }

  static async collect(
    pageContext: PageContext
  ): Promise<CollectHtmlTraces | undefined> {
    try {
      const debug = CollectHTML.meta.debug;
      debug("running");
      const { page } = pageContext;
      const result: string[] = [];

      await page.waitForSelector("body", {
        timeout: DEFAULT.CONNECTION_SETTINGS.maxScrollWaitingTime,
      });
      const htmlPromiseResult = await Promise.all([
        page.evaluate(() => document.querySelector("*")!.outerHTML),
        page.content(),
      ]);
      const javascriptHtml = htmlPromiseResult[0];
      const vanillaHtml = htmlPromiseResult[1];

      result.push(
        ...(vanillaHtml !== javascriptHtml ? [javascriptHtml] : []),
        vanillaHtml
      );
      debug("done");
      return {
        html: result,
      };
    } catch (error) {
      util.log(`Error:Console collect failed with message: ${error}`);
      return undefined;
    }
  }
}
