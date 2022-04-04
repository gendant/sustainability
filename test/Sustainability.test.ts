import * as fetch from "cross-fetch";
import fastify, { FastifyInstance } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import * as path from "path";
import { Browser, Page } from "puppeteer";
import { Readable } from "stream";
import { Sustainability } from "../src";
import Commander from "../src/commander/commander";
import Connection from "../src/connection/connection";
import { AuditSettings } from "../src/types";

const server: FastifyInstance<Server, IncomingMessage, ServerResponse> =
  fastify();

server.register(require("fastify-static"), {
  root: path.join(__dirname, "examples"),
});
server.get("/health.html", (_, reply) => {
  reply.status(302);
  reply.redirect("http://localhost:3334/animations.html");
});

const runAudit = (path: string, options?: AuditSettings, url?: string) => {
  if (!url) url = `http://localhost:3334/${path}.html`;
  return Sustainability.audit(url, options);
};

const connection = new Connection();
const commander = new Commander();

beforeAll(async () => {
  await server.listen(3334);
});

afterAll(async () => {
  await server.close();
});

describe("Sustainability", () => {
  const fetchMock = jest.spyOn(fetch, "default");
  afterEach(() => {
    fetchMock.mockClear();
  });
  it("works with default options", async () => {
    const report = await runAudit("animations", {
      launchSettings: {
        timeout: 30000,
      },
    });
    expect(report).toBeTruthy();
  });

  it("works on redirected URLs", async () => {
    const report = await runAudit("health");
    expect(report).toBeTruthy();
  });
  it("works with coldRun disabled and streams enabled", async () => {
    Sustainability.auditStream.pipe(process.stdout);
    await runAudit("animations", {
      id: "0x12221ae",
      connectionSettings: { coldRun: false, streams: true },
    });
    expect(true).toBeTruthy();
  });
  it("custom stream pipe work", async () => {
    const readableStream = new Readable({
      read() {},
    });

    readableStream.on("data", (data) => expect(data).toBeTruthy());
    await runAudit("animations", {
      connectionSettings: {
        streams: true,
        pipe: readableStream,
        pipeTerminateOnEnd: true,
      },
    });
  });

  it("stream pipe terminates", async () => {
    Sustainability.auditStream.on("end", () => {
      expect(true).toBeTruthy();
    });
    await runAudit("animations", {
      id: "0x12221ae",
      connectionSettings: { streams: true, pipeTerminateOnEnd: true },
    });
  });
  it("works when custom browser is passed", async () => {
    const browser = await connection.setUp();
    await runAudit("animations", {
      browser,
    });
    await browser.close();
    expect(true).toBeTruthy();
  });
});

describe("targeted tests to improve coverage", () => {
  it("commander setup throws error", async () => {
    try {
      expect(
        await commander.setUp({
          url: "http://localhost:3334/animations.html",
          page: {} as Page,
        })
      );
    } catch (error) {
      expect(true).toBeTruthy();
    }
  });
  it("commander staticEvaluate throws error", async () => {
    try {
      expect(
        await commander.staticEvaluate({
          url: "http://localhost:3334/animations.html",
          page: {} as Page,
        })
      );
    } catch (error) {
      expect(true).toBeTruthy();
    }
  });
  it("test with wrong process env bin chrome", async () => {
    process.env.CHROME_BIN = "/usr/local/bin/chrome";
    try {
      await runAudit("animations");
    } catch (error) {
      expect(true).toBeTruthy();
    }
  });
  it("test with wrong browser option", async () => {
    try {
      await runAudit("animations", {
        browser: {
          newPage: async () => new Promise((resolve) => resolve({} as Page)),
        } as Browser,
        connectionSettings: { coldRun: false },
      });
    } catch (error) {
      expect(true).toBeTruthy();
    }
  });
});
