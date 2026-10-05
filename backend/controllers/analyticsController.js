import User from "../models/User.js";
import Expo from "../models/Expo.js";
import Application from "../models/Application.js";
import Booth from "../models/booth.js";
import BoothVisit from "../models/boothVisit.js";
import Registration from "../models/Registration.js";
import Session from "../models/Session.js";
import SessionRegistration from "../models/SessionRegistration.js";

const getAdminAnalytics = async (req, res) => {
  try {
    const [
      totalExpos,
      totalExhibitors,
      totalAttendees,
      totalRegistrations,
      applications,
      booths,
      sessions,
      sessionRegistrations,
      registrations,
      boothVisits,
    ] = await Promise.all([
      Expo.countDocuments(),

      User.countDocuments({
        role: "exhibitor",
      }),

      User.countDocuments({
        role: "attendee",
      }),

      Registration.countDocuments({
        status: "registered",
      }),

      Application.find().select("status"),

      Booth.find({
        status: {
          $ne: "cancelled",
        },
      })
        .populate(
          "expo",
          "title category"
        )
        .populate(
          "exhibitor",
          "name companyName"
        ),

      Session.find().populate(
        "expo",
        "title category"
      ),

      SessionRegistration.find({
        status: "registered",
      }).populate({
        path: "session",
        select: "title expo",
        populate: {
          path: "expo",
          select: "title category",
        },
      }),

      Registration.find({
        status: "registered",
      })
        .populate(
          "expo",
          "title category"
        )
        .sort({
          createdAt: 1,
        }),

      BoothVisit.find().select(
        "booth expo exhibitor attendee createdAt"
      ),
    ]);

    const applicationStatus = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    applications.forEach((application) => {
      if (
        Object.prototype.hasOwnProperty.call(
          applicationStatus,
          application.status
        )
      ) {
        applicationStatus[
          application.status
        ] += 1;
      }
    });

    const boothStatus = {
      available: 0,
      reserved: 0,
      assigned: 0,
    };

    booths.forEach((booth) => {
      if (
        Object.prototype.hasOwnProperty.call(
          boothStatus,
          booth.status
        )
      ) {
        boothStatus[booth.status] += 1;
      }
    });

    const sessionCounts = {};

    sessionRegistrations.forEach(
      (registration) => {
        const session =
          registration.session;

        if (!session) {
          return;
        }

        const sessionId =
          session._id.toString();

        if (!sessionCounts[sessionId]) {
          sessionCounts[sessionId] = {
            sessionId,
            title: session.title,
            expo:
              session.expo?.title ||
              "Unknown Expo",
            registrations: 0,
          };
        }

        sessionCounts[
          sessionId
        ].registrations += 1;
      }
    );

    const popularSessions =
      Object.values(sessionCounts)
        .sort(
          (a, b) =>
            b.registrations -
            a.registrations
        )
        .slice(0, 5);

    const monthlyMap = {};

    registrations.forEach(
      (registration) => {
        const date = new Date(
          registration.createdAt
        );

        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        if (!monthlyMap[key]) {
          monthlyMap[key] = {
            month: key,
            registrations: 0,
          };
        }

        monthlyMap[
          key
        ].registrations += 1;
      }
    );

    const monthlyAttendance =
      Object.values(monthlyMap).sort(
        (a, b) =>
          a.month.localeCompare(b.month)
      );

    const categoryMap = {};

    registrations.forEach(
      (registration) => {
        const category =
          registration.expo?.category ||
          "Uncategorized";

        if (!categoryMap[category]) {
          categoryMap[category] = 0;
        }

        categoryMap[category] += 1;
      }
    );

    const categoryPerformance =
      Object.entries(categoryMap)
        .map(
          ([
            category,
            registrationsCount,
          ]) => ({
            category,
            registrations:
              registrationsCount,

            percentage:
              totalRegistrations > 0
                ? Math.round(
                    (registrationsCount /
                      totalRegistrations) *
                      100
                  )
                : 0,
          })
        )
        .sort(
          (a, b) =>
            b.registrations -
            a.registrations
        );

    const boothTrafficMap = {};

    boothVisits.forEach((visit) => {
      if (!visit.booth) {
        return;
      }

      const boothId =
        visit.booth.toString();

      if (!boothTrafficMap[boothId]) {
        boothTrafficMap[boothId] = {
          totalVisits: 0,
          visitors: new Set(),
        };
      }

      boothTrafficMap[
        boothId
      ].totalVisits += 1;

      if (visit.attendee) {
        boothTrafficMap[
          boothId
        ].visitors.add(
          visit.attendee.toString()
        );
      }
    });

    const boothTraffic = booths
      .filter(
        (booth) =>
          booth.status === "assigned"
      )
      .map((booth) => {
        const boothId =
          booth._id.toString();

        const traffic =
          boothTrafficMap[boothId];

        return {
          boothId,

          boothNumber:
            booth.boothNumber,

          hall:
            booth.hall,

          boothType:
            booth.boothType,

          expo:
            booth.expo?.title ||
            "Unknown Expo",

          company:
            booth.exhibitor
              ?.companyName ||
            booth.exhibitor?.name ||
            "Unknown Exhibitor",

          totalVisits:
            traffic?.totalVisits || 0,

          uniqueVisitors:
            traffic?.visitors.size || 0,
        };
      })
      .sort(
        (a, b) =>
          b.totalVisits -
          a.totalVisits
      );

    const totalBoothVisits =
      boothVisits.length;

    const allBoothVisitors =
      new Set();

    boothVisits.forEach((visit) => {
      if (visit.attendee) {
        allBoothVisitors.add(
          visit.attendee.toString()
        );
      }
    });

    const uniqueBoothVisitors =
      allBoothVisitors.size;

    const expos = await Expo.find()
      .select(
        "title category status expectedAttendees"
      )
      .sort({
        createdAt: -1,
      });

    const expoPerformance = expos.map(
      (expo) => {
        const expoId =
          expo._id.toString();

        const expoRegistrations =
          registrations.filter(
            (registration) =>
              registration.expo?._id?.toString() ===
              expoId
          ).length;

        const expoBooths =
          booths.filter(
            (booth) =>
              booth.expo?._id?.toString() ===
              expoId
          );

        const occupiedBooths =
          expoBooths.filter(
            (booth) =>
              booth.status ===
                "reserved" ||
              booth.status ===
                "assigned"
          ).length;

        const boothUtilization =
          expoBooths.length > 0
            ? Math.round(
                (occupiedBooths /
                  expoBooths.length) *
                  100
              )
            : 0;

        const expoSessions =
          sessions.filter(
            (session) =>
              session.expo?._id?.toString() ===
              expoId
          );

        const expoSessionIds =
          expoSessions.map(
            (session) =>
              session._id.toString()
          );

        const sessionRegistrationCount =
          sessionRegistrations.filter(
            (registration) =>
              registration.session &&
              expoSessionIds.includes(
                registration.session._id.toString()
              )
          ).length;

        const expoVisits =
          boothVisits.filter(
            (visit) =>
              visit.expo?.toString() ===
              expoId
          );

        const expoVisitors =
          new Set();

        expoVisits.forEach(
          (visit) => {
            if (visit.attendee) {
              expoVisitors.add(
                visit.attendee.toString()
              );
            }
          }
        );

        return {
          expoId,
          title: expo.title,
          category: expo.category,
          status: expo.status,

          expectedAttendees:
            expo.expectedAttendees,

          registrations:
            expoRegistrations,

          booths:
            expoBooths.length,

          occupiedBooths,

          boothUtilization,

          boothVisits:
            expoVisits.length,

          uniqueBoothVisitors:
            expoVisitors.size,

          sessions:
            expoSessions.length,

          sessionRegistrations:
            sessionRegistrationCount,
        };
      }
    );

    res.status(200).json({
      stats: {
        totalExpos,
        totalExhibitors,
        totalAttendees,
        totalRegistrations,

        totalSessions:
          sessions.length,

        totalBooths:
          booths.length,

        totalBoothVisits,

        uniqueBoothVisitors,
      },

      applicationStatus,

      boothStatus,

      monthlyAttendance,

      popularSessions,

      categoryPerformance,

      boothTraffic,

      expoPerformance,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export { getAdminAnalytics };