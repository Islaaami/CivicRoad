const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const { determineMunicipalityFromCoordinates } = require("../utils/municipality");

const dataDirectory = path.join(__dirname, "..", "data");
const databasePath = path.join(dataDirectory, "civicroad.sqlite");

let db;

const MUNICIPALITY_ADMINS = [
  {
    email: "admin.agadir@civicroad.ma",
    password: "admin123",
    first_name: "Agadir",
    last_name: "Admin",
    municipality: "Agadir",
  },
  {
    email: "admin.inezgane@civicroad.ma",
    password: "admin123",
    first_name: "Inezgane",
    last_name: "Admin",
    municipality: "Inezgane",
  },
  {
    email: "admin.ait-melloul@civicroad.ma",
    password: "admin123",
    first_name: "Ait Melloul",
    last_name: "Admin",
    municipality: "Ait Melloul",
  },
  {
    email: "admin.taghazout@civicroad.ma",
    password: "admin123",
    first_name: "Taghazout",
    last_name: "Admin",
    municipality: "Taghazout",
  },
  {
    email: "admin.aourir@civicroad.ma",
    password: "admin123",
    first_name: "Aourir",
    last_name: "Admin",
    municipality: "Aourir",
  },
  {
    email: "admin.drargua@civicroad.ma",
    password: "admin123",
    first_name: "Drargua",
    last_name: "Admin",
    municipality: "Drargua",
  },
  {
    email: "admin.dcheira@civicroad.ma",
    password: "admin123",
    first_name: "Dcheira El Jihadia",
    last_name: "Admin",
    municipality: "Dcheira El Jihadia",
  },
  {
    email: "admin.lqliaa@civicroad.ma",
    password: "admin123",
    first_name: "Lqliaa",
    last_name: "Admin",
    municipality: "Lqliaa",
  },
  {
    email: "admin.temsia@civicroad.ma",
    password: "admin123",
    first_name: "Temsia",
    last_name: "Admin",
    municipality: "Temsia",
  },
];

async function ensureColumnExists(tableName, columnName, columnDefinition) {
  const columns = await db.all(`PRAGMA table_info(${tableName})`);
  const hasColumn = columns.some((column) => column.name === columnName);

  if (!hasColumn) {
    await db.exec(
      `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`
    );
  }
}

function normalizeDefaultValue(value) {
  return String(value || "")
    .replace(/^['"(]+/, "")
    .replace(/['")]+$/, "")
    .trim()
    .toLowerCase();
}

async function getColumnInfo(tableName, columnName) {
  const columns = await db.all(`PRAGMA table_info(${tableName})`);
  return columns.find((column) => column.name === columnName) || null;
}

async function rebuildReportsTableWithNullablePriority() {
  await db.exec(`
    PRAGMA foreign_keys = OFF;
    BEGIN TRANSACTION;

    CREATE TABLE reports_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      citizen_id INTEGER,
      category_id INTEGER,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      municipality TEXT,
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'resolved')),
      priority TEXT
        CHECK (priority IN ('low', 'medium', 'high') OR priority IS NULL),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (citizen_id) REFERENCES users(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    INSERT INTO reports_new (
      id,
      citizen_id,
      category_id,
      title,
      description,
      latitude,
      longitude,
      municipality,
      status,
      priority,
      created_at
    )
    SELECT
      id,
      citizen_id,
      category_id,
      title,
      description,
      latitude,
      longitude,
      municipality,
      status,
      priority,
      created_at
    FROM reports;

    DROP TABLE reports;
    ALTER TABLE reports_new RENAME TO reports;

    COMMIT;
    PRAGMA foreign_keys = ON;
  `);
}

async function rebuildFalseReportsTableWithNullablePriority() {
  await db.exec(`
    PRAGMA foreign_keys = OFF;
    BEGIN TRANSACTION;

    CREATE TABLE false_reports_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      image_url TEXT,
      latitude REAL,
      longitude REAL,
      address TEXT,
      category_id INTEGER,
      municipality TEXT,
      priority TEXT
        CHECK (priority IN ('low', 'medium', 'high') OR priority IS NULL),
      created_at TEXT,
      deleted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    INSERT INTO false_reports_new (
      id,
      title,
      description,
      image_url,
      latitude,
      longitude,
      address,
      category_id,
      municipality,
      priority,
      created_at,
      deleted_at
    )
    SELECT
      id,
      title,
      description,
      image_url,
      latitude,
      longitude,
      address,
      category_id,
      municipality,
      priority,
      created_at,
      deleted_at
    FROM false_reports;

    DROP TABLE false_reports;
    ALTER TABLE false_reports_new RENAME TO false_reports;

    COMMIT;
    PRAGMA foreign_keys = ON;
  `);
}

async function ensurePriorityColumnsAllowNull() {
  const reportsPriorityColumn = await getColumnInfo("reports", "priority");
  const falseReportsPriorityColumn = await getColumnInfo("false_reports", "priority");

  if (
    reportsPriorityColumn &&
    (reportsPriorityColumn.notnull === 1 ||
      normalizeDefaultValue(reportsPriorityColumn.dflt_value) === "medium")
  ) {
    await rebuildReportsTableWithNullablePriority();
  }

  if (
    falseReportsPriorityColumn &&
    (falseReportsPriorityColumn.notnull === 1 ||
      normalizeDefaultValue(falseReportsPriorityColumn.dflt_value) === "medium")
  ) {
    await rebuildFalseReportsTableWithNullablePriority();
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

async function ensureAdminUsers() {
  await db.run("DELETE FROM users WHERE email = ?", ["admin@example.com"]);

  for (const adminUser of MUNICIPALITY_ADMINS) {
    await db.run(
      `
        INSERT INTO users (
          email,
          password,
          role,
          first_name,
          last_name,
          bio,
          municipality
        )
        VALUES (?, ?, 'admin', ?, ?, '', ?)
        ON CONFLICT(email) DO UPDATE SET
          password = excluded.password,
          role = excluded.role,
          first_name = excluded.first_name,
          last_name = excluded.last_name,
          bio = excluded.bio,
          municipality = excluded.municipality
      `,
      [
        adminUser.email,
        adminUser.password,
        adminUser.first_name,
        adminUser.last_name,
        adminUser.municipality,
      ]
    );
  }
}

async function seedDemoReports() {
  await db.run(
    `
      INSERT INTO users (email, password, role, first_name, last_name, bio)
      VALUES (?, ?, 'citizen', ?, ?, '')
      ON CONFLICT(email) DO UPDATE SET
        password = excluded.password,
        role = excluded.role,
        first_name = excluded.first_name,
        last_name = excluded.last_name
    `,
    ["citizen.demo@civicroad.local", "demo123", "Demo", "Citizen"]
  );

  const demoCitizen = await db.get(
    "SELECT id FROM users WHERE email = ?",
    ["citizen.demo@civicroad.local"]
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
      priority: "high",
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
      priority: "medium",
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
      priority: "low",
      createdAt: "datetime('now', '-2 days')",
    },
    {
      categoryName: "Obstruction",
      title: "Blocked sidewalk near Inezgane transport hub",
      description:
        "Temporary barriers are forcing pedestrians into traffic around the main station area.",
      latitude: 30.35535,
      longitude: -9.53639,
      status: "pending",
      priority: "high",
      createdAt: "datetime('now', '-10 hours')",
    },
    {
      categoryName: "Water Leak",
      title: "Water leak spreading beside Ait Melloul market",
      description:
        "Water has been pooling across the edge of the road and making the area slippery.",
      latitude: 30.34164,
      longitude: -9.50356,
      status: "pending",
      priority: "medium",
      createdAt: "datetime('now', '-14 hours')",
    },
  ];

  for (const report of demoReports) {
    const existingReport = await db.get("SELECT id FROM reports WHERE title = ?", [
      report.title,
    ]);

    if (existingReport) {
      continue;
    }

    const category = await db.get("SELECT id FROM categories WHERE name = ?", [
      report.categoryName,
    ]);
    const municipality = determineMunicipalityFromCoordinates(
      report.latitude,
      report.longitude
    );

    await db.run(
      `
        INSERT INTO reports (
          citizen_id,
          category_id,
          title,
          description,
          latitude,
          longitude,
          municipality,
          status,
          priority,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ${report.createdAt})
      `,
      [
        demoCitizen.id,
        category.id,
        report.title,
        report.description,
        report.latitude,
        report.longitude,
        municipality,
        report.status,
        report.priority,
      ]
    );
  }
}

async function backfillReportMunicipalities() {
  const reports = await db.all(
    `
      SELECT id, latitude, longitude
      FROM reports
      WHERE municipality IS NULL OR TRIM(municipality) = ''
    `
  );

  for (const report of reports) {
    const municipality = determineMunicipalityFromCoordinates(
      Number(report.latitude),
      Number(report.longitude)
    );

    await db.run("UPDATE reports SET municipality = ? WHERE id = ?", [
      municipality,
      report.id,
    ]);
  }
}

async function normalizeReportPriorities() {
  await db.run(
    "UPDATE reports SET priority = NULL WHERE priority IS NOT NULL AND TRIM(priority) = ''"
  );
  await db.run(
    "UPDATE false_reports SET priority = NULL WHERE priority IS NOT NULL AND TRIM(priority) = ''"
  );
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
      role TEXT NOT NULL DEFAULT 'staff',
      municipality TEXT
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
      municipality TEXT,
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'resolved')),
      priority TEXT
        CHECK (priority IN ('low', 'medium', 'high') OR priority IS NULL),
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

    CREATE TABLE IF NOT EXISTS false_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      image_url TEXT,
      latitude REAL,
      longitude REAL,
      address TEXT,
      category_id INTEGER,
      municipality TEXT,
      priority TEXT
        CHECK (priority IN ('low', 'medium', 'high') OR priority IS NULL),
      created_at TEXT,
      deleted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
  `);

  await ensureColumnExists("users", "first_name", "TEXT DEFAULT ''");
  await ensureColumnExists("users", "last_name", "TEXT DEFAULT ''");
  await ensureColumnExists("users", "bio", "TEXT DEFAULT ''");
  await ensureColumnExists("users", "municipality", "TEXT");
  await ensureColumnExists("users", "profile_image_url", "TEXT");
  await ensureColumnExists("users", "push_token", "TEXT");
  await ensureColumnExists("reports", "municipality", "TEXT");
  await ensureColumnExists("reports", "priority", "TEXT");
  await ensureColumnExists("false_reports", "municipality", "TEXT");
  await ensureColumnExists("false_reports", "priority", "TEXT");
  await ensurePriorityColumnsAllowNull();

  await ensureAdminUsers();
  await seedCategories();
  await seedDemoReports();
  await backfillReportMunicipalities();
  await normalizeReportPriorities();

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
