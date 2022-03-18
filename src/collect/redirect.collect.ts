import { HTTPResponse } from "puppeteer";
import { PageContext } from "../types";
import { CollectMeta } from "../types/audit";
import { PrivateSettings } from "../types/settings";
import { CollectRedirectTraces, RedirectResponse } from "../types/traces";
import * as util from "../utils/utils";
import Collect from "./collect";

export default class CollectRedirect extends Collect {
  static get meta() {
    return {
      id: "redirectcollect",
      passContext: "networkidle0",
      debug: util.debugGenerator("Redirect collect"),
    } as CollectMeta;
  }

  static async collect(
    pageContext: PageContext,
    settings: PrivateSettings
  ): Promise<CollectRedirectTraces | undefined> {
    const debug = CollectRedirect.meta.debug;
    debug("running");
    const results: RedirectResponse[] = [];
    const { page, url } = pageContext;
    const initialHost = new URL(url).hostname;
    page.on("response", (response: HTTPResponse) => {
      const status = response.status();
      const url = response.url();
      if (status >= 300 && status !== 304 && status <= 399) {
        const redirectsTo = new URL(
          response.headers().location,
          url
        ).toString();
        const information = {
          //@ts-ignore
          requestId: response.request()._requestId,
          url,
          redirectsTo,
        };

        results.push(information);
      }
    });
    const getEnergySource = async () => {
      const response = await util.isGreenServerMem(initialHost);

      if (response && !response.error) {
        const { green, hostedby } = response;

        return {
          isGreen: green,
          hostedby,
        };
      }

      debug(
        `failed to fetch response from url: ${initialHost} with error: ${response?.error}`
      );

      return undefined;
    };
    const getPageHosts = () => {
      const hosts = new Set<string>();
      hosts.add(initialHost);
      const redirect = results.find(
        (record) => new URL(record.url).hostname === initialHost
      )?.redirectsTo;

      if (redirect) {
        hosts.add(new URL(redirect).hostname);
      }

      return Array.from(hosts.values());
    };

    try {
      await util.safeNavigateTimeout(
        page,
        "networkidle0",
        settings.maxNavigationTime,
        debug
      );
      const hosts = getPageHosts();
      debug("evaluating energy source");
      const energySource = await getEnergySource();
      debug("done");
      return {
        server: {
          hosts,
          energySource,
        },
        redirect: results,
      };
    } catch (error) {
      util.log(`Error: Redirect collect failed with message: ${error}`);
      return undefined;
    }
  }
}
