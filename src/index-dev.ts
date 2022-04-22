import { Sustainability } from ".";
(async () => {
  const report = await Sustainability.audit("https://www.gendant.com", {
    id: "000",
    connectionSettings: {
      coldRun: false,
      streams: false,
    },
  });

  console.log(JSON.stringify(report));
})();
