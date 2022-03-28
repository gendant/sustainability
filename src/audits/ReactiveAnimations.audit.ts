import { Meta, Result, SkipResult } from "../types/audit";
import { Traces } from "../types/traces";
import * as util from "../utils/utils";
import Audit from "./audit";

export default class ReactiveAnimationsAudit extends Audit {
  static get meta() {
    return {
      id: "reactiveanimations",
      title: `Animations and transitions are reactive`,
      failureTitle: `Ensure reactive animations and transitions are used`,
      description: `CSS animations and transitions should only run whenever the user is interacting with them and automatically pause otherwise. <a rel="noopener noreferrer" target="_blank" href="https://gist.github.com/sirdmon/0fda06c8288ad0fc9712d9f2f955c907">More info</a>`,
      category: "design",
      collectors: ["animationscollect", "lazymediacollect"],
    } as Meta;
  }

  static async audit(traces: Traces): Promise<Result | SkipResult> {
    const debug = util.debugGenerator("SmartAnimations Audit");

    const isAuditApplicable = (): boolean => {
      if (!traces.animations) return false;
      return true;
    };

    if (isAuditApplicable()) {
      debug("running");
      const score = Number(traces.animations.notReactive.length === 0);
      const meta = util.successOrFailureMeta(
        ReactiveAnimationsAudit.meta,
        score
      );
      debug("done");

      return {
        meta,
        score,
        scoreDisplayMode: "binary",
        ...(score
          ? {}
          : {
              extendedInfo: {
                value: traces.animations.notReactive,
              },
            }),
      };
    }

    debug("skipping non applicable audit");

    return {
      meta: util.skipMeta(ReactiveAnimationsAudit.meta),
      scoreDisplayMode: "skip",
    };
  }
}
