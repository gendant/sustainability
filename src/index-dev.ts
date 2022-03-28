import { Sustainability } from ".";
(async () => {
  const report = await Sustainability.audit("https://guebs.com", {
    id: "000",
    connectionSettings: {
      coldRun: true,
    },
  });

  console.log(JSON.stringify(report));
})();
