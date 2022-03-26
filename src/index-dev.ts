import { Readable } from "stream";
import { Sustainability } from ".";

(async () => {
  const auditStream = new Readable({
    objectMode: true,
    read() {},
  });
  auditStream.pipe(process.stdout);
  // const auditStream2 = new Readable({
  //   objectMode: true,
  //   read() {},
  // });
  // auditStream2.pipe(process.stdout)
  const report = await Promise.all([
    Sustainability.audit("https://wikipedia.com", {
      connectionSettings: {
        streams: true,
        // pipe: auditStream,
        // pipeTerminateOnEnd: true,
        coldRun: true,
      },
    }),
    await new Promise((resolve) =>
      setTimeout(() => resolve(undefined), 1)
    ).then(() =>
      Sustainability.audit("https://wikipedia.com", {
        connectionSettings: {
          streams: true,
          // pipe: auditStream,
          // pipeTerminateOnEnd: true,
          coldRun: true,
        },
      })
    ),
  ]);

  console.log(JSON.stringify(report[0]));
  console.log("\n\n");
  console.log(JSON.stringify(report[1]));

  // Sustainability.audit("https://mit.edu", {
  //   connectionSettings: { streams: true, pipe: auditStream2, pipeTerminateOnEnd: true, coldRun: true },
  // })])
})();
