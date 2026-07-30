import fs from "fs";
import path from "path";
import util from "util";

const LOG_DIR = path.join(process.cwd(), "logs");

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const LOG_FILE = path.join(LOG_DIR, "app.log");

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

function writeLog(level: LogLevel, ...args: unknown[]) {
  const timestamp = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "medium",
  });

  let log = `[${timestamp}] ${level}\n`;

  for (const arg of args) {
    if (arg instanceof Error) {
      log += `${arg.stack ?? arg.message}\n`;
    } else if (typeof arg === "object") {
      log += util.inspect(arg, {
        depth: null,
        colors: false,
        compact: false,
      });
      log += "\n";
    } else {
      log += `${arg}\n`;
    }
  }

  log += "\n----------------------------------------\n\n";

  console.log(...args);

  fs.appendFileSync(LOG_FILE, log);
}

export const logger = {
  info: (...args: unknown[]) => writeLog("INFO", ...args),

  warn: (...args: unknown[]) => writeLog("WARN", ...args),

  error: (...args: unknown[]) => writeLog("ERROR", ...args),

  debug: (...args: unknown[]) => writeLog("DEBUG", ...args),
};
