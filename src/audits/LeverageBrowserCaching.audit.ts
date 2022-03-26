import { DEFAULT } from "../settings/settings";
import { Meta, Result, SkipMeta, SkipResult } from "../types/audit";
import { Traces } from "../types/traces";
import * as util from "../utils/utils";
import Audit from "./audit";
const parseCacheControl = require("parse-cache-control");

// Ignore assets that have very high likelihood of cache hit
const IGNORE_THRESHOLD_IN_PERCENT = 0.925;

/**
 * @license The making of this audit was highly inspired from Lighthouse 'Uses long cache' audit
 * https://github.com/GoogleChrome/lighthouse/blob/master/lighthouse-core/audits/byte-efficiency/uses-long-cache-ttl.js
 */
export default class LeverageBrowserCachingAudit extends Audit {
  static get meta() {
    return {
      id: "leveragebrowsercaching",
      title: "Uses efficient cache policy on static assets",
      failureTitle: `Serve static asssets with an efficient cache policy`,
      description:
        "Serving static assets with long cache lifetime can save up important resources",
      category: "server",
      collectors: ["transfercollect", "redirectcollect"],
    } as Meta;
  }

  static async audit(traces: Traces): Promise<Result | SkipResult> {
    const debug = util.debugGenerator("LeverageBrowserCaching Audit");
    try {
      debug("running");
      const results: any = [];
      let totalWastedBytes = 0;
      const { hosts } = traces.server;

      traces.record.filter((r) => {
        const recordUrl = r.request.url;
        const resourceType = r.request.resourceType;
        if (!hosts.includes(recordUrl.hostname)) return false;
        if (!util.isCacheableAsset(r)) return false;
        const responseHeaders = r.response.headers;
        const cacheControl = parseCacheControl(
          responseHeaders["cache-control"]
        );
        if (util.shouldSkipRecord(responseHeaders, cacheControl)) return false;

        let cacheLifetimeInSecs = util.computeCacheLifetimeInSeconds(
          responseHeaders,
          cacheControl
        );

        if (
          cacheLifetimeInSecs !== null &&
          (!Number.isFinite(cacheLifetimeInSecs) || cacheLifetimeInSecs <= 0)
        )
          return false;

        cacheLifetimeInSecs = cacheLifetimeInSecs || 0;

        const cacheHitProb = util.getCacheHitProbability(cacheLifetimeInSecs);

        if (cacheHitProb > IGNORE_THRESHOLD_IN_PERCENT) return false;

        const totalBytes = r.CDP.compressedSize.value;

        const wastedBytes = (1 - cacheHitProb) * totalBytes;
        totalWastedBytes += wastedBytes;

        results.push({
          name: util.getUrlLastSegment(recordUrl.toString()).split("?")[0],
          resourceType,
          cache: cacheControl,
          cacheHitProbability: cacheHitProb,
          totalBytes,
          wastedBytes,
        });

        return;
      });

      const score = util.computeLogNormalScore(
        DEFAULT.REPORT.scoring.cache,
        totalWastedBytes
      );
      const meta = util.successOrFailureMeta(
        LeverageBrowserCachingAudit.meta,
        score
      );
      debug("done");
      return {
        meta,
        score,
        scoreDisplayMode: "numeric",
        ...(results.length
          ? {
              extendedInfo: {
                value: {
                  totalWastedBytes: {
                    value: totalWastedBytes,
                    units: "bytes",
                  },
                  records: results,
                },
              },
            }
          : {}),
      };
    } catch (error) {
      debug(`Failed with error: ${error}`);
      return {
        meta: util.skipMeta(LeverageBrowserCachingAudit.meta),
        scoreDisplayMode: "skip",
      };
    }
  }
}
