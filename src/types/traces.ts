import {
  BrowserConnectOptions,
  BrowserLaunchArgumentOptions,
  LaunchOptions,
  Product,
} from "puppeteer";

export interface Format {
  uid: string;
  url: string;
  monitor: MonitorStats[];
  completed: boolean;
  traces: Traces;
}

export interface MonitorStats {
  id: string;
  cpu: number;
  memory: number;
  timestamp: number | [number, number];
}

export interface Traces {
  server: ServerFormat;
  html: string[];
  css: CssTrace;
  js: JsTrace;
  record: Record[];
  console: ConsoleMessageFormat[];
  performance: PerformanceFormat;
  robots: RobotsFormat;
  fonts: SubfontFormat[];
  media: MediaTrace;
  failed: FailedRequest[];
  redirect: RedirectResponse[];
  lazyMedia: LazyMediaFormat;
  screenshot: ScreenShotFormat;
  animations: AnimationsFormat;
  cookies: Cookie[];
  metatag: MetaTagFormat[];
  accessibility: AccessibilityFormat;
}

//ported from old @types/puppeteer 5.5.0

export interface Cookie {
  /** The cookie name. */
  name: string;
  /** The cookie value. */
  value: string;
  /** The cookie domain. */
  domain: string;
  /** The cookie path. */
  path: string;
  /** The cookie Unix expiration time in seconds. */
  expires: number;
  /** The cookie size */
  size: number;
  /** The cookie http only flag. */
  httpOnly: boolean;
  /** The session cookie flag. */
  session: boolean;
  /** The cookie secure flag. */
  secure: boolean;
  /** The cookie same site definition. */
  sameSite?: SameSiteSetting | undefined;
}

export type SameSiteSetting = "Strict" | "Lax" | "None";
export type LoadEvent =
  | "load"
  | "domcontentloaded"
  | "networkidle0"
  | "networkidle2";

export type PuppeteerLaunchOptions = LaunchOptions &
  BrowserLaunchArgumentOptions &
  BrowserConnectOptions & {
    product?: Product;
    extraPrefsFirefox?: globalThis.Record<string, unknown>;
  };

export interface AnimationsFormat {
  notReactive: SingleAnimationFormat[];
}
export interface SingleAnimationFormat {
  name: string;
  type: string;
  selector: string;
}

export interface MediaTrace {
  images: MediaFormat[];
  videos: MediaFormat[];
}

export interface MediaFormat {
  [key: string]: string | boolean | any[];
}

export interface RobotsFormat {
  agents: {
    [key: string]: {
      allow: string[];
      disallow: string[];
    };
  };
  allow: string[];
  disallow: string[];
  sitemaps: string[];
  host: string;
}

export interface ConsoleMessageFormat {
  type: string;
  text: string;
}

export interface PerformanceFormat {
  perf: PerformanceResourceTiming[];
}

export type SubfontFormat = {
  name: string;
  value: FontInformation;
};

export interface GHOutput {
  [key: string]: FontInformation;
}

export interface ScreenShotFormat {
  power: number;
  hasDarkMode: boolean;
}

export interface LazyMediaFormat {
  lazyImages: string[];
  lazyVideos: string[];
}

export interface RGBPowerFormat {
  r: number;
  g: number;
  b: number;
}
export interface FontInformation {
  glyphs: string[];
  weights: number[];
  styles: string[];
}

export interface MetaTag {
  [key: string]: string;
}

export interface MetaTagFormat {
  attr: MetaTag[];
}

export interface AccessibilityAuditFormat {
  code: string;
  heading: string;
  result: AccessibilityResultType;
  severity: string;
  url: string;
  elements: string;
}

export interface AccessibilityFormat {
  audit: AccessibilityAuditFormat[];
  report: string;
}

export type AccessibilityResultType = "PASS" | "FAIL" | "NA";
export interface Metrics {
  /** The timestamp when the metrics sample was taken. */
  Timestamp?: number;
  /** Number of documents in the page. */
  Documents?: number;
  /** Number of frames in the page. */
  Frames?: number;
  /** Number of events in the page. */
  JSEventListeners?: number;
  /** Number of DOM nodes in the page. */
  Nodes?: number;
  /** Total number of full or partial page layout. */
  LayoutCount?: number;
  /** Total number of page style recalculations. */
  RecalcStyleCount?: number;
  /** Combined durations of all page layouts. */
  LayoutDuration?: number;
  /** Combined duration of all page style recalculations. */
  RecalcStyleDuration?: number;
  /** Combined duration of JavaScript execution. */
  ScriptDuration?: number;
  /** Combined duration of all tasks performed by the browser. */
  TaskDuration?: number;
  /** Used JavaScript heap size. */
  JSHeapUsedSize?: number;
  /** Total JavaScript heap size. */
  JSHeapTotalSize?: number;
}

export interface CssTrace {
  sheets: Sheets[];
  info: StyleInfo;
}

export interface Sheets {
  url: string;
  text: string;
}

export interface Scripts {
  url: string;
  text: string;
}

export interface StyleInfo {
  styleHrefs: Stylesheets[];
  styles: InlineStyles[];
}

export interface Stylesheets {
  src: string;
  attr: string[];
}

export interface InlineStyles {
  src: string;
  text: string;
  size: number;
}

export interface JsTrace {
  scripts: Scripts[];
  info: ScriptInfo;
}

export interface ScriptInfo {
  scriptSrcs: Scriptfiles[];
  scripts: InlineScripts[];
}
export interface Scriptfiles {
  src: string;
  attr: string[];
}

export interface InlineScripts {
  src: string;
  text: string;
  size: number;
}

export interface Record {
  request: Request;
  response: Response;
  CDP: CDPData;
}

export interface RequestResponse {
  request: Request;
  response: Response;
}

export interface ProtocolData {
  protocol: string;
  requestId: string;
}

export interface CDPDataPrivate {
  requestId: string;
  encodedDataLength: number;
}

export interface Request {
  requestId: string;
  url: URL;
  resourceType: ResourceType;
  method: HttpMethod;
  headers: Headers;
  protocol?: string;
  timestamp: number;
}
export type HttpMethod =
  | "GET"
  | "POST"
  | "PATCH"
  | "PUT"
  | "DELETE"
  | "OPTIONS"
  | string;

export type ResourceType =
  | "document"
  | "stylesheet"
  | "image"
  | "media"
  | "font"
  | "script"
  | "texttrack"
  | "xhr"
  | "fetch"
  | "eventsource"
  | "websocket"
  | "manifest"
  | "signedexchange"
  | "other"
  | "ping"
  | "cspviolationreport"
  | "preflight";

export type Headers = globalThis.Record<string, string>;

export type ByteUnits = "bytes" | "kb" | "mb" | "gb";

export interface Response {
  remoteAddress: HostAddress;
  status: number;
  url: URL;
  fromServiceWorker: boolean;
  headers: Headers;
  uncompressedSize: ByteFormat;
  gzipSize: ByteFormat;
  timestamp: number;
  nonWebPImageEstimatedSavings?: number;
}

export interface ByteFormat {
  value: number;
  units: ByteUnits;
}

export interface SecurityDetails {
  subjectName: string;
  issuer: string;
  validFrom: number;
  validTo: number;
  protocol: string;
}
export interface HostAddress {
  ip: string;
  port: number;
}

export interface CDPData {
  compressedSize: ByteFormat;
}

export interface FailedRequest {
  url: string;
  code: number;
  failureText?: string | undefined;
  requestId: string;
}

export interface RedirectResponse {
  requestId: string;
  url: string;
  redirectsTo: string;
}

export interface ServerFormat {
  energySource: EnergySourceFormat | undefined;
  hosts: string[];
}

export interface EnergySourceFormat {
  isGreen: boolean;
  hostedby: string | undefined;
}

/**
	Return Types for Collectors
*/
export interface CollectAssetsTraces {
  css: CssTrace;
  js: JsTrace;
}

export interface CollectConsoleTraces {
  console: ConsoleMessageFormat[];
}

export interface CollectScreenShotTraces {
  screenshot: ScreenShotFormat;
}

export interface CollectFailedTransferTraces {
  failed: FailedRequest[];
}

export interface CollectHtmlTraces {
  html: string[];
}
export interface CollectMediaTraces {
  media: MediaTrace;
}

export interface CollectPerformanceTraces {
  performance: PerformanceFormat;
}

export interface CollectRedirectTraces {
  redirect: RedirectResponse[];
  server: ServerFormat;
}

export interface CollectSubfontsTraces {
  fonts: SubfontFormat[];
}

export interface CollectAccessibilityTraces {
  accessibility: AccessibilityFormat;
}

export interface CollectTransferTraces {
  record: Record[];
}

export interface CollectLazyMediaTraces {
  lazyMedia: LazyMediaFormat;
}

export interface CollectAnimationsTraces {
  animations: AnimationsFormat | undefined;
}

export interface CollectCookiesTraces {
  cookies: Cookie[];
}

export interface CollectRobotsTraces {
  robots: RobotsFormat;
}

export interface CollectMetaTagsTraces {
  metatag: MetaTagFormat[];
}

export type CollectType =
  | CollectHtmlTraces
  | CollectAssetsTraces
  | CollectMediaTraces
  | CollectConsoleTraces
  | CollectRedirectTraces
  | CollectSubfontsTraces
  | CollectTransferTraces
  | CollectPerformanceTraces
  | CollectFailedTransferTraces
  | CollectLazyMediaTraces
  | CollectMediaTraces
  | CollectMetaTagsTraces
  | CollectScreenShotTraces
  | CollectCookiesTraces
  | CollectAnimationsTraces
  | CollectRobotsTraces
  | CollectAccessibilityTraces
  | undefined;
