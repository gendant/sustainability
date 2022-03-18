import { Readable } from "stream";
import { Sustainability } from ".";

(async () => {
  const auditStream = new Readable({
    objectMode: true,
    read() {},
  });
  auditStream.pipe(process.stdout)
  // const auditStream2 = new Readable({
  //   objectMode: true,
  //   read() {},
  // });
  // auditStream2.pipe(process.stdout)
  await Promise.all([
    Sustainability.audit("https://wikipedia.com", {
    connectionSettings: { streams: true, pipe: auditStream, pipeTerminateOnEnd: true, coldRun: true },
  })])
  // Sustainability.audit("https://mit.edu", {
  //   connectionSettings: { streams: true, pipe: auditStream2, pipeTerminateOnEnd: true, coldRun: true },
  // })])

})();
