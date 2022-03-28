import { Meta, Result, SkipResult } from "../types/audit";
import { Traces } from "../types/traces";
import * as util from "../utils/utils";
import Audit from "./audit";

export default class AvoidableBotTrafficAudit extends Audit {
  static get meta() {
    return {
      id: "avoidablebottraffic",
      title: `Successfully handles bot traffic`,
      failureTitle: `Bot traffic is not handled`,
      description: `About 40% of current internet traffic and bandwidth is due to bots or web crawlers. Proper handling of robot.txt and <meta name="robots"> allow to control which content should be allowed for bots visiting your site and thus save precious resources. More <a rel="noopener noreferrer" target="_blank" href="https://support.google.com/webmasters/answer/6062596?hl=en">info</a>`,
      category: "design",
      collectors: [
        "robotscollect",
        "metatagscollect",
        "transfercollect",
        "redirectcollect",
      ],
    } as Meta;
  }

  static async audit(traces: Traces): Promise<Result | SkipResult> {
    const debug = util.debugGenerator("AvoidableBotTraffic Audit");
    try {
      debug("running");
      const { hosts } = traces.server;

      if (!(traces.robots && Object.keys(traces.robots).length)) {
        return {
          meta: util.skipMeta(AvoidableBotTrafficAudit.meta),
          scoreDisplayMode: "skip",
          errorMessage: "Could not find a valid robots.txt file",
        };
      }
      let errorMessage: string | undefined;
      const robotMetaTag = traces.metatag.filter((m) => {
        return m.attr.some(
          (attr) => attr.hasOwnProperty("name") && attr.name === "robots"
        );
      });

      const xRobotTag = traces.record.filter((r) => {
        if (!r.response.headers["x-robots-tag"]) return false;
        const recordUrl = r.request.url;
        if (!hosts.includes(recordUrl.hostname)) return false;
        return true;
      });

      const disallowRulesForAllUserAgents =
        traces.robots.agents["all"]?.disallow;
      const agentsList = Object.keys(traces.robots.agents);

      const UAwithSpecificRules = agentsList.filter(
        (agent) => traces.robots.agents[agent].disallow.length
      );
      const passAudit = () => {
        if (robotMetaTag.length || xRobotTag.length) {
          debug("Found robot meta tag or xRobotTag");
          errorMessage =
            "Consider handling all bot traffic in the robots.txt file";
          return true;
        }
        if (disallowRulesForAllUserAgents?.length) return true;
        if (UAwithSpecificRules.length) return true;

        return false;
      };

      const score = Number(passAudit());
      const meta = util.successOrFailureMeta(
        AvoidableBotTrafficAudit.meta,
        score
      );
      debug("done");

      return {
        meta,
        score,
        scoreDisplayMode: "binary",
        ...(errorMessage ? { errorMessage } : {}),
      };
    } catch (error) {
      debug(`Failed with error: ${error}`);
      return {
        meta: util.skipMeta(AvoidableBotTrafficAudit.meta),
        scoreDisplayMode: "skip",
      };
    }
  }
}
