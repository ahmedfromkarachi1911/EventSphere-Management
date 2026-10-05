import SessionRegistration from "../models/SessionRegistration.js";
import Bookmark from "../models/Bookmark.js";
import Notification from "../models/Notification.js";

const getSessionStartDateTime = (date, startTime) => {
  const sessionDate = new Date(date);

  if (!startTime) {
    return null;
  }

  let hours;
  let minutes;

  const time = startTime.trim();

  if (
    time.toUpperCase().includes("AM") ||
    time.toUpperCase().includes("PM")
  ) {
    const match = time.match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
    );

    if (!match) {
      return null;
    }

    hours = Number(match[1]);
    minutes = Number(match[2]);

    const period = match[3].toUpperCase();

    if (period === "PM" && hours !== 12) {
      hours += 12;
    }

    if (period === "AM" && hours === 12) {
      hours = 0;
    }
  } else {
    const parts = time.split(":");

    hours = Number(parts[0]);
    minutes = Number(parts[1]);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes)
    ) {
      return null;
    }
  }

  sessionDate.setHours(
    hours,
    minutes,
    0,
    0
  );

  return sessionDate;
};

const createReminderIfNeeded = async (
  attendeeId,
  session,
  now
) => {
  if (
    !attendeeId ||
    !session ||
    !session.date ||
    !session.startTime
  ) {
    return;
  }

  const sessionStart =
    getSessionStartDateTime(
      session.date,
      session.startTime
    );

  if (!sessionStart) {
    return;
  }

  const thirtyMinutes =
    30 * 60 * 1000;

  const difference =
    sessionStart.getTime() -
    now.getTime();

  if (
    difference <= 0 ||
    difference > thirtyMinutes
  ) {
    return;
  }

  const link =
    `/attendee/schedule/${session._id}`;

  const existingReminder =
    await Notification.findOne({
      user: attendeeId,
      type: "session",
      title: "Session Reminder",
      link,
    });

  if (existingReminder) {
    return;
  }

  await Notification.create({
    user: attendeeId,
    title: "Session Reminder",
    message: `${session.title} starts at ${session.startTime}.`,
    type: "session",
    link,
  });

  console.log(
    `Session reminder created for ${session.title}`
  );
};

const checkSessionReminders = async () => {
  try {
    const [
      registrations,
      bookmarks,
    ] = await Promise.all([
      SessionRegistration.find({
        status: "registered",
      }).populate("session"),

      Bookmark.find().populate(
        "session"
      ),
    ]);

    const now = new Date();

    for (const registration of registrations) {
      await createReminderIfNeeded(
        registration.attendee,
        registration.session,
        now
      );
    }

    for (const bookmark of bookmarks) {
      await createReminderIfNeeded(
        bookmark.attendee,
        bookmark.session,
        now
      );
    }
  } catch (error) {
    console.error(
      "Session reminder error:",
      error.message
    );
  }
};

const startSessionReminderService = () => {
  checkSessionReminders();

  setInterval(() => {
    checkSessionReminders();
  }, 60 * 1000);
};

export {
  startSessionReminderService,
};