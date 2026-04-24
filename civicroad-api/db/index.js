const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const dataDirectory = path.join(__dirname, "..", "data");
const databasePath = path.join(dataDirectory, "civicroad.sqlite");

let db;

async function ensureColumnExists(tableName, columnName, columnDefinition) {
  const columns = await db.all(`PRAGMA table_info(${tableName})`);
  const hasColumn = columns.some((column) => column.name === columnName);

  if (!hasColumn) {
    await db.exec(
      `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`
    );
  }
}

async function seedCategories() {
  const existingCategories = await db.get(
    "SELECT COUNT(*) AS count FROM categories"
  );

  if (existingCategories.count > 0) {
    return;
  }

  const categoryNames = [
    "Road Damage",
    "Streetlight",
    "Waste",
    "Water Leak",
    "Obstruction",
  ];

  for (const name of categoryNames) {
    await db.run("INSERT INTO categories (name) VALUES (?)", [name]);
  }
}

async function ensureAdminUser() {
  const adminEmail = "admin@example.com";
  const existingAdmin = await db.get(
    "SELECT id FROM users WHERE email = ?",
    [adminEmail]
  );

  if (existingAdmin) {
    return;
  }

  await db.run(
    `
      INSERT INTO users (
        email,
        password,
        role,
        first_name,
        last_name,
        bio
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    ["admin@example.com", "admin123", "admin", "Admin", "User", ""]
  );
}

async function seedDemoReports() {
  const existingReports = await db.get("SELECT COUNT(*) AS count FROM reports");

  if (existingReports.count > 0) {
    return;
  }

  const demoCitizen = await db.run(
    "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
    ["citizen.demo@civicroad.local", "demo123", "citizen"]
  );

  const demoReports = [
    {
      categoryName: "Road Damage",
      title: "Large pothole near the market roundabout",
      description:
        "Drivers are swerving into the next lane to avoid it, especially during rush hour.",
      latitude: 30.419974,
      longitude: -9.570921,
      status: "pending",
      createdAt: "datetime('now', '-6 hours')",
    },
    {
      categoryName: "Streetlight",
      title: "Streetlight out on the main boulevard",
      description:
        "The corner is very dark after sunset and pedestrians are crossing there regularly.",
      latitude: 30.401503,
      longitude: -9.583793,
      status: "in_progress",
      createdAt: "datetime('now', '-1 day')",
    },
    {
      categoryName: "Waste",
      title: "Overflowing bins beside the public garden",
      description:
        "Waste has started spilling onto the sidewalk and nearby benches are affected.",
      latitude: 30.419303,
      longitude: -9.592856,
      status: "resolved",
      createdAt: "datetime('now', '-2 days')",
    },
  ];

  for (const report of demoReports) {
    const category = await db.get("SELECT id FROM categories WHERE name = ?", [
      report.categoryName,
    ]);

    await db.run(
      `
        INSERT INTO reports (
          citizen_id,
          category_id,
          title,
          description,
          latitude,
          longitude,
          status,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ${report.createdAt})
      `,
      [
        demoCitizen.lastID,
        category.id,
        report.title,
        report.description,
        report.latitude,
        report.longitude,
        report.status,
      ]
    );
  }
}

async function initDb() {
  fs.mkdirSync(dataDirectory, { recursive: true });

  db = await open({
    filename: databasePath,
    driver: sqlite3.Database,
  });

  await db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'staff'
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      citizen_id INTEGER,
      category_id INTEGER,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'resolved')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (citizen_id) REFERENCES users(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS report_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER NOT NULL,
      url TEXT NOT NULL,
      FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
    );
  `);

  await ensureColumnExists("users", "first_name", "TEXT DEFAULT ''");
  await ensureColumnExists("users", "last_name", "TEXT DEFAULT ''");
  await ensureColumnExists("users", "bio", "TEXT DEFAULT ''");
  await ensureColumnExists("users", "profile_image_url", "TEXT");
  await ensureColumnExists("users", "push_token", "TEXT");

  await ensureAdminUser();
  await seedCategories();
  await seedDemoReports();

  return db;
}

function getDb() {
  if (!db) {
    throw new Error("Database has not been initialized yet.");
  }

  return db;
}

module.exports = {
  initDb,
  getDb,
};
