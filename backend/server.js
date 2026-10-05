import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";

import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import expoRoutes from "./routes/expoRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import boothRoutes from "./routes/boothroutes.js";
import boothVisitRoutes from "./routes/boothVisitRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import sessionRegistrationRoutes from "./routes/sessionRegistrationRoutes.js";
import bookmarkRoutes from "./routes/bookmarkRoutes.js";
import exhibitorRoutes from "./routes/exhibitorRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";

import {
  startSessionReminderService,
} from "./services/sessionReminderService.js";

import {
  startBackupService,
} from "./services/backupService.js";

import {
  requestLogger,
  errorLogger,
} from "./middleware/loggerMiddleware.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
    ],
  },
});

app.set("io", io);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(requestLogger);

app.use(
  "/uploads/logos",
  express.static(
    path.join(
      process.cwd(),
      "uploads",
      "logos"
    )
  )
);

app.use("/api/auth", authRoutes);
app.use("/api/expos", expoRoutes);

app.use(
  "/api/applications",
  applicationRoutes
);

app.use(
  "/api/registrations",
  registrationRoutes
);

app.use("/api/booths", boothRoutes);

app.use(
  "/api/booth-visits",
  boothVisitRoutes
);

app.use(
  "/api/products",
  productRoutes
);

app.use("/api/staff", staffRoutes);

app.use(
  "/api/sessions",
  sessionRoutes
);

app.use(
  "/api/session-registrations",
  sessionRegistrationRoutes
);

app.use(
  "/api/bookmarks",
  bookmarkRoutes
);

app.use(
  "/api/exhibitors",
  exhibitorRoutes
);

app.use(
  "/api/messages",
  messageRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/documents",
  documentRoutes
);

app.use(
  "/api/analytics",
  analyticsRoutes
);

app.use(
  "/api/feedback",
  feedbackRoutes
);

io.on("connection", (socket) => {
  console.log(
    "Socket connected:",
    socket.id
  );

  socket.on("disconnect", () => {
    console.log(
      "Socket disconnected:",
      socket.id
    );
  });
});

app.get("/", (req, res) => {
  res.send(
    "EventSphere API is running..."
  );
});

app.use(errorLogger);

const PORT =
  process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  httpServer.listen(PORT, () => {
    console.log(
      `Server running on port ${PORT}`
    );

    startSessionReminderService();
    startBackupService();
  });
};

startServer();