import { Sustainability } from ".";
(async () => {
  const report = await Sustainability.audit("https://www.reddit.com", {
    id: "000",
    connectionSettings: {
      coldRun: false,
      streams: false,
    },
  });

  console.log(JSON.stringify(report));
})();
