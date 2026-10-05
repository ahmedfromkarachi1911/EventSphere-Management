import fs from "fs";
import path from "path";

const logsDirectory = path.join(
  process.cwd(),
  "logs"
);

const logFilePath = path.join(
  logsDirectory,
  "app.log"
);

const ensureLogsDirectory = () => {
  if (!fs.existsSync(logsDirectory)) {
    fs.mkdirSync(logsDirectory, {
      recursive: true,
    });
  }
};

const writeLog = (message) => {
  ensureLogsDirectory();

  fs.appendFile(
    logFilePath,
    `${message}\n`,
    (error) => {
      if (error) {
        console.error(
          "Unable to write log:",
          error.message
        );
      }
    }
  );
};

const requestLogger = (
  req,
  res,
  next
) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration =
      Date.now() - startTime;

    const userId =
      req.user?._id || "Guest";

    const role =
      req.user?.role || "Public";

    const timestamp =
      new Date().toISOString();

    const logMessage =
      `[${timestamp}] [REQUEST] ` +
      `${req.method} ${req.originalUrl} | ` +
      `Status: ${res.statusCode} | ` +
      `${duration}ms | ` +
      `User: ${userId} | ` +
      `Role: ${role}`;

    console.log(logMessage);

    writeLog(logMessage);
  });

  next();
};

const errorLogger = (
  error,
  req,
  res,
  next
) => {
  const timestamp =
    new Date().toISOString();

  const userId =
    req.user?._id || "Guest";

  const role =
    req.user?.role || "Public";

  const logMessage =
    `[${timestamp}] [ERROR] ` +
    `${req.method} ${req.originalUrl} | ` +
    `User: ${userId} | ` +
    `Role: ${role} | ` +
    `Message: ${error.message}`;

  console.error(logMessage);

  if (error.stack) {
    console.error(error.stack);
  }

  writeLog(logMessage);

  next(error);
};

export {
  requestLogger,
  errorLogger,
};