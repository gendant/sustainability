import { Sustainability } from ".";

(async () => {
  Sustainability.auditStream.pipe(process.stdout);
  const report = await Sustainability.audit("https://reddit.com", {
    connectionSettings: { streams: true, coldRun: false },
  });

  console.log(JSON.stringify(report));
})();
