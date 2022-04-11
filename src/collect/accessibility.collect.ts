import { PageContext } from "../types";
import { CollectMeta } from "../types/audit";
import { PrivateSettings } from "../types/settings";
import { CollectAccessibilityTraces } from "../types/traces";
import * as util from "../utils/utils";
import Collect from "./collect";

export default class CollectAccessibility extends Collect {
  static get meta() {
    return {
      id: "accessibilitycollect",
      passContext: "load",
      debug: util.debugGenerator("Accessibility collect"),
    } as CollectMeta;
  }

  static async collect(
    pageContext: PageContext,
    settings: PrivateSettings
  ): Promise<CollectAccessibilityTraces | undefined> {
    try {
      const debug = CollectAccessibility.meta.debug;
      // May be interesting to give a try at Page._client.FontFamilies
      debug("running");
      const { page } = pageContext;
      await util.safeNavigateTimeout(
        page,
        "load",
        settings.maxNavigationTime,
        debug
      );
      const { audit, report } = await page.evaluate(
        (options) => {
          //@ts-ignore global axs
          const auditConfig = new axs.AuditConfiguration();
          auditConfig.scope = document.querySelector(
            options.auditScopeSelector
          );

          //@ts-ignore global axs
          const results = axs.Audit.run(auditConfig);

          const audit = results.map(function (result: any) {
            let DOMElements = result.elements;
            let message = "";

            if (DOMElements !== undefined) {
              for (let i = 0; i < DOMElements.length; i++) {
                const el = DOMElements[i];
                message += "\n";
                // Get query selector not browser independent. catch any errors and
                // default to simple tagName.
                try {
                  //@ts-ignore global axs
                  message += axs.utils.getQuerySelectorText(el);
                } catch (err) {
                  message += " tagName:" + el.tagName;
                  message += " id:" + el.id;
                }
              }
            }

            return {
              code: result.rule.code,
              heading: result.rule.heading,
              result: result.result,
              severity: result.rule.severity,
              url: result.rule.url,
              elements: message,
            };
          });

          const output = {
            audit: audit,
            //@ts-ignore global axs
            report: axs.Audit.createReport(results),
          };

          return JSON.parse(JSON.stringify(output));
        },
        { auditScopeSelector: "body" }
      );

      debug("done");
      return {
        accessibility: { audit, report },
      };
    } catch (error) {
      util.log(`Error: Subfont collector failed with message: ${error}`);
      return undefined;
    }
  }
}
