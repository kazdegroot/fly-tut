const fs = require("fs");
const { spawn } = require("child_process");
const os = require("os");
const path = require("path");
const { getInstanceInfo } = require('litefs-js')

async function go() {
  const { currentIsPrimary, currentInstance, primaryInstance } = await getInstanceInfo();
  if (currentIsPrimary) {
    console.log(`Current instance (${currentInstance}) is primary. Running migration...`);
    await exec("npx prisma migrate deploy");
  } else {
    console.log(`Current instance (${currentInstance}) is not primary (${primaryInstance}). Skipping migration...`);
  }

  console.log("Starting app...");
  await exec("node ./build");
}
go();

async function exec(command) {
  const child = spawn(command, { shell: true, stdio: "inherit" });
  await new Promise((res, rej) => {
    child.on("exit", (code) => {
      if (code === 0) {
        res();
      } else {
        rej();
      }
    });
  });
}
