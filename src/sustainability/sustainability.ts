import { Browser, LaunchOptions, Page } from "puppeteer";
import { Readable } from "stream";
import Commander from "../commander/commander";
import Connection from "../connection/connection";
import { DEFAULT } from "../settings/settings";
import { AuditSettings, PageContext } from "../types";
import { AuditStreamChunk, Report } from "../types/audit";
import * as util from "../utils/utils";
import { auditStream } from "./stream";

const debug = util.debugGenerator("Sustainability");
export default class Sustainability {
  private _settings;
  private _id;

  constructor(settings?: AuditSettings) {
    this._settings = settings?.connectionSettings
      ? { ...DEFAULT.CONNECTION_SETTINGS, ...settings.connectionSettings }
      : DEFAULT.CONNECTION_SETTINGS;
    
      if (settings?.id) {
        this._id = settings.id;
      }
  }

  /**
   * A readable stream of audits to pipe from. Used in combination with streams option.
   */
  public static auditStream = auditStream;

  /**
   * Main method to start a new test on a given url. Returns a report.
   */
  public static async audit(
    url: string,
    settings?: AuditSettings
  ): Promise<Report> {
    let browser: Browser | undefined;
    let page: Page;
    let coldRunPage: Page;
    let redirectURL;
    const comments: string[] = [];
    const sustainability = new Sustainability(settings);
    const isColdRun = sustainability._settings.coldRun;

    try {

      browser =
        settings?.browser ??
        (await sustainability._startNewConnectionAndReturnBrowser(
          settings?.launchSettings
        ));

      if (isColdRun) {
        coldRunPage = await browser.newPage();
        redirectURL = await sustainability._spawnColdRun(coldRunPage, url);
      }

      if (redirectURL) {
        comments.push(
          `Warning: The tested URL (${url}) was redirected to (${redirectURL}). Please, next time test the second URL directly.`
        );
        url = redirectURL;
      }

      page = await browser.newPage();
      let report = {} as Report;
      try {
        const pageContext = { page, url };
        report = await sustainability._handler(pageContext, settings);
        if (comments.length) report.comments = comments;
        return report;
      } catch (error) {
        throw new Error(`Error: Test failed with message: ${error}`);
      } finally {
        await page.close();
      }
    } catch (error) {
      throw new Error(`Error: ${error}`);
    } finally {
      if (browser && isColdRun) {
        debug("Closing cold run page...");
        await coldRunPage!.close();
      }
      if (browser && !settings?.browser) {
        debug("Closing browser...");
        await browser.close();
      }
    }
  }

  private async _startNewConnectionAndReturnBrowser(
    settings?: LaunchOptions
  ): Promise<Browser> {
    const browser = await Connection.setUp(settings);
    return browser;
  }

  private async _spawnColdRun(
    coldRunPage: Page,
    url: string
  ): Promise<string | undefined> {
    await coldRunPage.setRequestInterception(true);
    await coldRunPage.setJavaScriptEnabled(false);
    async function handleRequest(request: any, resolve: any) {
      if (request.isNavigationRequest() && request.redirectChain().length) {
        const redirectURL = request.url();
        request.abort();
        resolve(redirectURL);
      } else {
        request.continue();
      }
    }

    const redirectURLPromise = new Promise<string | undefined>(
      async (resolve) => {
        coldRunPage.on("request", (request) => handleRequest(request, resolve));
        debug("Starting cold run and looking for URL redirects");
      }
    );
    let redirectURL: string | undefined;
    const coldPageContext = { page: coldRunPage, url };
    await Promise.race([
      redirectURLPromise.then((v) => (redirectURL = v)),
      util.navigate(coldPageContext, "networkidle0", debug),
    ]);

    return redirectURL;
  }

  private async _handler(
    pageContextRaw: PageContext,
    settings?: AuditSettings
  ): Promise<Report> {
    const isStream = this._settings.streams;
    const startTime = Date.now();
    const { url } = pageContextRaw;
    const page = await Commander.setUp(pageContextRaw, settings);
    const pageContext = { ...pageContextRaw, page };
    const [_, auditResults] = await Promise.allSettled([
      util.navigate(pageContext, "networkidle0", debug, false, this._settings),
      Commander.evaluate(pageContext),
    ]);

    page.removeAllListeners();

    const resultsParsed = util.parseAllSettledAudits(auditResults);
    const audits = util.groupAudits(resultsParsed);
    const globalScore = util.computeScore(audits);

    const meta = {
      url,
      timing: [new Date(startTime).toISOString(), Date.now() - startTime],
    };

    const report: Report = {
      globalScore,
      meta,
      audits,
    };

    if (isStream) {
      debug("Streaming report");
      const pushStream: AuditStreamChunk = {
        meta: {
          ...(this._id ? { id: this._id } : {}),
          status: "done",
        },
        audit: report,
      };
      this._settings.pipe?.push(JSON.stringify(pushStream));

      if (this._settings.pipeTerminateOnEnd) {
        this._settings.pipe?.push(null);
      }
      debug("Done streaming audits");
    }

    return report;
  }
}
