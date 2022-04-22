import { sum } from "../bin/statistics";
import { Meta, Result, SkipResult } from "../types/audit";
import { Traces } from "../types/traces";
import * as util from "../utils/utils";
import Audit from "./audit";

//https://www.tunetheweb.com/blog/critical-resources-and-the-first-14kb/
const MAX_TOTAL_INLINE_ASSET_SIZE = 14600;
export default class AvoidInlineAssetsAudit extends Audit {
  static get meta() {
    return {
      id: "avoidinlineassets",
      title: `CSS/JS assets are not inlined`,
      failureTitle: `Avoid HTML inlining on CSS/JS assets `,
      description: `It's not recommended to inline static resources since they can't be cached on browser memory. Critical resources should never exceed 14kb`,
      category: "design",
      collectors: ["assetscollect"],
    } as Meta;
  }

  static async audit(traces: Traces): Promise<Result | SkipResult> {
    const debug = util.debugGenerator("AvoidInlineAssets Audit");
    try {
      debug("running");
      const inlineAssets = [
        ...traces.css.info.styles,
        ...traces.js.info.scripts,
      ].map((asset) => {
        return {
          name: asset.src,
          size: asset.size,
          text: util.trimConsoleMessage(util.truncateAsset(asset.text)),
        };
      });

      const inlineAssetsTotalSum = sum(inlineAssets.map((a) => a.size));

      const score = Number(inlineAssetsTotalSum <= MAX_TOTAL_INLINE_ASSET_SIZE);

      const meta = util.successOrFailureMeta(
        AvoidInlineAssetsAudit.meta,
        score
      );
      debug("done");

      return {
        meta,
        score,
        scoreDisplayMode: "binary",
        ...(inlineAssets.length > 0 && score === 0
          ? {
              extendedInfo: {
                value: inlineAssets,
              },
            }
          : {}),
      };
    } catch (error) {
      debug(`Failed with error: ${error}`);
      return {
        meta: util.skipMeta(AvoidInlineAssetsAudit.meta),
        scoreDisplayMode: "skip",
      };
    }
  }
}
