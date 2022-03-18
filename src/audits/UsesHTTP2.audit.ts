import { Meta, Result, SkipResult } from "../types/audit";
import { Traces } from "../types/traces";
import * as util from "../utils/utils";
import Audit from "./audit";

/**
 * @fileoverview Audit request in the same origin as host use HTTP2.0
 */

export default class UsesHTTP2Audit extends Audit {
  static get meta() {
    return {
      id: "useshttp2",
      title: "Uses HTTP2",
      failureTitle: `Serve assets over HTTP2`,
      description: `HTTP2 provides advantages such as:
            multiplexing, server push, binary headers and increased security.`,
      category: "server",
      collectors: ["transfercollect", "redirectcollect"],
    } as Meta;
  }

  static async audit(traces: Traces): Promise<Result | SkipResult> {
    const debug = util.debugGenerator("UsesHTTP2 Audit");
    try{
    debug("running");
    const { hosts } = traces.server;
    let urlCounter = 0;
    traces.record.filter((record) => {
      const recordUrl = record.request.url;
      if (!record.request.protocol) return false;
      if (record.response.fromServiceWorker) return false;
      if (record.request.protocol === "h2") return false;
      if (record.request.protocol === "data") return false;
      if (!hosts.includes(recordUrl.hostname)) return false;
      urlCounter++;
      return true;
    });
    const score = Number(urlCounter === 0);
    const meta = util.successOrFailureMeta(UsesHTTP2Audit.meta, score);
    debug("done");
    return {
      meta,
      score,
      scoreDisplayMode: "binary",
    };
  } catch (error) {
    debug(`Failed with error: ${error}`);
    return {
      meta: util.skipMeta(UsesHTTP2Audit.meta),
      scoreDisplayMode: "skip",
    };
  }
  }
}
