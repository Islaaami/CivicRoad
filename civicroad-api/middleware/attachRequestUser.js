const { getDb } = require("../db");
const { normalizeUser } = require("../controllers/authController");

async function attachRequestUser(request, response, next) {
  try {
    const rawUserId = request.get("x-user-id");

    if (!rawUserId) {
      next();
      return;
    }

    const userId = Number(rawUserId);

    if (!Number.isInteger(userId) || userId <= 0) {
      response.status(400).json({
        message: "x-user-id must be a valid user id.",
      });
      return;
    }

    const db = getDb();
    const user = await db.get(
      `
        SELECT
          id,
          email,
          role,
          first_name,
          last_name,
          bio,
          municipality,
          profile_image_url,
          push_token
        FROM users
        WHERE id = ?
      `,
      [userId]
    );

    if (!user) {
      response.status(401).json({
        message: "Unable to identify the current user.",
      });
      return;
    }

    request.user = normalizeUser(user);
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = attachRequestUser;
