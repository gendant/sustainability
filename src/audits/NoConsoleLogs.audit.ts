import { Meta, Result, SkipResult } from "../types/audit";
import { Traces } from "../types/traces";
import * as util from "../utils/utils";
import Audit from "./audit";

export default class NoConsoleLogsAudit extends Audit {
  static get meta() {
    return {
      id: "noconsolelogs",
      title: `Does not have console logs`,
      failureTitle: "Avoid console logs",
      description: `It is important to keep the console log clean of error, warning or info outputs.`,
      category: "design",
      collectors: ["consolecollect"],
    } as Meta;
  }

  static async audit(traces: Traces): Promise<Result | SkipResult> {
    const debug = util.debugGenerator("NoConsoleLogs Audit");
    try {
      debug("running");
      const dups = new Set();
      const uniqueResources = traces.console?.filter((trace) => {
        const dup = dups.has(trace.text);
        dups.add(trace.text);
        return !dup;
      });
      const score = Number(uniqueResources?.length === 0);
      const meta = util.successOrFailureMeta(NoConsoleLogsAudit.meta, score);
      debug("done");
      return {
        meta,
        score,
        scoreDisplayMode: "binary",
        ...(uniqueResources?.length
          ? {
              extendedInfo: {
                value: uniqueResources,
              },
            }
          : {}),
      };
    } catch (error) {
      debug(`Failed with error: ${error}`);
      return {
        meta: util.skipMeta(NoConsoleLogsAudit.meta),
        scoreDisplayMode: "skip",
      };
    }
  }
}
