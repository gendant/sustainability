import { EventEmitter, once } from "events";
import * as fs from "fs";
import * as path from "path";
import { Page } from "puppeteer";
import { Sustainability } from "..";
import Collect from "../collect/collect";
import { DEFAULT } from "../settings/settings";
import { AuditSettings, PageContext } from "../types";
import { AuditStreamChunk, AuditType, CollectorsIds } from "../types/audit";
import { PrivateSettings } from "../types/settings";
import { Traces } from "../types/traces";
import * as util from "../utils/utils";

const debug = util.debugGenerator("Commander");

class Commander {
  private _settings = {} as PrivateSettings;
  private readonly _audits = DEFAULT.AUDITS;
  private _id = "";

  async setUp(
    pageContext: PageContext,
    settings?: AuditSettings
  ): Promise<Page> {
    try {
      debug("Running set up");
      const { page, url } = pageContext;
      this._settings = settings?.connectionSettings
        ? { ...DEFAULT.CONNECTION_SETTINGS, ...settings.connectionSettings }
        : DEFAULT.CONNECTION_SETTINGS;

      if (settings?.id) {
        this._id = settings.id;
        debug("Setting comander id to:", this._id);
      }

      // Page.setJavaScriptEnabled(false); Speeds up process drastically
      const pageFeaturesArray = [
        page.setViewport(this._settings.emulatedDevice.viewport),
        page.setUserAgent(this._settings.emulatedDevice.userAgent),
        page.browserContext().overridePermissions(url, ["geolocation"]),
        page.setGeolocation({
          latitude: this._settings.location.latitude,
          longitude: this._settings.location.longitude,
          accuracy: this._settings.location.accuracy,
        }),
        page.setCacheEnabled(false),
        page.setBypassCSP(true),
        page.setJavaScriptEnabled(true),
        page.setRequestInterception(false),
        // Glyphhanger dependency
        page.evaluateOnNewDocument(
          fs.readFileSync(require.resolve("characterset"), "utf8")
        ),
        page.setDefaultNavigationTimeout(0),
        page.evaluateOnNewDocument(
          fs.readFileSync(
            path.resolve(__dirname, "../bin/glyphhanger-script.js"),
            "utf8"
          )
        ),
      ];
      await Promise.all(pageFeaturesArray);

      return page;
    } catch (error) {
      throw new Error(`Setup error ${error}`);
    }
  }

  async evaluate(
    pageContext: PageContext
  ): Promise<PromiseSettledResult<AuditType>[]> {
    if (this._settings.streams) return this.dynamicEvaluate(pageContext);

    return this.staticEvaluate(pageContext);
  }

  async staticEvaluate(
    pageContext: PageContext
  ): Promise<PromiseSettledResult<AuditType>[]> {
    try {
      debug("Static evaluate");
      debug("Runnining collectors");
      const traces = await Promise.allSettled(
        this._audits.collectors.map((collect) =>
          collect.collect(pageContext, this._settings)
        )
      );
      debug("Finished collectors now parsing the traces");
      const parsedTraces = util.parseAllSettledTraces(traces);
      debug("Running audits");
      return Promise.allSettled(
        this._audits.audits.map((audit) => audit.audit(parsedTraces))
      );
    } catch (error) {
      throw new Error(`Error: Commander failed with ${error}`);
    }
  }

  async dynamicEvaluate(
    pageContext: PageContext
  ): Promise<PromiseSettledResult<AuditType>[]> {
    debug("Dynamic evaluate");
    debug("Scheduling collectors");
    const runAuditsMap = new Map<string, Array<typeof Collect>>();

    const getCollector = (collectId: string) =>
      this._audits.collectors.filter((collect) => collect.meta.id === collectId);

    this._audits.audits.forEach((audit) => {
      const auditCollectorsIds = audit.meta.collectors;
      auditCollectorsIds.forEach((collectorId: string) => {
        const collectorsArray = runAuditsMap.get(audit.meta.id);
        const collectorInstance = getCollector(collectorId);
        if (collectorsArray) {
          runAuditsMap.set(audit.meta.id, [
            ...collectorsArray,
            ...collectorInstance,
          ]);
        } else {
          runAuditsMap.set(audit.meta.id, collectorInstance);
        }
      });
    });
    const schedulerArray = [...runAuditsMap.entries()];
    const auditResults = await this.getAuditResults(
      schedulerArray,
      pageContext
    );

    return Promise.allSettled(auditResults);
  }

  private async getAuditResults(
    schedulerArray: Array<[string, Array<typeof Collect>]>,
    pageContext: PageContext
  ) {
    const alreadyInstancedCollects = new Set<CollectorsIds>();
    let globalTraces = {} as Traces;
    const globalEventEmitter = new EventEmitter();
    globalEventEmitter.setMaxListeners(20);
    const getAudit = (auditId: string) =>
      this._audits.audits.filter((audit) => audit.meta.id === auditId);
    return schedulerArray.map(async (scheduled, i) => {
      const collectInstances = scheduled[1];
      const auditInstance = getAudit(scheduled[0])[0];
      const filteredCollectInstances = collectInstances.filter((collect) => {
        if (!alreadyInstancedCollects.has(collect.meta.id)) {
          alreadyInstancedCollects.add(collect.meta.id);
          debug(
            `Updated collect queue ${[...alreadyInstancedCollects.values()]}`
          );
          return true;
        }

        return false;
      });
      if (filteredCollectInstances.length) {
        const traces = await Promise.allSettled([
          ...collectInstances.map((c) => c.collect(pageContext, this._settings)),
        ]);
        debug("parsing traces");
        const parsedTraces = util.parseAllSettledTraces(traces);
        globalTraces = { ...globalTraces, ...parsedTraces };
        collectInstances.forEach((collect) =>
          globalEventEmitter.emit(collect.meta.id)
        );
      } else {
        const promiseArray = collectInstances.map((collect) => {
          debug(
            `${auditInstance.meta.id} is waiting for ${collect.meta.id} to resolve`
          );
          return once(globalEventEmitter, collect.meta.id);
        });
        await Promise.all(promiseArray);
      }

      const auditResult = await auditInstance.audit(globalTraces);
      const pushStream: AuditStreamChunk = {
        meta: {
          ...(this._id ? { id: this._id } : {}),
          status: 'audit',
          total: schedulerArray.length
        },
        audit: auditResult,
      };

      debug(`Streaming ${auditInstance.meta.id} audit`);
      Sustainability.auditStream.push(JSON.stringify(pushStream));

      return auditResult;
    });
  }
}

export default new Commander();
