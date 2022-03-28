/**
 * Configuration for the connection
 * Override default config options by calling it with your options.
 */
import * as puppeteer from "puppeteer";
import { DEFAULT } from "../settings/settings";
import { PuppeteerLaunchOptions } from "../types/traces";
import * as util from "../utils/utils";

const debug = util.debugGenerator("Connection");

export default class Connection {
  private launchSettings = {} as PuppeteerLaunchOptions;

  async setUp(
    launchSettings?: PuppeteerLaunchOptions
  ): Promise<puppeteer.Browser> {
    this.launchSettings = launchSettings ?? DEFAULT.LAUNCH_SETTINGS;

    if (process.env.CHROME_BIN) {
      this.launchSettings.executablePath = process.env.CHROME_BIN;
    }

    debug("Launching browser");
    const browser = await puppeteer.launch(this.launchSettings);
    return browser;
  }
}
