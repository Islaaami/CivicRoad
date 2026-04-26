const { getDb } = require("../db");

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    bio: user.bio || "",
    municipality: user.municipality || null,
    profile_image_url: user.profile_image_url || null,
    push_token: user.push_token || null,
  };
}

async function getUserByEmail(email) {
  const db = getDb();

  return db.get(
    `
      SELECT
        id,
        email,
        password,
        role,
        first_name,
        last_name,
        bio,
        municipality,
        profile_image_url,
        push_token
      FROM users
      WHERE email = ?
    `,
    [email]
  );
}

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

async function login(request, response, next) {
  try {
    const email = String(request.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(request.body.password || "");

    if (!email || !password) {
      response.status(400).json({
        message: "Email and password are required.",
      });
      return;
    }

    const db = getDb();
    const user = await getUserByEmail(email);

    if (!user || user.password !== password) {
      response.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    const authenticatedUser = await getUserById(user.id);
    response.json(normalizeUser(authenticatedUser));
  } catch (error) {
    next(error);
  }
}

async function register(request, response, next) {
  try {
    const email = String(request.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(request.body.password || "");
    const first_name = String(request.body.first_name || "").trim();
    const last_name = String(request.body.last_name || "").trim();

    if (!email || !password || !first_name || !last_name) {
      response.status(400).json({
        message: "Email, password, first_name, and last_name are required.",
      });
      return;
    }

    const db = getDb();
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      response.status(409).json({
        message: "Email already exists",
      });
      return;
    }

    const result = await db.run(
      `
        INSERT INTO users (
          email,
          password,
          role,
          first_name,
          last_name,
          bio
        )
        VALUES (?, ?, 'citizen', ?, ?, '')
      `,
      [email, password, first_name.trim(), last_name.trim()]
    );

    const user = await getUserById(result.lastID);
    response.status(201).json(normalizeUser(user));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  register,
  normalizeUser,
};
