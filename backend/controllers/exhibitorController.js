import Application from "../models/Application.js";
import Booth from "../models/booth.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const getRegisteredExhibitors = async (req, res) => {
  try {
    const exhibitors = await User.find({
      role: "exhibitor",
    })
      .select(
        "name companyName email phone website category description logo createdAt"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json(exhibitors);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getApprovedExhibitors = async (req, res) => {
  try {
    const applications = await Application.find({
      status: "approved",
    })
      .populate(
        "exhibitor",
        "name companyName email phone website category description logo shareContactInfo"
      )
      .populate(
        "expo",
        "title category"
      )
      .sort({
        createdAt: -1,
      });

    const result = await Promise.all(
      applications.map(async (application) => {
        const booth = await Booth.findOne({
          expo: application.expo?._id,
          exhibitor: application.exhibitor?._id,
          status: "assigned",
        });

        const products = await Product.find({
          exhibitor: application.exhibitor?._id,
        }).select(
          "name category description"
        );

        const shareContactInfo =
          application.exhibitor
            ?.shareContactInfo === true;

        return {
          _id: application.exhibitor?._id,
          applicationId: application._id,

          name:
            application.exhibitor?.name,

          companyName:
            application.exhibitor
              ?.companyName,

          email: shareContactInfo
            ? application.exhibitor?.email
            : "",

          phone: shareContactInfo
            ? application.exhibitor?.phone
            : "",

          website:
            application.exhibitor
              ?.website || "",

          category:
            application.exhibitor
              ?.category || "",

          description:
            application.exhibitor
              ?.description || "",

          logo:
            application.exhibitor?.logo ||
            "",

          shareContactInfo,

          expo: application.expo,

          boothId: booth?._id || null,

          boothNumber:
            booth?.boothNumber ||
            "Not Assigned",

          hall:
            booth?.hall ||
            "Not Assigned",

          boothType:
            booth?.boothType ||
            "Not Assigned",

          products,
        };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getExhibitorByApplicationId = async (
  req,
  res
) => {
  try {
    const application = await Application.findOne({
      _id: req.params.applicationId,
      status: "approved",
    })
      .populate(
        "exhibitor",
        "name companyName email phone website category description logo shareContactInfo"
      )
      .populate(
        "expo",
        "title category"
      );

    if (
      !application ||
      !application.exhibitor
    ) {
      return res.status(404).json({
        message:
          "Approved exhibitor not found",
      });
    }

    const booth = await Booth.findOne({
      expo: application.expo?._id,
      exhibitor:
        application.exhibitor._id,
      status: "assigned",
    });

    const products = await Product.find({
      exhibitor:
        application.exhibitor._id,
    }).sort({
      createdAt: -1,
    });

    const shareContactInfo =
      application.exhibitor
        .shareContactInfo === true;

    res.status(200).json({
      _id: application.exhibitor._id,
      applicationId: application._id,

      name:
        application.exhibitor.name,

      companyName:
        application.exhibitor.companyName,

      email: shareContactInfo
        ? application.exhibitor.email
        : "",

      phone: shareContactInfo
        ? application.exhibitor.phone
        : "",

      website:
        application.exhibitor.website ||
        "",

      category:
        application.exhibitor.category ||
        "",

      description:
        application.exhibitor
          .description || "",

      logo:
        application.exhibitor.logo || "",

      shareContactInfo,

      expo: application.expo,

      boothId: booth?._id || null,

      boothNumber:
        booth?.boothNumber ||
        "Not Assigned",

      hall:
        booth?.hall ||
        "Not Assigned",

      boothType:
        booth?.boothType ||
        "Not Assigned",

      products,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  getRegisteredExhibitors,
  getApprovedExhibitors,
  getExhibitorByApplicationId,
};