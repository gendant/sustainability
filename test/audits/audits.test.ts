import AvoidableBotTrafficAudit from "../../src/audits/AvoidableBotTraffic.audit";
import AvoidInlineAssetsAudit from "../../src/audits/AvoidInlineAssets.audit";
import AvoidURLRedirectsAudit from "../../src/audits/AvoidURLRedirects.audits";
import CarbonFootprintAudit from "../../src/audits/CarbonFootprint.audit";
import CookieOptimisation from "../../src/audits/CookieOptimisation.audit";
import LeverageBrowserCachingAudit from "../../src/audits/LeverageBrowserCaching.audit";
import NoConsoleLogsAudit from "../../src/audits/NoConsoleLogs.audit";
import PixelEnergyEfficiencyAudit from "../../src/audits/PixelEnergyEfficiency.audit";
import ReactiveAnimationsAudit from "../../src/audits/ReactiveAnimations.audit";
import UsesCompressionAudit from "../../src/audits/UsesCompression.audit";
import UsesDarkModeAudit from "../../src/audits/UsesDarkMode.audit";
import UsesFontSubsettingAudit from "../../src/audits/UsesFontSubsetting.audit";
import UsesGreenServerAudit from "../../src/audits/UsesGreenServer.audit";
import UsesHTTP2Audit from "../../src/audits/UsesHTTP2.audit";
import UsesLazyLoadingAudit from "../../src/audits/UsesLazyLoading.audit";
import UsesWebmVideoFormatAudit from "../../src/audits/UsesWebmVideoFormat.audit";
import UsesWebpImageFormatAudit from "../../src/audits/UsesWebpImageFormat.audit";
import { Result } from "../../src/types/audit";
import {
  AnimationsFormat,
  ConsoleMessageFormat,
  Headers,
  InlineScripts,
  InlineStyles,
  MediaFormat,
  MetaTagFormat,
  Record,
  RedirectResponse,
  RobotsFormat,
  Sheets,
  SubfontFormat,
  Traces,
} from "../../src/types/traces";

const traces = {
  server: { hosts: ["localhost"] },
  cookies: [
    {
      name: "fatCookie",
      value: "true",
      domain: "localhost",
      expires: -1,
      httpOnly: false,
      path: "/",
      secure: false,
      session: true,
      size: 1030,
    },
    {
      name: "dupCookie",
      value: "true",
      domain: "localhost",
      expires: -1,
      httpOnly: false,
      path: "/",
      secure: false,
      session: true,
      size: 55,
    },
    {
      name: "dupCookie",
      value: "true",
      domain: "localhost",
      expires: -1,
      httpOnly: false,
      path: "/",
      secure: false,
      session: true,
      size: 55,
    },
  ],
} as Traces;

const skipTraces = {
  server: { hosts: ["localhost"] },
} as Traces;

describe("CookieOptimisation Audit", () => {
  it("fails when has big sized cookies or/and duplicated cookies", async () => {
    const auditResult = await CookieOptimisation.audit(traces);
    expect(auditResult?.extendedInfo?.value.size).toEqual([
      { name: "fatCookie", size: 1030 },
    ]);
    expect(auditResult?.extendedInfo?.value.dup).toEqual(["dupCookie"]);
  });
  it("extendedInfo only contains dup field when only duplicated cookies found", async () => {
    const auditResult = (await CookieOptimisation.audit({
      server: {
        hosts: ["localhost"],
      },
      cookies: [
        {
          name: "cookie",
          value: "true",
          domain: "localhost",
          expires: -1,
          httpOnly: false,
          path: "/",
          secure: false,
          session: true,
          size: 55,
        },
        {
          name: "dupCookie",
          value: "true",
          domain: "localhost",
          expires: -1,
          httpOnly: false,
          path: "/",
          secure: false,
          session: true,
          size: 55,
        },
        {
          name: "dupCookie",
          value: "true",
          domain: "localhost",
          expires: -1,
          httpOnly: false,
          path: "/",
          secure: false,
          session: true,
          size: 55,
        },
      ],
    } as Traces)) as Result;
    expect(auditResult?.extendedInfo?.value).toHaveProperty("dup");
  });
  it("extendedInfo only contains size field when only big sized cookies found", async () => {
    const auditResult = (await CookieOptimisation.audit({
      server: {
        hosts: ["localhost"],
      },
      cookies: [
        {
          name: "cookie",
          value: "true",
          domain: "localhost",
          expires: -1,
          httpOnly: false,
          path: "/",
          secure: false,
          session: true,
          size: 5555,
        },
      ],
    } as Traces)) as Result;

    expect(auditResult?.extendedInfo?.value).toHaveProperty("size");
  });
  it("ignores cross site cookies", () => {
    const auditResult = CookieOptimisation.audit({
      server: {
        hosts: ["localhost"],
      },
      cookies: [
        {
          name: "ga-cookie",
          value: "true",
          domain: "google.com",
          expires: -1,
          httpOnly: false,
          path: "/",
          secure: false,
          session: true,
          size: 55,
        },
      ],
    } as Traces);
    const auditResultKeys = Object.keys(!auditResult);
    expect(auditResultKeys.includes("extendedInfo")).toBeFalsy();
  });
  it("big sized cookies dont include duplications if any", async () => {
    const auditResult = await CookieOptimisation.audit({
      server: {
        hosts: ["localhost"],
      },
      cookies: [
        {
          name: "cookie",
          value: "true",
          domain: "localhost",
          expires: -1,
          httpOnly: false,
          path: "/",
          secure: false,
          session: true,
          size: 5555,
        },
        {
          name: "cookie",
          value: "true",
          domain: "localhost",
          expires: -1,
          httpOnly: false,
          path: "/",
          secure: false,
          session: true,
          size: 5555,
        },
      ],
    } as Traces);
    expect(auditResult?.extendedInfo?.value.size).toEqual([
      { name: "cookie", size: 5555 },
    ]);
  });
  it("skips when no cookie are in traces", async () => {
    const auditResult = await CookieOptimisation.audit({
      server: { hosts: ["localhost"] },
    } as Traces);
    expect(auditResult?.scoreDisplayMode).toEqual("skip");
  });

  it("handles errors", async () => {
    const auditResult = await CookieOptimisation.audit({} as Traces);
    expect(auditResult?.scoreDisplayMode).toEqual("skip");
  });
});

describe("LeverageBrowserCaching audit", () => {
  it("ignores cross site assets", async () => {
    const auditResult = await LeverageBrowserCachingAudit.audit({
      server: {
        hosts: ["localhost"],
      },
      record: [
        {
          request: {
            requestId: "1234",
            url: new URL("http://cross-site.com/"),
            resourceType: "document",
            method: "GET",
            headers: {
              "upgrade-insecure-requests": "1",
              "user-agent":
                "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36",
            } as Headers,
            timestamp: 16722928282,
            protocol: "h2",
          },
          response: {
            remoteAddress: { ip: "127.0.0.1", port: 80 },
            status: 200,
            url: new URL("http://cross-site.com"),
            headers: {
              "cache-control": "max-age=3600",
              "content-encoding": "gzip",
              "content-type": "text/html; charset=utf-8",
              etag: '"6f25c8912f4b42cfc3fca864f68b6d9987df90613d6e0085f493802eb977c926"',
              "last-modified": "Fri, 24 Jul 2020 16:54:16 GMT",
              "strict-transport-security": "max-age=31556926",
              "accept-ranges": "bytes",
              date: "Mon, 18 Jan 2021 18:37:01 GMT",
              "x-served-by": "cache-mad22063-MAD",
              "x-cache": "MISS",
              "x-cache-hits": "0",
              "x-timer": "S1610995021.741490,VS0,VE748",
              vary: "x-fh-requested-host, accept-encoding",
              "content-length": "436",
            } as Headers,
            uncompressedSize: { value: 123, units: "bytes" },
            gzipSize: { value: 0, units: "bytes" },
            timestamp: 16782829292,
            fromServiceWorker: false,
          },
          CDP: {
            compressedSize: { value: 123, units: "bytes" },
          },
        },
      ],
    } as Traces);

    expect(auditResult.score).toEqual(1);
  });
  it("ignores non cacheable assets (resource type)", async () => {
    const auditResult = await LeverageBrowserCachingAudit.audit({
      server: { hosts: ["localhost"] },
      record: [
        {
          request: {
            requestId: "1234",
            url: new URL("http://localhost/"),
            resourceType: "websocket",
            method: "GET",
            headers: {
              "upgrade-insecure-requests": "1",
              "user-agent":
                "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36",
            } as Headers,
            timestamp: 16722928282,
            protocol: "h2",
          },
          response: {
            remoteAddress: { ip: "127.0.0.1", port: 80 },
            status: 301,
            url: new URL("http://localhost"),
            headers: {
              "cache-control": "max-age=3600",
              "content-encoding": "gzip",
              "content-type": "text/html; charset=utf-8",
              etag: '"6f25c8912f4b42cfc3fca864f68b6d9987df90613d6e0085f493802eb977c926"',
              "last-modified": "Fri, 24 Jul 2020 16:54:16 GMT",
              "strict-transport-security": "max-age=31556926",
              "accept-ranges": "bytes",
              date: "Mon, 18 Jan 2021 18:37:01 GMT",
              "x-served-by": "cache-mad22063-MAD",
              "x-cache": "MISS",
              "x-cache-hits": "0",
              "x-timer": "S1610995021.741490,VS0,VE748",
              vary: "x-fh-requested-host, accept-encoding",
              "content-length": "436",
            } as Headers,
            uncompressedSize: { value: 123, units: "bytes" },
            gzipSize: { value: 0, units: "bytes" },
            timestamp: 16782829292,
            fromServiceWorker: false,
          },
          CDP: {
            compressedSize: { value: 123, units: "bytes" },
          },
        },
      ],
    } as Traces);
    expect(auditResult.score).toEqual(1);
  });
  it("ignores assets with implicit non caching policy in request headers", async () => {
    const auditResult = await LeverageBrowserCachingAudit.audit({
      server: { hosts: ["localhost"] },
      record: [
        {
          request: {
            requestId: "1234",
            url: new URL("http://localhost/"),
            resourceType: "script",
            method: "GET",
            headers: {
              "upgrade-insecure-requests": "1",
              "user-agent":
                "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36",
            } as Headers,
            timestamp: 16722928282,
            protocol: "h2",
          },
          response: {
            remoteAddress: { ip: "127.0.0.1", port: 80 },
            status: 200,
            url: new URL("http://localhost"),
            headers: {
              "cache-control": "no-cache",
              "content-encoding": "gzip",
              "content-type": "text/html; charset=utf-8",
              etag: '"6f25c8912f4b42cfc3fca864f68b6d9987df90613d6e0085f493802eb977c926"',
              "last-modified": "Fri, 24 Jul 2020 16:54:16 GMT",
              "strict-transport-security": "max-age=31556926",
              "accept-ranges": "bytes",
              date: "Mon, 18 Jan 2021 18:37:01 GMT",
              "x-served-by": "cache-mad22063-MAD",
              "x-cache": "MISS",
              "x-cache-hits": "0",
              "x-timer": "S1610995021.741490,VS0,VE748",
              vary: "x-fh-requested-host, accept-encoding",
              "content-length": "436",
            } as Headers,
            uncompressedSize: { value: 123, units: "bytes" },
            gzipSize: { value: 0, units: "bytes" },
            timestamp: 16782829292,
            fromServiceWorker: false,
          },
          CDP: {
            compressedSize: { value: 123, units: "bytes" },
          },
        },
      ],
    } as Traces);

    expect(auditResult.score).toEqual(1);
  });
  it("ignores assets with invalid cache lifetime", async () => {
    const auditResult = await LeverageBrowserCachingAudit.audit({
      server: { hosts: ["localhost"] },
      record: [
        {
          request: {
            requestId: "1234",
            url: new URL("http://localhost/"),
            resourceType: "script",
            method: "GET",
            headers: {
              "upgrade-insecure-requests": "1",
              "user-agent":
                "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36",
            } as Headers,
            timestamp: 16722928282,
            protocol: "h2",
          },
          response: {
            remoteAddress: { ip: "127.0.0.1", port: 80 },
            status: 200,
            url: new URL("http://localhost"),
            headers: {
              "cache-control": "max-age=0",
              "content-encoding": "gzip",
              "content-type": "text/html; charset=utf-8",
              etag: '"6f25c8912f4b42cfc3fca864f68b6d9987df90613d6e0085f493802eb977c926"',
              "last-modified": "Fri, 24 Jul 2020 16:54:16 GMT",
              "strict-transport-security": "max-age=31556926",
              "accept-ranges": "bytes",
              date: "Mon, 18 Jan 2021 18:37:01 GMT",
              "x-served-by": "cache-mad22063-MAD",
              "x-cache": "MISS",
              "x-cache-hits": "0",
              "x-timer": "S1610995021.741490,VS0,VE748",
              vary: "x-fh-requested-host, accept-encoding",
              "content-length": "436",
            } as Headers,
            uncompressedSize: { value: 123, units: "bytes" },
            gzipSize: { value: 0, units: "bytes" },
            timestamp: 16782829292,
            fromServiceWorker: false,
          },
          CDP: {
            compressedSize: { value: 123, units: "bytes" },
          },
        },
      ],
    } as Traces);
    expect(auditResult.score).toEqual(1);
  });
  it("ignores assets with cache hit probability higher than threshold", async () => {
    const auditResult = await LeverageBrowserCachingAudit.audit({
      server: { hosts: ["localhost"] },
      record: [
        {
          request: {
            requestId: "1234",
            url: new URL("http://localhost/"),
            resourceType: "script",
            method: "GET",
            headers: {
              "upgrade-insecure-requests": "1",
              "user-agent":
                "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36",
            } as Headers,
            timestamp: 16722928282,
            protocol: "h2",
          },
          response: {
            remoteAddress: { ip: "127.0.0.1", port: 80 },
            status: 200,
            url: new URL("http://localhost"),
            headers: {
              "cache-control": "max-age=31536000",
              "content-encoding": "gzip",
              "content-type": "text/html; charset=utf-8",
              etag: '"6f25c8912f4b42cfc3fca864f68b6d9987df90613d6e0085f493802eb977c926"',
              "last-modified": "Fri, 24 Jul 2020 16:54:16 GMT",
              "strict-transport-security": "max-age=31556926",
              "accept-ranges": "bytes",
              date: "Mon, 18 Jan 2021 18:37:01 GMT",
              "x-served-by": "cache-mad22063-MAD",
              "x-cache": "MISS",
              "x-cache-hits": "0",
              "x-timer": "S1610995021.741490,VS0,VE748",
              vary: "x-fh-requested-host, accept-encoding",
              "content-length": "436",
            } as Headers,
            uncompressedSize: { value: 123, units: "bytes" },
            gzipSize: { value: 0, units: "bytes" },
            timestamp: 16782829292,
            fromServiceWorker: false,
          },
          CDP: {
            compressedSize: { value: 123, units: "bytes" },
          },
        },
      ],
    } as Traces);
    expect(auditResult.score).toEqual(1);
  });
  it("extendedInfo has totalWastedBytes and records field for failed audits", async () => {
    const auditResult = await LeverageBrowserCachingAudit.audit({
      server: { hosts: ["localhost"] },
      record: [
        {
          request: {
            requestId: "1234",
            url: new URL("http://localhost/"),
            resourceType: "script",
            method: "GET",
            headers: {
              "upgrade-insecure-requests": "1",
              "user-agent":
                "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36",
            } as Headers,
            timestamp: 16722928282,
            protocol: "h2",
          },
          response: {
            remoteAddress: { ip: "127.0.0.1", port: 80 },
            status: 200,
            url: new URL("http://localhost"),
            headers: {
              "cache-control": "max-age=",
              "content-encoding": "gzip",
              "content-type": "text/html; charset=utf-8",
              etag: '"6f25c8912f4b42cfc3fca864f68b6d9987df90613d6e0085f493802eb977c926"',
              "last-modified": "Fri, 24 Jul 2020 16:54:16 GMT",
              "strict-transport-security": "max-age=31556926",
              "accept-ranges": "bytes",
              date: "Mon, 18 Jan 2021 18:37:01 GMT",
              "x-served-by": "cache-mad22063-MAD",
              "x-cache": "MISS",
              "x-cache-hits": "0",
              "x-timer": "S1610995021.741490,VS0,VE748",
              vary: "x-fh-requested-host, accept-encoding",
              "content-length": "436",
            } as Headers,
            uncompressedSize: { value: 160000, units: "bytes" },
            gzipSize: { value: 0, units: "bytes" },
            timestamp: 16782829292,
            fromServiceWorker: false,
          },
          CDP: {
            compressedSize: { value: 140000, units: "bytes" },
          },
        },
      ],
    } as Traces);
    expect(auditResult.score).toBeLessThan(1);
    expect(auditResult?.extendedInfo?.value.totalWastedBytes).toBeTruthy();
    expect(auditResult?.extendedInfo?.value.records).toBeTruthy();
  });
  it("handles errors", async () => {
    const auditResult = await LeverageBrowserCachingAudit.audit({} as Traces);
    expect(auditResult?.scoreDisplayMode).toEqual("skip");
  });
});

describe("NoConsoleLogs audit", () => {
  it("ignores duplicated console logs", async () => {
    const auditResult = await NoConsoleLogsAudit.audit({
      console: [
        { text: "digital sustainability audits", type: "text" },
        { text: "digital sustainability audits", type: "text" },
      ],
    } as Traces);

    expect(auditResult.score).toBe(0);
    expect(auditResult?.extendedInfo?.value.length).toBe(1);
  });

  it("passess successful audits", async () => {
    const auditResult = await NoConsoleLogsAudit.audit({
      console: [] as ConsoleMessageFormat[],
    } as Traces);
    expect(auditResult.score).toBe(1);
  });
  it("fails audits without console trace (error)", async () => {
    const auditResult = await NoConsoleLogsAudit.audit({} as Traces);
    expect(auditResult.scoreDisplayMode).toBe("skip");
  });
});
describe("PixelEnergyEfficiency audit", () => {
  it("passess successful audits", async () => {
    const auditResult = await PixelEnergyEfficiencyAudit.audit({
      screenshot: { power: 10 },
    } as Traces);
    expect(auditResult.score).toBe(1);
  });
  it("handles errors", async () => {
    const auditResult = await PixelEnergyEfficiencyAudit.audit({} as Traces);
    expect(auditResult?.scoreDisplayMode).toEqual("skip");
  });
});
describe("ReactiveAnimations audit", () => {
  it("skips when no animations in traces", async () => {
    const auditResult = await ReactiveAnimationsAudit.audit({} as Traces);
    expect(auditResult.scoreDisplayMode).toEqual("skip");
  });
  it("passes successful audits", async () => {
    const auditResult = (await ReactiveAnimationsAudit.audit({
      animations: { notReactive: [] } as AnimationsFormat,
    } as Traces)) as Result;
    expect(auditResult.score).toBe(1);
  });
  it("fails audits with non reactive animations", async () => {
    const auditResult = (await ReactiveAnimationsAudit.audit({
      animations: {
        notReactive: [{ name: "anim", type: "CSS", selector: "#myanim" }],
      },
    } as Traces)) as Result;
    expect(auditResult.score).toBe(0);
  });

  it("handles errors", async () => {
    const auditResult = await ReactiveAnimationsAudit.audit({} as Traces);
    expect(auditResult?.scoreDisplayMode).toEqual("skip");
  });
});
describe("UsesCompression audit", () => {
  it("ignores records with invalid gzip size (0 bytes)", async () => {
    const auditResult = await UsesCompressionAudit.audit({
      server: { hosts: ["localhost"] },
      record: [
        {
          request: {},
          response: {
            uncompressedSize: { value: 1000, units: "bytes" },
            gzipSize: { value: 0, units: "bytes" },
            headers: { "content-type": "text/javascript" } as Headers,
          },
          CDP: {
            compressedSize: { value: 1000, units: "bytes" },
          },
        },
      ],
    } as Traces);
    expect(auditResult.score).toBe(1);
  });
  it("ignores records with invalid MIME types", async () => {
    const auditResult = await UsesCompressionAudit.audit({
      server: { hosts: ["localhost"] },
      record: [
        {
          request: {},
          response: {
            uncompressedSize: { value: 1500, units: "bytes" },
            gzipSize: { value: 700, units: "bytes" },
            headers: { "content-type": "image/webp" } as Headers,
          },
          CDP: {
            compressedSize: { value: 1000, units: "bytes" },
          },
        },
      ],
    } as Traces);
    expect(auditResult.score).toBe(1);
  });
  it("ignores records with gzip savings lower than threshold", async () => {
    const auditResult = await UsesCompressionAudit.audit({
      server: { hosts: ["localhost"] },
      record: [
        {
          request: {
            url: new URL("http://localhost"),
          },
          response: {
            uncompressedSize: { value: 250, units: "bytes" },
            gzipSize: { value: 200, units: "bytes" },
            headers: { "content-type": "text/javascript" } as Headers,
          },
          CDP: {
            compressedSize: { value: 1000, units: "bytes" },
          },
        },
      ],
    } as Traces);
    expect(auditResult.score).toBe(1);
  });
  it("ignores records already compressed", async () => {
    const auditResult = await UsesCompressionAudit.audit({
      server: { hosts: ["localhost"] },
      record: [
        {
          request: {},
          response: {
            uncompressedSize: { value: 2500, units: "bytes" },
            gzipSize: { value: 1500, units: "bytes" },
            headers: { "content-type": "text/javascript" } as Headers,
          },
          CDP: {
            compressedSize: { value: 1800, units: "bytes" },
          },
        },
      ],
    } as Traces);
    expect(auditResult.score).toBe(1);
  });
  it("ignores records with compressed size lower than gzipped size", async () => {
    const auditResult = await UsesCompressionAudit.audit({
      server: { hosts: ["localhost"] },
      record: [
        {
          request: {},
          response: {
            uncompressedSize: { value: 1000, units: "bytes" },
            gzipSize: { value: 800, units: "bytes" },
            headers: { "content-type": "text/javascript" } as Headers,
          },
          CDP: {
            compressedSize: { value: 300, units: "bytes" },
          },
        },
      ],
    } as Traces);
    expect(auditResult.score).toBe(1);
  });
  it("ignores cross-site requests", async () => {
    const auditResult = await UsesCompressionAudit.audit({
      server: { hosts: ["localhost"] },
      record: [
        {
          request: {
            url: new URL("https://www.google.com"),
          },
          response: {
            headers: { "content-type": "text/javascript" } as Headers,
            uncompressedSize: { value: 1500, units: "bytes" },
            gzipSize: { value: 400, units: "bytes" },
          },
          CDP: {
            compressedSize: { value: 1400, units: "bytes" },
          },
        },
      ],
    } as Traces);
    expect(auditResult.score).toBe(1);
  });
  it("reports low nginx gzip compression level", async () => {
    const auditResult = await UsesCompressionAudit.audit({
      server: { hosts: ["localhost"] },
      record: [
        {
          request: {
            url: new URL("http://localhost"),
          },
          response: {
            uncompressedSize: { value: 1000, units: "bytes" },
            gzipSize: { value: 400, units: "bytes" },
            headers: {
              server: "NGINX",
              "content-type": "text/javascript",
            } as Headers,
          },
          CDP: {
            compressedSize: { value: 950, units: "bytes" },
          },
        },
      ],
    } as Traces);
    expect(auditResult.score).toBe(0);
    expect(auditResult).toHaveProperty("errorMessage");
  });
  it("ignores repeated records", async () => {
    const auditResult = await UsesCompressionAudit.audit({
      server: { hosts: ["localhost"] },
      record: [
        {
          request: {
            url: new URL("http://localhost"),
          },
          response: {
            uncompressedSize: { value: 950, units: "bytes" },
            gzipSize: { value: 400, units: "bytes" },
            headers: { "content-type": "text/javascript" } as Headers,
          },
          CDP: {
            compressedSize: { value: 900, units: "bytes" },
          },
        },
        {
          request: {
            url: new URL("http://localhost"),
          },
          response: {
            uncompressedSize: { value: 950, units: "bytes" },
            gzipSize: { value: 400, units: "bytes" },
            headers: { "content-type": "text/javascript" } as Headers,
          },
          CDP: {
            compressedSize: { value: 900, units: "bytes" },
          },
        },
      ],
    } as Traces);
    expect(auditResult.score).toBe(0);
    expect(auditResult?.extendedInfo?.value.length).toEqual(1);
  });

  it("handles errors", async () => {
    const auditResult = await UsesCompressionAudit.audit({} as Traces);
    expect(auditResult?.scoreDisplayMode).toEqual("skip");
  });
});

describe("UsesDarkMode audit", () => {
  it("passess successful audits", async () => {
    const auditResult = await UsesDarkModeAudit.audit({
      screenshot: { hasDarkMode: true },
    } as Traces);
    expect(auditResult.score).toBe(1);
  });
  it("handles errors", async () => {
    const auditResult = await UsesDarkModeAudit.audit({} as Traces);
    expect(auditResult?.scoreDisplayMode).toEqual("skip");
  });
});

describe("UsesFontSubsetting audit", () => {
  it("skips audits without css traces", async () => {
    const auditResult = await UsesFontSubsettingAudit.audit({
      css: {
        sheets: [] as Sheets[],
        info: {
          styles: [] as InlineStyles[],
        },
      },
    } as Traces);
    expect(auditResult.scoreDisplayMode).toEqual("skip");
  });
  it("skips audits without font traces", async () => {
    const auditResult = await UsesFontSubsettingAudit.audit({
      css: {
        sheets: [
          {
            text: `@font-face {
                                font-family: myFirstFont;
                                src: url(sansation_light.woff);
                                }`,
            url: "http://localhost/styles.css",
          },
        ],
        info: {
          styles: [] as InlineStyles[],
        },
      },
      fonts: [] as SubfontFormat[],
    } as Traces);
    expect(auditResult.scoreDisplayMode).toEqual("skip");
  });

  it("skips audits without at least one resource of font type", async () => {
    const auditResult = await UsesFontSubsettingAudit.audit({
      record: [
        {
          request: {
            resourceType: "script",
          },
        },
      ],
      css: {
        sheets: [
          {
            text: `@font-face {
                                font-family: sensation;
                                src: url(sensation_light.woff);
                                }`,
            url: "http://localhost/styles.css",
          },
        ],
        info: {
          styles: [] as InlineStyles[],
        },
      },
      fonts: [
        {
          name: "sensation",
          value: {
            glyphs: ["U+32"],
            weights: [300],
            styles: ["light"],
          },
        },
      ],
    } as Traces);
    expect(auditResult.scoreDisplayMode).toEqual("skip");
  });
  it("passess successful audits", async () => {
    const auditResult = (await UsesFontSubsettingAudit.audit({
      record: [
        {
          request: {
            resourceType: "font",
          },
        },
      ],
      css: {
        sheets: [
          {
            text: `@font-face {
                                font-family: sensation;
                                src: url(sensation_light.woff);
                                unicode-range:'U+32'
                                }`,
            url: "http://localhost/styles.css",
          },
        ],
        info: {
          styles: [] as InlineStyles[],
        },
      },
      fonts: [
        {
          name: "sensation",
          value: {
            glyphs: ["U+32"],
            weights: [300],
            styles: ["light"],
          },
        },
      ],
    } as Traces)) as Result;
    expect(auditResult.score).toEqual(1);
  });
  it("fails on audits which have not subset fonts and reports their name and the set of glyphs", async () => {
    const auditResult = (await UsesFontSubsettingAudit.audit({
      record: [
        {
          request: {
            resourceType: "font",
          },
        },
      ],
      css: {
        sheets: [
          {
            text: `@font-face {
                                font-family: sensation;
                                src: url(sensation_light.woff);
                                }`,
            url: "http://localhost/styles.css",
          },
        ],
        info: {
          styles: [] as InlineStyles[],
        },
      },
      fonts: [
        {
          name: "sensation",
          value: {
            glyphs: ["U+32"],
            weights: [300],
            styles: ["light"],
          },
        },
      ],
    } as Traces)) as Result;
    expect(auditResult.score).toEqual(0);
    expect(auditResult.extendedInfo?.value[0].value).toHaveProperty("glyphs");
    expect(auditResult.extendedInfo?.value[0]).toHaveProperty("name");
  });

  it("fails on audits without font face property", async () => {
    const auditResult = (await UsesFontSubsettingAudit.audit({
      record: [
        {
          request: {
            resourceType: "font",
          },
        },
      ],
      css: {
        sheets: [
          {
            text: `.center{
                            text-align:center
                        }`,
            url: "http://localhost/styles.css",
          },
        ],
        info: {
          styles: [] as InlineStyles[],
        },
      },
      fonts: [
        {
          name: "sensation",
          value: {
            glyphs: ["U+32"],
            weights: [300],
            styles: ["light"],
          },
        },
      ],
    } as Traces)) as Result;
    expect(auditResult.score).toEqual(0);
  });
  it("reports trace fontnames when those were not obtained when walking the css styles", async () => {
    const auditResult = (await UsesFontSubsettingAudit.audit({
      record: [
        {
          request: {
            resourceType: "font",
          },
        },
      ],
      css: {
        sheets: [
          {
            text: `@font-face {
                                src: url(sensation_light.woff);
                                }`,
            url: "http://localhost/styles.css",
          },
        ],
        info: {
          styles: [] as InlineStyles[],
        },
      },
      fonts: [
        {
          name: "sensation",
          value: {
            glyphs: ["U+32"],
            weights: [300],
            styles: ["light"],
          },
        },
      ],
    } as Traces)) as Result;
    expect(auditResult.score).toEqual(0);
    expect(auditResult.extendedInfo?.value[0].name).toEqual("sensation");
  });
  it("handles errors", async () => {
    const auditResult = await UsesFontSubsettingAudit.audit({} as Traces);
    expect(auditResult?.scoreDisplayMode).toEqual("skip");
  });
});
describe("UsesGreenServer audit", () => {
  it("passess on audits with green origin servers", async () => {
    const auditResult = (await UsesGreenServerAudit.audit({
      server: {
        hosts: ["localhost"],
        energySource: { isGreen: true, hostedby: "you-know" },
      },
      record: [
        {
          response: {
            url: new URL("http://localhost"),
          },
        },
      ],
    } as Traces)) as Result;

    expect(auditResult.score).toEqual(1);
  });
  it("works when API response is fetched", async () => {
    const auditResult = (await UsesGreenServerAudit.audit({
      server: { hosts: ["localhost"], energySource: { isGreen: false } },
      record: [
        {
          response: {
            url: new URL("http://localhost"),
          },
        },
      ],
    } as Traces)) as Result;

    expect(auditResult.score).toEqual(0);
  });
  it("skips when API response is undefined", async () => {
    const auditResult = await UsesGreenServerAudit.audit({
      server: { hosts: ["localhost"], energySource: undefined },
      record: [
        {
          response: {
            url: new URL("http://localhost"),
          },
        },
      ],
    } as Traces);

    expect(auditResult?.scoreDisplayMode).toEqual("skip");
  });
  it("skips when API response has error", async () => {
    const auditResult = await UsesGreenServerAudit.audit({
      server: { hosts: ["localhost"], energySource: undefined },
      record: [
        {
          response: {
            url: new URL("http://localhost"),
          },
        },
      ],
    } as Traces);

    expect(auditResult?.scoreDisplayMode).toEqual("skip");
  });
  it("handles errors", async () => {
    const auditResult = await UsesGreenServerAudit.audit({} as Traces);
    expect(auditResult?.scoreDisplayMode).toEqual("skip");
  });
});
describe("UsesHTTP2 audit", () => {
  it("ignores request without a protocol field", async () => {
    const auditResult = await UsesHTTP2Audit.audit({
      server: { hosts: ["localhost"] },
      record: [
        {
          request: {},
        },
      ],
    } as Traces);
    expect(auditResult.score).toEqual(1);
  });
  it("ignores responses served from service workers", async () => {
    const auditResult = await UsesHTTP2Audit.audit({
      server: { hosts: ["localhost"] },
      record: [
        {
          request: {
            protocol: "h2",
          },
          response: {
            fromServiceWorker: true,
          },
        },
      ],
    } as Traces);
    expect(auditResult.score).toEqual(1);
  });

  it("ignores cross site requests", async () => {
    const auditResult = await UsesHTTP2Audit.audit({
      server: { hosts: ["localhost"] },
      record: [
        {
          request: {
            url: new URL("http://remotehost"),
            protocol: "h1",
          },
          response: {
            fromServiceWorker: false,
          },
        },
      ],
    } as Traces);
    expect(auditResult.score).toEqual(1);
  });
  it("passess records with a data request protocol", async () => {
    const auditResult = await UsesHTTP2Audit.audit({
      server: { hosts: ["localhost"] },
      record: [
        {
          request: {
            url: new URL("http://localhost"),
            protocol: "data",
          },
          response: {
            fromServiceWorker: false,
          },
        },
      ],
    } as Traces);
    expect(auditResult.score).toEqual(1);
  });
  it("passess records with a h2 request protocol", async () => {
    const auditResult = await UsesHTTP2Audit.audit({
      server: { hosts: ["localhost"] },
      record: [
        {
          request: {
            url: new URL("http://localhost"),
            protocol: "h2",
          },
          response: {
            fromServiceWorker: false,
          },
        },
      ],
    } as Traces);
    expect(auditResult.score).toEqual(1);
  });
  it("fails on non-h2 audits", async () => {
    const auditResult = await UsesHTTP2Audit.audit({
      server: { hosts: ["localhost"] },
      record: [
        {
          request: {
            url: new URL("http://localhost/script.js"),
            protocol: "h1",
          },
          response: {
            fromServiceWorker: false,
          },
        },
      ],
    } as Traces);
    expect(auditResult.score).toEqual(0);
  });
  it("passess successful audits", async () => {
    const auditResult = await UsesHTTP2Audit.audit({
      server: { hosts: ["localhost"] },
      record: [
        {
          request: {
            url: new URL("http://localhost/script.js"),
            protocol: "h2",
          },
          response: {
            fromServiceWorker: false,
          },
        },
        {
          request: {
            url: new URL("http://localhost/styles.css"),
            protocol: "h2",
          },
          response: {
            fromServiceWorker: false,
          },
        },
      ],
    } as Traces);
    expect(auditResult.score).toEqual(1);
  });
  it("handles errors", async () => {
    const auditResult = await UsesHTTP2Audit.audit({} as Traces);
    expect(auditResult?.scoreDisplayMode).toEqual("skip");
  });
});

describe("UsesLazyLoading audit", () => {
  it("skips audits with undefined lazymedia traces, ex: when page is unable to scroll", async () => {
    const auditResult = await UsesLazyLoadingAudit.audit({} as Traces);
    expect(auditResult.scoreDisplayMode).toEqual("skip");
  });
  it("skips audits without media traces", async () => {
    const auditResult = await UsesLazyLoadingAudit.audit({
      lazyMedia: {
        lazyImages: [] as string[],
        lazyVideos: [] as string[],
      },
      media: {
        images: [] as MediaFormat[],
        videos: [] as MediaFormat[],
      },
    } as Traces);
    expect(auditResult.scoreDisplayMode).toEqual("skip");
  });
  it("skips audits with non visible (under the fold) media traces", async () => {
    const auditResult = await UsesLazyLoadingAudit.audit({
      lazyMedia: {
        lazyImages: [] as string[],
        lazyVideos: [] as string[],
      },
      media: {
        images: [
          {
            isVisible: true,
            src: "http://localhost/cover.png",
          },
        ] as MediaFormat[],
        videos: [] as MediaFormat[],
      },
    } as Traces);
    expect(auditResult.scoreDisplayMode).toEqual("skip");
  });
  it("passess successful audits", async () => {
    const auditResult = (await UsesLazyLoadingAudit.audit({
      media: {
        images: [
          {
            isVisible: false,
            src: "http://localhost/cover.png",
          },
        ] as MediaFormat[],
        videos: [] as MediaFormat[],
      },
      lazyMedia: {
        lazyImages: ["cover.png"],
        lazyVideos: [] as string[],
      },
    } as Traces)) as Result;
    expect(auditResult.score).toEqual(1);
  });
  it("handles errors", async () => {
    const auditResult = await UsesLazyLoadingAudit.audit({} as Traces);
    expect(auditResult?.scoreDisplayMode).toEqual("skip");
  });
});
describe("UsesWebmVideoFormat audit", () => {
  it("skips audits without media video traces", async () => {
    const auditResult = await UsesWebmVideoFormatAudit.audit({
      media: {
        videos: [] as MediaFormat[],
      },
    } as Traces);
    expect(auditResult.scoreDisplayMode).toEqual("skip");
  });
  it("ignores videos with empty src atribute", async () => {
    const auditResult = await UsesWebmVideoFormatAudit.audit({
      lazyMedia: {
        lazyVideos: [] as string[],
      },
      media: {
        videos: [
          {
            widht: "1080",
            height: "320",
            src: [],
          },
        ] as MediaFormat[],
      },
    } as Traces);
    expect(auditResult.scoreDisplayMode).toEqual("skip");
  });
  it("uses lazy videos too", async () => {
    const auditResult = (await UsesWebmVideoFormatAudit.audit({
      lazyMedia: {
        lazyVideos: ["http://localhost/lazyvideo.mp4"],
      },
      media: {
        videos: [
          {
            src: ["http://localhost/myvideo.webm"],
            widht: "1080",
            height: "320",
          },
        ] as MediaFormat[],
      },
    } as Traces)) as Result;
    expect(auditResult.score).toEqual(0);
  });
  it("ignores repeated videos src", async () => {
    const auditResult = (await UsesWebmVideoFormatAudit.audit({
      lazyMedia: {
        lazyVideos: [] as string[],
      },
      media: {
        videos: [
          {
            src: ["http://localhost/lazyvideo.mp4"],
            widht: "1080",
            height: "320",
          },
          {
            src: ["http://localhost/lazyvideo.mp4"],
            widht: "1080",
            height: "320",
          },
        ] as MediaFormat[],
      },
    } as Traces)) as Result;
    expect(auditResult.score).toEqual(0);
    expect(auditResult?.extendedInfo?.value.length).toEqual(1);
  });
  it("fails audits without all webm videos", async () => {
    const auditResult = (await UsesWebmVideoFormatAudit.audit({
      lazyMedia: {
        lazyVideos: [] as string[],
      },
      media: {
        videos: [
          {
            src: ["http://localhost/lazyvideo.webm"],
            widht: "1080",
            height: "320",
          },
          {
            src: ["http://localhost/lazyvideo2.mp4"],
            widht: "1080",
            height: "320",
          },
        ] as MediaFormat[],
      },
    } as Traces)) as Result;

    expect(auditResult.score).toEqual(0);
  });
  it("passess successful audits", async () => {
    const auditResult = (await UsesWebmVideoFormatAudit.audit({
      lazyMedia: {
        lazyVideos: ["http://localhost/lazyvideo3.webm"] as string[],
      },
      media: {
        videos: [
          {
            src: [
              "http://localhost/lazyvideo.webm",
              "http://localhost/lazyvideo.mp4",
            ],
            widht: "1080",
            height: "320",
          },
          {
            src: ["http://localhost/lazyvideo2.webm"],
            widht: "1080",
            height: "320",
          },
        ] as MediaFormat[],
      },
    } as Traces)) as Result;

    expect(auditResult.score).toEqual(1);
  });
  it("handles errors", async () => {
    const auditResult = await UsesWebmVideoFormatAudit.audit({} as Traces);
    expect(auditResult?.scoreDisplayMode).toEqual("skip");
  });
});

describe("UsesWebpImageFormat audit", () => {
  it("skips audits with undefined lazymedia traces, ex: when page is unable to scroll", async () => {
    const auditResult = await UsesWebpImageFormatAudit.audit({
      record: [
        {
          request: {
            url: new URL("http://localhost/script.js"),
            protocol: "h1",
            resourceType: "other",
          },
          response: {
            fromServiceWorker: false,
          },
        },
      ],
    } as Traces);
    expect(auditResult.scoreDisplayMode).toEqual("skip");
  });
  it("ignores audits without media images", async () => {
    const auditResult = await UsesWebpImageFormatAudit.audit({
      lazyMedia: {
        lazyImages: [] as string[],
      },
      record: [
        {
          request: {
            resourceType: "script",
          },
          response: {
            url: new URL("http://localhost/script.js"),
          },
        },
      ],
    } as Traces);

    expect(auditResult.scoreDisplayMode).toEqual("skip");
  });
  it("ignores audits that dont have at least one image type of (png, jpg, gif, webp)", async () => {
    const auditResult = await UsesWebpImageFormatAudit.audit({
      lazyMedia: {
        lazyImages: [] as string[],
      },
      record: [
        {
          request: {
            resourceType: "image",
          },
          response: {
            url: new URL("http://localhost/spinner.svg"),
          },
        },
      ],
    } as Traces);

    expect(auditResult.scoreDisplayMode).toEqual("skip");
  });
  it("skips base64 images", async () => {
    const originalB64Image =
      "data:image/jpeg;base64,/9j/4RiDRXhpZgAATU0AK4RiDRXhpZgAATU0AK4RiDRXhpZgAATU0AK";
    const auditResult = (await UsesWebpImageFormatAudit.audit({
      lazyMedia: {
        lazyImages: [] as string[],
      },
      record: [
        {
          request: {
            resourceType: "image",
          },
          response: {
            url: new URL(originalB64Image),
          },
        },
      ],
    } as Traces)) as Result;

    expect(auditResult.scoreDisplayMode).toBe("skip");
  });
  it("passess successful audits", async () => {
    const auditResult = (await UsesWebpImageFormatAudit.audit({
      lazyMedia: {
        lazyImages: ["http://localhost/image2.svg"] as string[],
      },
      record: [
        {
          request: {
            resourceType: "image",
          },
          response: {
            url: new URL("http://localhost/image.webp"),
          },
        },
      ],
    } as Traces)) as Result;

    expect(auditResult.score).toEqual(1);
  });

  it("fails wrongful audits and skips images below threshold", async () => {
    const originalB64Image =
      "data:image/jpeg;base64,/9j/4RiDRXhpZgAATU0AK4RiDRXhpZgAATU0AK4RiDRXhpZgAATU0AK";
    const auditResult = (await UsesWebpImageFormatAudit.audit({
      lazyMedia: {
        lazyImages: ["http://localhost/image.png?q=1j12j1j2"],
      },
      record: [
        {
          request: {
            resourceType: "image",
          },
          response: {
            nonWebPImageEstimatedSavings: 0.5,
            url: new URL("http://localhost/image.png?q=1"),
          },
        },
        {
          request: {
            resourceType: "image",
          },
          response: {
            nonWebPImageEstimatedSavings: 0.5,
            url: new URL("http://localhost/image2.jpg"),
          },
        },
        {
          request: {
            resourceType: "image",
          },
          response: {
            nonWebPImageEstimatedSavings: 0.02,
            url: new URL("http://localhost/image2.jpeg"),
          },
        },
        {
          request: {
            resourceType: "image",
          },
          response: {
            url: new URL(originalB64Image),
          },
        },
      ],
    } as Traces)) as Result;

    expect(auditResult.score).toEqual(0);
    expect(auditResult?.extendedInfo?.value).toEqual([
      { name: "image.png", savings: 0.5 },
      { name: "image2.jpg", savings: 0.5 },
    ]);
  });

  it("handles errors", async () => {
    const auditResult = await UsesWebpImageFormatAudit.audit({} as Traces);
    expect(auditResult?.scoreDisplayMode).toEqual("skip");
  });
});

describe("AvoidInlineAssets audit", () => {
  it("fails on audits with big sized inline css or js assets", async () => {
    const auditResult = await AvoidInlineAssetsAudit.audit({
      css: {
        info: {
          styles: [
            {
              src: "http://localhost#styles[0]",
              text: "",
              size: 3000,
            },
          ],
          styleHrefs: [{ src: "http://localhost", attr: ["defer"] }],
        },
      },
      js: {
        info: {
          scripts: [] as InlineScripts[],
        },
      },
    } as Traces);
    expect(auditResult.score).toEqual(0);
    expect(auditResult?.extendedInfo?.value.length).toEqual(1);
  });
  it("passess successful audits", async () => {
    const auditResult = await AvoidInlineAssetsAudit.audit({
      css: {
        info: {
          styles: [
            {
              src: "http://localhost#styles[0]",
              text: "",
              size: 1000,
            },
          ],
          styleHrefs: [{ src: "http://localhost", attr: ["defer"] }],
        },
      },
      js: {
        info: {
          scripts: [] as InlineScripts[],
        },
      },
    } as Traces);
    expect(auditResult.score).toEqual(1);
  });
  it("fails wrongful audits", async () => {
    const auditResult = await AvoidInlineAssetsAudit.audit({
      css: {
        info: {
          styles: [
            {
              src: "http://localhost#styles[0]",
              text: "some-inline-css",
              size: 9800,
            },
          ],
          styleHrefs: [{ src: "http://localhost", attr: ["defer"] }],
        },
      },
      js: {
        info: {
          scripts: [] as InlineScripts[],
        },
      },
    } as Traces);
    expect(auditResult.score).toEqual(0);
    expect(auditResult?.extendedInfo?.value).toEqual([
      {
        name: "http://localhost#styles[0]",
        size: 9800,
        text: "some-inline-css",
      },
    ]);
  });
  it("handles errors", async () => {
    const auditResult = await AvoidInlineAssetsAudit.audit({} as Traces);
    expect(auditResult?.scoreDisplayMode).toEqual("skip");
  });
});
describe("AvoidURLRedirects audit", () => {
  it("ignores empty redirects", async () => {
    const auditResult = await AvoidURLRedirectsAudit.audit({
      server: { hosts: ["localhost"] },
      redirect: [] as RedirectResponse[],
    } as Traces);
    expect(auditResult.score).toEqual(1);
  });
  it("ignores cross site redirects", async () => {
    const auditResult = await AvoidURLRedirectsAudit.audit({
      server: { hosts: ["localhost"] },
      redirect: [
        {
          url: "http://remotehost",
          redirectsTo: "http://remotehost2",
          requestId: "1",
        },
      ],
    } as Traces);
    expect(auditResult.score).toEqual(1);
  });
  it("fails on audits with redirects originated at the same host", async () => {
    const auditResult = await AvoidURLRedirectsAudit.audit({
      server: { hosts: ["localhost"] },
      redirect: [
        {
          url: "http://localhost",
          redirectsTo: "http://remotehost2",
          requestId: "1",
        },
      ],
    } as Traces);
    expect(auditResult.score).toEqual(0);
    expect(auditResult?.extendedInfo?.value.length).toEqual(1);
  });
  it("handles errors", async () => {
    const auditResult = await AvoidURLRedirectsAudit.audit({} as Traces);
    expect(auditResult?.scoreDisplayMode).toEqual("skip");
  });
});
describe("AvoidableBotTraffic audit", () => {
  it("skips audits without robots traces", async () => {
    const auditResult = await AvoidableBotTrafficAudit.audit({
      server: { hosts: ["localhost"] },
      robots: {},
    } as Traces);
    expect(auditResult.scoreDisplayMode).toEqual("skip");
  });
  it("fails audits with poorly configured robots.txt file", async () => {
    const auditResult = (await AvoidableBotTrafficAudit.audit({
      metatag: [] as MetaTagFormat[],
      record: [
        {
          request: {
            url: new URL("localhost:2030"),
            requestId: "",
            resourceType: "eventsource",
            method: "GET",
            headers: {},
            timestamp: 0,
          },
          response: {
            headers: {},
          },
          CDP: {},
        },
      ] as Record[],
      server: {
        hosts: ["localhost:2030"],
      },
      robots: {
        agents: {},
        allow: [],
        disallow: [],
        host: "",
        sitemaps: [],
      } as RobotsFormat,
    } as Traces)) as Result;

    expect(auditResult.score).toEqual(0);
  });
  it("passess successful audits with robots metatag or X-Robots-Tag header but warns to do otherwise ", async () => {
    const auditResult = (await AvoidableBotTrafficAudit.audit({
      metatag: [
        {
          attr: [
            {
              name: "robots",
            },
          ],
        },
      ] as MetaTagFormat[],
      record: [
        {
          request: {
            url: new URL("http://localhost.com"),
            requestId: "",
            resourceType: "eventsource",
            method: "GET",
            headers: {},
            timestamp: 0,
          },
          response: {
            headers: {
              "content-type": "text/plain",
              "x-robots-tag": "allow",
            } as Headers,
          },
          CDP: {},
        },
      ] as Record[],
      server: {
        hosts: ["localhost.com"],
      },
      robots: {
        agents: {},
        allow: [],
        disallow: [],
        host: "",
        sitemaps: [],
      } as RobotsFormat,
    } as Traces)) as Result;
    expect(auditResult.score).toEqual(1);
    expect(auditResult?.errorMessage).toBeTruthy();
  });
  it("ignores third party requests including robots metatag or X-Robots-Tag header", async () => {
    const auditResult = (await AvoidableBotTrafficAudit.audit({
      metatag: [] as MetaTagFormat[],
      record: [
        {
          request: {
            url: new URL("http://www.host.com"),
            requestId: "",
            resourceType: "eventsource",
            method: "GET",
            headers: {},
            timestamp: 0,
          },
          response: {
            headers: {
              "content-type": "text/plain",
              "x-robots-tag": "allow",
            } as Headers,
          },
          CDP: {},
        },
      ] as Record[],
      server: {
        hosts: ["localhost"],
      },
      robots: {
        agents: {},
        allow: [],
        disallow: [],
        host: "",
        sitemaps: [],
      } as RobotsFormat,
    } as Traces)) as Result;
    expect(auditResult.score).toEqual(0);
    expect(auditResult?.errorMessage).toBeUndefined();
  });
  it("passess successful audits with disallow all UA", async () => {
    const auditResult = (await AvoidableBotTrafficAudit.audit({
      metatag: [] as MetaTagFormat[],
      server: {
        hosts: ["localhost:2030"],
      },
      record: [
        {
          request: {
            url: new URL("localhost:2030"),
            requestId: "",
            resourceType: "eventsource",
            method: "GET",
            headers: {},
            timestamp: 0,
          },
          response: {
            headers: {},
          },
          CDP: {},
        },
      ] as Record[],
      robots: {
        agents: {
          all: {
            allow: [],
            disallow: ["/"],
          },
        },
        allow: [],
        disallow: [],
        host: "",
        sitemaps: [],
      } as RobotsFormat,
    } as Traces)) as Result;
    expect(auditResult.score).toEqual(1);
  });
  it("passess successful audits specific UA rules", async () => {
    const auditResult = (await AvoidableBotTrafficAudit.audit({
      metatag: [] as MetaTagFormat[],
      server: {
        hosts: ["localhost:2030"],
      },
      record: [
        {
          request: {
            url: new URL("localhost:2030"),
            requestId: "",
            resourceType: "eventsource",
            method: "GET",
            headers: {},
            timestamp: 0,
          },
          response: {
            headers: {},
          },
          CDP: {},
        },
      ] as Record[],
      robots: {
        agents: {
          "spider-bot": {
            allow: [],
            disallow: ["/"],
          },
        },
        allow: [],
        disallow: [],
        host: "",
        sitemaps: [],
      } as RobotsFormat,
    } as Traces)) as Result;
    expect(auditResult.score).toEqual(1);
  });
  it("handles errors", async () => {
    const auditResult = await AvoidableBotTrafficAudit.audit({} as Traces);
    expect(auditResult?.scoreDisplayMode).toEqual("skip");
  });
});
describe("CarbonFootprintAudit", () => {
  it("passess successful audits", async () => {
    const auditResult = (await CarbonFootprintAudit.audit({
      server: { hosts: ["localhost"], energySource: { isGreen: true } },
      performance: {
        perf: [
          { name: "http://localhost/script.js", transferSize: 12200 },
          { name: "http://remotehost/main.js", transferSize: 9000 },
          { name: "http://remotehost/cover2.webp", transferSize: 1000 },
          { name: "http://localhost/image.png", transferSize: 1000 },
        ],
      },
      record: [
        {
          request: {
            url: new URL("http://localhost/script.js"),
            resourceType: "script",
          },
          response: {
            url: new URL("http://localhost/script.js"),
            uncompressedSize: { value: 16000, units: "bytes" },
          },
          CDP: {
            compressedSize: { value: 12200, units: "bytes" },
          },
        },
        {
          request: {
            url: new URL("http://remotehost/main.js"),
            resourceType: "script",
          },
          response: {
            url: new URL("http://remotehost/main.js"),
            uncompressedSize: { value: 12000, units: "bytes" },
          },
          CDP: {
            compressedSize: { value: 9000, units: "bytes" },
          },
        },
        {
          request: {
            resourceType: "image",
            url: new URL("http://remotehost/cover2.webp"),
          },
          response: {
            url: new URL("http://remotehost/cover2.webp"),
            uncompressedSize: { value: 12000, units: "bytes" },
          },
          CDP: {
            compressedSize: { value: 1000, units: "bytes" },
          },
        },
        {
          request: {
            resourceType: "image",
            url: new URL("http://localhost/image.png"),
          },
          response: {
            url: new URL("http://localhost/image.png"),
            uncompressedSize: { value: 1000, units: "bytes" },
          },
          CDP: {
            compressedSize: { value: 1000, units: "bytes" },
          },
        },
      ],
    } as Traces)) as Result;

    const extraResult = {
      carbonfootprint: ["0.03383", "gCO2eq / 100 views"],
      totalComputedWattage: ["0.0000011235", "kWh"],
      totalTransfersize: [23200, "bytes"],
    };

    const shareResult = {
      image: {
        info: [
          {
            absolute: 4.31,
            hostname: "remotehost",
            isThirdParty: true,
            name: "cover2.webp",
            relative: 50,
            size: 1000,
          },
          {
            absolute: 4.31,
            isThirdParty: false,
            name: "image.png",
            relative: 50,
            size: 1000,
          },
        ],
        share: 8.62,
        size: 2000,
      },
      script: {
        info: [
          {
            absolute: 52.59,
            isThirdParty: false,
            name: "script.js",
            relative: 57.55,
            size: 12200,
          },
          {
            absolute: 38.79,
            hostname: "remotehost",
            isThirdParty: true,
            name: "main.js",
            relative: 42.45,
            size: 9000,
          },
        ],
        share: 91.38,
        size: 21200,
      },
    };
    expect(auditResult.score).toBe(1);
    expect(auditResult.extendedInfo?.value.extra).toEqual(extraResult);
    expect(auditResult.extendedInfo?.value.share).toEqual(shareResult);
  });
  it("skips on audits with unknown error", async () => {
    const auditResult = await CarbonFootprintAudit.audit({
      record: [] as Record[],
    } as Traces);
    expect(auditResult.scoreDisplayMode).toEqual("skip");
  });
});
