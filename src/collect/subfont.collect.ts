import { PageContext } from "../types";
import { CollectMeta } from "../types/audit";
import { PrivateSettings } from "../types/settings";
import {
  CollectSubfontsTraces,
  GHOutput,
  SubfontFormat,
} from "../types/traces";
import * as util from "../utils/utils";
import Collect from "./collect";

export default class CollectSubfont extends Collect {
  static get meta() {
    return {
      id: "subfontcollect",
      passContext: "networkidle0",
      debug: util.debugGenerator("Subfont collect"),
    } as CollectMeta;
  }

  static async collect(
    pageContext: PageContext,
    settings: PrivateSettings
  ): Promise<CollectSubfontsTraces | undefined> {
    try {
      const debug = CollectSubfont.meta.debug;
      // May be interesting to give a try at Page._client.FontFamilies
      debug("running");
      const { page } = pageContext;
      await util.safeNavigateTimeout(
        page,
        "load",
        settings.maxNavigationTime,
        debug
      );
      const result: SubfontFormat[] = await page.evaluate(() => {
        //@ts-ignore global
        const hanger = new GlyphHanger();
        hanger.init(document.body);
        const resultJson: GHOutput = hanger.toJSON();

        const fontNames = Object.keys(resultJson);

        const fontsCharSets = Array.from(fontNames).map((font: string) => {
          return {
            name: font,
            value: resultJson[font],
          };
        });

        return fontsCharSets;
      });

      debug("done");
      return {
        fonts: result,
      };
    } catch (error) {
      util.log(`Error: Subfont collector failed with message: ${error}`);
      return undefined;
    }
  }
}
