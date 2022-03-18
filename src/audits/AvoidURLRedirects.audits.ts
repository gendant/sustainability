import { Meta, Result, SkipResult } from "../types/audit";
import { Traces } from "../types/traces";
import * as util from "../utils/utils";
import Audit from "./audit";

export default class AvoidURLRedirectsAudit extends Audit {
  static get meta() {
    return {
      id: "avoidurlredirects",
      title: `Does not have URL redirects`,
      failureTitle: `Avoid URL redirects`,
      description: `URL redirects create unnecessary HTTP traffic`,
      category: "server",
      collectors: ["redirectcollect"],
    } as Meta;
  }

  static async audit(traces: Traces): Promise<Result | SkipResult> {
    const debug = util.debugGenerator("AvoidURLRedirects Audit");
    const { hosts } = traces.server;
    try{
    debug("running");
    const redirects = traces.redirect
      .filter((record) => {
        return hosts.includes(new URL(record.url).hostname);
      })
      .map((r) => {
        return {
          url: r.url,
          redirectsTo: r.redirectsTo,
        };
      });

    const score = Number(redirects.length === 0);
    const meta = util.successOrFailureMeta(AvoidURLRedirectsAudit.meta, score);
    debug("done");
    return {
      meta,
      score,
      scoreDisplayMode: "binary",
      ...(redirects.length
        ? {
            extendedInfo: {
              value: redirects,
            },
          }
        : {}),
    };
  } catch (error) {
    debug(`Failed with error: ${error}`);
    return {
      meta: util.skipMeta(AvoidURLRedirectsAudit.meta),
      scoreDisplayMode: "skip",
    };
  }
  }
}
