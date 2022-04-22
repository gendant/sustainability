import AvoidableBotTrafficAudit from "../audits/AvoidableBotTraffic.audit";
import AvoidInlineAssetsAudit from "../audits/AvoidInlineAssets.audit";
import AvoidURLRedirectsAudit from "../audits/AvoidURLRedirects.audits";
import CarbonFootprintAudit from "../audits/CarbonFootprint.audit";
import CookieOptimisation from "../audits/CookieOptimisation.audit";
import LeverageBrowserCachingAudit from "../audits/LeverageBrowserCaching.audit";
import NoConsoleLogsAudit from "../audits/NoConsoleLogs.audit";
import PixelEnergyEfficiencyAudit from "../audits/PixelEnergyEfficiency.audit";
import ReactiveAnimationsAudit from "../audits/ReactiveAnimations.audit";
import UsesCompressionAudit from "../audits/UsesCompression.audit";
import UsesDarkModeAudit from "../audits/UsesDarkMode.audit";
import UsesFontSubsettingAudit from "../audits/UsesFontSubsetting.audit";
import UsesGreenServerAudit from "../audits/UsesGreenServer.audit";
import UsesHTTP2Audit from "../audits/UsesHTTP2.audit";
import UsesLazyLoadingAudit from "../audits/UsesLazyLoading.audit";
import UsesWebmVideoFormatAudit from "../audits/UsesWebmVideoFormat.audit";
import UsesWebpImageFormatAudit from "../audits/UsesWebpImageFormat.audit";
import CollectAnimations from "../collect/animations.collect";
import CollectAssets from "../collect/assets.collect";
import CollectConsole from "../collect/console.collect";
import CollectCookies from "../collect/cookies.collect";
import CollectLazyMedia from "../collect/lazymedia.collect";
import CollectMedia from "../collect/media.collect";
import CollectMetaTags from "../collect/meta-tag.collect";
import CollectPerformance from "../collect/perf.collect";
import CollectRedirect from "../collect/redirect.collect";
import CollectRobots from "../collect/robots.collect";
import CollectScreenshot from "../collect/screenshot.collect";
import CollectSubfont from "../collect/subfont.collect";
import CollectTransfer from "../collect/transfer.collect";
import { auditStream } from "../sustainability/stream";
import { DefaultSettings } from "../types/settings";

export const DEFAULT: DefaultSettings = {
  LAUNCH_SETTINGS: {
    timeout: 30 * 1000,
    args: [
      "--autoplay-policy=user-gesture-required",
      "--disable-background-networking",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-breakpad",
      "--disable-client-side-phishing-detection",
      "--disable-component-update",
      "--disable-default-apps",
      "--disable-dev-shm-usage",
      "--disable-domain-reliability",
      "--disable-extensions",
      "--disable-features=AudioServiceOutOfProcess",
      "--disable-hang-monitor",
      "--disable-ipc-flooding-protection",
      "--disable-notifications",
      "--disable-offer-store-unmasked-wallet-cards",
      "--disable-popup-blocking",
      "--disable-print-preview",
      "--disable-prompt-on-repost",
      "--disable-renderer-backgrounding",
      "--disable-setuid-sandbox",
      "--disable-speech-api",
      "--disable-sync",
      "--hide-scrollbars",
      "--ignore-gpu-blacklist",
      "--metrics-recording-only",
      "--mute-audio",
      "--no-default-browser-check",
      "--no-first-run",
      "--no-pings",
      "--no-sandbox",
      "--no-zygote",
      "--password-store=basic",
      "--use-gl=swiftshader",
      "--use-mock-keychain",
      "--disk-cache-size=0",
    ],
  },
  CONNECTION_SETTINGS: {
    maxNavigationTime: 30 * 1000,
    maxScrollInterval: 30,
    maxScrollWaitingTime: 30 * 1000,
    maxThrottle: 5000,
    emulatedDevice: {
      name: "Desktop 1920x1080",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36",
      viewport: {
        width: 1920,
        height: 1080,
      },
    },
    location: {
      name: "Seattle",
      latitude: 47.6062,
      longitude: -122.3331,
      accuracy: 100,
    },
    streams: false,
    coldRun: true,
    pipeTerminateOnEnd: false,
    pipe: auditStream,
  },
  CATEGORIES: {
    server: {
      description:
        "Server aspects which are essential for online sustainability: green hosting, carbon footprint, data transfer.",
    },
    design: {
      description:
        "Hands-on the website assets that convert code to user-friendly content: images, css stylesheets, scripts, fonts.",
    },
  },
  AUDITS: {
    collectors: [
      CollectTransfer,
      CollectRedirect,
      CollectConsole,
      CollectSubfont,
      CollectAssets,
      CollectMedia,
      CollectLazyMedia,
      CollectScreenshot,
      CollectCookies,
      CollectAnimations,
      CollectRobots,
      CollectMetaTags,
      CollectPerformance,
    ],
    audits: [
      UsesCompressionAudit,
      UsesHTTP2Audit,
      CarbonFootprintAudit,
      NoConsoleLogsAudit,
      UsesGreenServerAudit,
      UsesLazyLoadingAudit,
      PixelEnergyEfficiencyAudit,
      UsesDarkModeAudit,
      CookieOptimisation,
      AvoidInlineAssetsAudit,
      LeverageBrowserCachingAudit,
      UsesWebpImageFormatAudit,
      UsesWebmVideoFormatAudit,
      AvoidURLRedirectsAudit,
      AvoidableBotTrafficAudit,
      ReactiveAnimationsAudit,
      UsesFontSubsettingAudit,
    ],
  },
  REPORT: {
    scoring: {
      CF: { median: 4, p10: 1.2, name: "Carbon Footprint" },
      cache: { median: 128 * 1024, p10: 28 * 1024, name: "Cache" },
    },
  },
};
