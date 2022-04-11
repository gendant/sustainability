import { PageContext } from "../types";
import { CollectMeta } from "../types/audit";
import { PrivateSettings } from "../types/settings";
import { CollectPerformanceTraces, Metrics } from "../types/traces";
import * as util from "../utils/utils";
import Collect from "./collect";

const MAX_PERF_BUFFER_SIZE = 10000;

export default class CollectPerformance extends Collect {
  static get meta() {
    return {
      id: "performancecollect",
      debug: util.debugGenerator("Performance collect"),
    } as CollectMeta;
  }

  static async collect(
    pageContext: PageContext,
    settings: PrivateSettings
  ): Promise<CollectPerformanceTraces> {
    const { page } = pageContext;
    const debug = CollectPerformance.meta.debug;
    debug("running");
    await util.safeNavigateTimeout(
      page,
      "networkidle0",
      settings.maxNavigationTime
    );
    const perf: PerformanceResourceTiming[] = JSON.parse(
      await page.evaluate(
        (options) => {
          performance.setResourceTimingBufferSize(options.maxPerfBufferSize);
          return JSON.stringify(performance.getEntries());
        },
        { maxPerfBufferSize: MAX_PERF_BUFFER_SIZE }
      )
    );

    const metrics: Metrics = await page.metrics();
    const info = {
      perf,
      metrics,
    };
    debug("done");
    return {
      performance: info,
    };
  }
}
