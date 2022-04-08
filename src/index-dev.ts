import { Sustainability } from ".";
(async () => {
  const report = await Sustainability.audit("https://www.example.org", {
    id: "000",
    connectionSettings: {
      coldRun: false,
    },
  });

  console.log(JSON.stringify(report));
})();
