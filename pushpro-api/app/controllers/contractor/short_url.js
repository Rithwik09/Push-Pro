const db = require("../../../models");
const { ValidationError, ServerError } = require("../../errors/CustomError");
const catchAsyncError = require("../../helpers/catch-async-error");
const axios = require("axios");

// GET all short URLs for a user
const getShortUrls = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    const shortUrls = await db.ShortUrl.findOne({
      where: { user_id: userId },
      attributes: ["id", "short_url", "short_url2", "createdAt"],
      include: [
        {
          model: db.Users,
          as: "user",
          attributes: [
            "id",
            "first_name",
            "last_name",
            "email_address",
            "is_contractor"
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: shortUrls,
      message: "Short URLs fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Short URLs: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

// POST a new short URL
const createShortUrl = catchAsyncError(async (req, res) => {
  const { url } = req.body;
  const user_id = req.user.id;
  if (!user_id || !url) {
    throw new ValidationError("User ID and URL are required");
  }

  try {
    const response = await axios.post(
      "https://api.tinyurl.com/create",
      {
        url: url,
        domain: "tinyurl.com"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SHORT_URL_SECRET_KEY} `,
          "Content-Type": "application/json"
        }
      }
    );

    const short_url = response.data.data.tiny_url;

    let existingShortUrl = await db.ShortUrl.findOne({ where: { user_id } });
    let newShortUrl;
    let message;

    if (existingShortUrl) {
      newShortUrl = await existingShortUrl.update({ short_url });
      message = "Short URL updated successfully";
    } else {
      newShortUrl = await db.ShortUrl.create({ user_id, short_url });
      message = "Short URL created successfully";
    }

    res.status(201).json({
      success: true,
      data: newShortUrl,
      message,
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Create/Update Short URL: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const createShortUrl2 = catchAsyncError(async (req, res) => {
  const { url } = req.body;
  const user_id = req.user.id;
  if (!user_id || !url) {
    throw new ValidationError("User ID and URL are required");
  }
  try {
    const response = await axios.post(
      "https://api.tinyurl.com/create",
      {
        url: url,
        domain: "tinyurl.com"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SHORT_URL_SECRET_KEY} `,
          "Content-Type": "application/json"
        }
      }
    );
    const short_url2 = response.data.data.tiny_url;
    let existingShortUrl = await db.ShortUrl.findOne({ where: { user_id } });
    let newShortUrl;
    let message;
    if (existingShortUrl) {
      newShortUrl = await existingShortUrl.update({ short_url2 });
      message = "Short URL updated successfully";
    } else {
      newShortUrl = await db.ShortUrl.create({ user_id, short_url2 });
      message = "Short URL created successfully";
    }

    res.status(201).json({
      success: true,
      data: newShortUrl,
      message,
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Create/Update Short URL: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getShortUrls,
  createShortUrl,
  createShortUrl2
};
