import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";

const stream = createWriteStream("./src/database/access.log");

for (let i = 1; i <= 1_000_000; i++) {
  stream.write(
    JSON.stringify({
      id: randomUUID(),
      ip: `192.168.0.${i}`,
      username: `username${i}`,
      first_name: `First Name ${i}`,
      last_name: `Last Name ${i}`,
      email: `user${i}@example.com`,
      location: `Location ${i}`,
      job_area: `Job Area ${i}`,
      company: `Company ${i}`,
      job_title: `Job Title ${i}`,
      timestamp: new Date().toISOString(),
    }) + "\n",
  );
}

stream.end(() => {
  console.log("Log file has been created and written to successfully.");
});
