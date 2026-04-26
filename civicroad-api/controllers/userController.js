const fs = require("fs/promises");
const path = require("path");
const { getDb } = require("../db");
const { normalizeUser } = require("./authController");

const uploadsDirectory = path.join(__dirname, "..", "uploads");

async function getUserById(id) {
  const db = getDb();

  return db.get(
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
    [id]
  );
}

async function removeUploadedProfileImage(relativePath) {
  if (!relativePath || !relativePath.startsWith("/uploads/")) {
    return;
  }

  const fileName = path.basename(relativePath);
  const filePath = path.join(uploadsDirectory, fileName);

  try {
    await fs.unlink(filePath);
  } catch (_error) {
    // Ignore missing files so profile updates stay resilient.
  }
}

async function getUser(request, response, next) {
  try {
    const user = await getUserById(request.params.id);

    if (!user) {
      response.status(404).json({
        message: "User not found.",
      });
      return;
    }

    response.json(normalizeUser(user));
  } catch (error) {
    next(error);
  }
}

async function updateUser(request, response, next) {
  try {
    const db = getDb();
    const user = await getUserById(request.params.id);

    if (!user) {
      response.status(404).json({
        message: "User not found.",
      });
      return;
    }

    const updates = [];
    const values = [];
    const nextProfileImageUrl = request.file ? `/uploads/${request.file.filename}` : undefined;

    const fieldConfig = [
      ["first_name", request.body.first_name],
      ["last_name", request.body.last_name],
      ["bio", request.body.bio],
      ["push_token", request.body.push_token],
    ];

    if (nextProfileImageUrl !== undefined) {
      fieldConfig.push(["profile_image_url", nextProfileImageUrl]);
    } else if (request.body.profile_image_url !== undefined) {
      fieldConfig.push(["profile_image_url", request.body.profile_image_url]);
    }

    for (const [field, value] of fieldConfig) {
      if (value !== undefined) {
        updates.push(`${field} = ?`);
        values.push(value === null ? null : String(value).trim());
      }
    }

    if (request.body.email !== undefined) {
      const email = String(request.body.email).trim().toLowerCase();

      if (!email) {
        response.status(400).json({
          message: "Email cannot be empty.",
        });
        return;
      }

      const existingUser = await db.get(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email, request.params.id]
      );

      if (existingUser) {
        response.status(409).json({
          message: "Email already exists",
        });
        return;
      }

      updates.push("email = ?");
      values.push(email);
    }

    if (!updates.length) {
      response.status(400).json({
        message: "At least one profile field is required.",
      });
      return;
    }

    values.push(request.params.id);

    await db.run(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values);

    if (
      nextProfileImageUrl &&
      user.profile_image_url &&
      user.profile_image_url !== nextProfileImageUrl
    ) {
      await removeUploadedProfileImage(user.profile_image_url);
    }

    const updatedUser = await getUserById(request.params.id);
    response.json(normalizeUser(updatedUser));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUser,
  updateUser,
};
