import { sum } from "../bin/statistics";
import { variables } from "../references/references";
import { DEFAULT } from "../settings/settings";
import { Meta, Result, SkipResult } from "../types/audit";
import { Traces } from "../types/traces";
import * as util from "../utils/utils";
import Audit from "./audit";

const MB_TO_BYTES = 1024 * 1024;
const GB_TO_MB = 1024;

export default class CarbonFootprintAudit extends Audit {
  static get meta() {
    return {
      id: "carbonfootprint",
      title: `Carbon footprint is moderate`,
      failureTitle: `Carbon footprint is high`,
      description: `The carbon footprint is the total amount of greenhouse gases released into the atmosphere for directly or indirectly supporting a particular activity. Keeping it as low as possible it’s key to prevent the climate change.`,
      category: "server",
      collectors: ["transfercollect", "redirectcollect", "performancecollect"],
    } as Meta;
  }

  /**
   * @workflow
   * 	Compute gCO2eq
   */
  static async audit(traces: Traces): Promise<Result | SkipResult> {
    const debug = util.debugGenerator("Carbonfootprint Audit");
    try {
      debug("running");
      const getValidRecords = async () => {
        return traces.record.map((record) => {
          return {
            size: record.CDP.compressedSize.value,
            unSize: record.response.uncompressedSize.value,
          };
        });
      };

      const records = await getValidRecords();
      debug("evaluating total page weight");
      const totalTransfersize = sum(
        records.map((record) => {
          return record.size;
        })
      );

      // used for CF calculation.
      // although this transfer size isn't as precise as totalTransferSize, it is much more reliable
      const totalComputableTransfersize = sum(
        traces.performance.perf.flatMap((entry) => entry.transferSize ?? [])
      );

      debug("evaluating file size by record type");
      const recordsByFileSize = traces.record
        .sort((a, b) => b.CDP.compressedSize.value - a.CDP.compressedSize.value)
        .reduce((acc, record) => {
          const compressedSize = record.CDP.compressedSize.value;
          if (compressedSize) {
            const currentAccKey = acc[record.request.resourceType];

            const instantSharePercent = compressedSize / totalTransfersize;
            const name = util.getUrlLastSegment(record.request.url.toString());
            const hostname = record.request.url.hostname;
            const isThirdParty = !traces.server.hosts.includes(hostname);

            acc[record.request.resourceType] = currentAccKey
              ? {
                  size: (currentAccKey.size += compressedSize),
                  share: +Number(
                    (currentAccKey.share += instantSharePercent * 100)
                  ).toFixed(2),
                  info: [
                    ...currentAccKey.info.map((i: any) => ({
                      ...i,
                      relative: +Number(
                        (i.absolute / currentAccKey.share) * 100
                      ).toFixed(2),
                    })),
                    {
                      name,
                      isThirdParty,
                      ...(isThirdParty ? { hostname } : {}),
                      size: compressedSize,
                      absolute: +Number(instantSharePercent * 100).toFixed(2),
                      relative: +Number(
                        ((instantSharePercent * 100) / currentAccKey.share) *
                          100
                      ).toFixed(2),
                    },
                  ],
                }
              : {
                  size: compressedSize,
                  share: instantSharePercent * 100,
                  info: [
                    {
                      name,
                      isThirdParty,
                      ...(isThirdParty ? { hostname } : {}),
                      size: compressedSize,
                      absolute: +Number(instantSharePercent * 100).toFixed(2),
                      relative: 100,
                    },
                  ],
                };
          }
          return acc;
        }, {} as Record<string, any>);

      const totalWattageFunction = () => {
        let size = totalComputableTransfersize / (MB_TO_BYTES * GB_TO_MB);

        if (traces.server.energySource && traces.server.energySource.isGreen) {
          size *= variables.coreNetwork[0];
        } else {
          size *= variables.dataCenter[0] + variables.coreNetwork[0];
        }

        return size;
      };

      const totalComputedWattage = totalWattageFunction();

      // Apply references values
      debug("computing carbon footprint metric");
      const metric =
        totalComputedWattage *
        variables.defaultCarbonIntensity[0] *
        variables.defaultDailyVisitors[0];

      const { median, p10 } = DEFAULT.REPORT.scoring.CF;
      debug("computing log normal score");
      const score = util.computeLogNormalScore({ median, p10 }, metric);
      const meta = util.successOrFailureMeta(CarbonFootprintAudit.meta, score);
      debug("done");
      return {
        meta,
        score,
        scoreDisplayMode: "numeric",
        extendedInfo: {
          value: {
            extra: {
              totalTransfersize: [totalComputableTransfersize, "bytes"],
              totalComputedWattage: [totalComputedWattage.toFixed(10), "kWh"],
              carbonfootprint: [metric.toFixed(5), "gCO2eq / 100 views"],
            },
            share: recordsByFileSize,
          },
        },
      };
    } catch (error) {
      debug(`Failed with error: ${error}`);
      return {
        meta: util.skipMeta(CarbonFootprintAudit.meta),
        scoreDisplayMode: "skip",
      };
    }
  }
}
