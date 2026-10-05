import fs from "fs";
import path from "path";
import mongoose from "mongoose";

const BACKUP_INTERVAL =
  24 * 60 * 60 * 1000;

const createBackup = async () => {
  try {
    if (
      mongoose.connection.readyState !== 1 ||
      !mongoose.connection.db
    ) {
      console.log(
        "Backup skipped: MongoDB not connected"
      );

      return;
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-");

    const backupPath = path.join(
      process.cwd(),
      "backups",
      timestamp
    );

    const databaseBackupPath =
      path.join(
        backupPath,
        "database"
      );

    fs.mkdirSync(
      databaseBackupPath,
      {
        recursive: true,
      }
    );

    const collections =
      await mongoose.connection.db
        .listCollections()
        .toArray();

    for (const collection of collections) {
      const collectionName =
        collection.name;

      const data =
        await mongoose.connection.db
          .collection(collectionName)
          .find({})
          .toArray();

      const filePath = path.join(
        databaseBackupPath,
        `${collectionName}.json`
      );

      fs.writeFileSync(
        filePath,
        JSON.stringify(
          data,
          null,
          2
        ),
        "utf8"
      );
    }

    const uploadsPath = path.join(
      process.cwd(),
      "uploads"
    );

    const uploadsBackupPath =
      path.join(
        backupPath,
        "uploads"
      );

    if (
      fs.existsSync(uploadsPath)
    ) {
      fs.cpSync(
        uploadsPath,
        uploadsBackupPath,
        {
          recursive: true,
        }
      );
    }

    console.log(
      `Backup created successfully: ${backupPath}`
    );
  } catch (error) {
    console.error(
      "Backup failed:",
      error.message
    );
  }
};

const startBackupService = () => {
  createBackup();

  setInterval(
    createBackup,
    BACKUP_INTERVAL
  );
};

export {
  createBackup,
  startBackupService,
};