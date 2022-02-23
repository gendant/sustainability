import { PageContext } from "../types";
import { CollectMeta, CollectorsIds, PassContext } from "../types/audit";
import { PrivateSettings } from "../types/settings";
import { CollectType } from "../types/traces";

export default class Collect {
  public static collectId: CollectorsIds;
  public static passContext: PassContext;
  public static debug: CallableFunction;

  static get meta() {
    return {} as CollectMeta;
  }

  static async collect(pageContext: PageContext, settings: PrivateSettings) {
    return {} as Promise<CollectType>;
  }
}
