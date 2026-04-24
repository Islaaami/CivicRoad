const fs = require("fs/promises");
const path = require("path");
const { getDb } = require("../db");

const VALID_STATUSES = ["pending", "in_progress", "resolved"];
const uploadsDirectory = path.join(__dirname, "..", "uploads");

function normalizeReport(report, images = []) {
  if (!report) {
    return null;
  }

  return {
    ...report,
    images,
    image_url: report.image_url || (images[0] ? images[0].url : null),
  };
}

async function fetchReportById(id) {
  const db = getDb();
  const report = await db.get(
    `
      SELECT
        reports.id,
        reports.citizen_id,
        reports.category_id,
        categories.name AS category_name,
        reports.title,
        reports.description,
        reports.latitude,
        reports.longitude,
        reports.status,
        reports.created_at,
        (
          SELECT url
          FROM report_images
          WHERE report_id = reports.id
          ORDER BY id ASC
          LIMIT 1
        ) AS image_url
      FROM reports
      LEFT JOIN categories ON categories.id = reports.category_id
      WHERE reports.id = ?
    `,
    [id]
  );

  if (!report) {
    return null;
  }

  const images = await db.all(
    "SELECT id, url FROM report_images WHERE report_id = ? ORDER BY id ASC",
    [id]
  );

  return normalizeReport(report, images);
}

async function getReports(_request, response, next) {
  try {
    const db = getDb();
    const reports = await db.all(`
      SELECT
        reports.id,
        reports.citizen_id,
        reports.category_id,
        categories.name AS category_name,
        reports.title,
        reports.description,
        reports.latitude,
        reports.longitude,
        reports.status,
        reports.created_at,
        (
          SELECT url
          FROM report_images
          WHERE report_id = reports.id
          ORDER BY id ASC
          LIMIT 1
        ) AS image_url
      FROM reports
      LEFT JOIN categories ON categories.id = reports.category_id
      ORDER BY datetime(reports.created_at) DESC, reports.id DESC
    `);

    response.json(reports.map((report) => normalizeReport(report)));
  } catch (error) {
    next(error);
  }
}

async function getReport(request, response, next) {
  try {
    const report = await fetchReportById(request.params.id);

    if (!report) {
      response.status(404).json({
        message: "Report not found.",
      });
      return;
    }

    response.json(report);
  } catch (error) {
    next(error);
  }
}

async function createReport(request, response, next) {
  try {
    const { title, description, category_id, latitude, longitude, citizen_id } =
      request.body;

    const missingRequiredFields = [
      title,
      description,
      category_id,
      latitude,
      longitude,
    ].some(
      (value) =>
        value === undefined || value === null || String(value).trim() === ""
    );

    if (missingRequiredFields) {
      response.status(400).json({
        message:
          "Title, description, category_id, latitude, and longitude are required.",
      });
      return;
    }

    const parsedCategoryId = Number(category_id);
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);
    const parsedCitizenId = citizen_id ? Number(citizen_id) : null;

    if (
      !Number.isInteger(parsedCategoryId) ||
      !Number.isFinite(parsedLatitude) ||
      !Number.isFinite(parsedLongitude) ||
      (citizen_id && !Number.isInteger(parsedCitizenId))
    ) {
      response.status(400).json({
        message:
          "category_id, latitude, longitude, and citizen_id must be valid numbers.",
      });
      return;
    }

    const db = getDb();
    const category = await db.get("SELECT id FROM categories WHERE id = ?", [
      parsedCategoryId,
    ]);

    if (!category) {
      response.status(400).json({
        message: "Selected category does not exist.",
      });
      return;
    }

    if (parsedCitizenId) {
      const citizen = await db.get("SELECT id FROM users WHERE id = ?", [
        parsedCitizenId,
      ]);

      if (!citizen) {
        response.status(400).json({
          message: "Selected citizen does not exist.",
        });
        return;
      }
    }

    const result = await db.run(
      `
        INSERT INTO reports (
          citizen_id,
          category_id,
          title,
          description,
          latitude,
          longitude,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
      `,
      [
        parsedCitizenId,
        parsedCategoryId,
        title,
        description,
        parsedLatitude,
        parsedLongitude,
      ]
    );

    if (request.file) {
      await db.run(
        "INSERT INTO report_images (report_id, url) VALUES (?, ?)",
        [result.lastID, `/uploads/${request.file.filename}`]
      );
    }

    const report = await fetchReportById(result.lastID);
    response.status(201).json(report);
  } catch (error) {
    next(error);
  }
}

async function updateReport(request, response, next) {
  try {
    const report = await fetchReportById(request.params.id);

    if (!report) {
      response.status(404).json({
        message: "Report not found.",
      });
      return;
    }

    const nextTitle =
      request.body.title !== undefined ? String(request.body.title).trim() : report.title;
    const nextDescription =
      request.body.description !== undefined
        ? String(request.body.description).trim()
        : report.description;

    if (!nextTitle || !nextDescription) {
      response.status(400).json({
        message: "Title and description cannot be empty.",
      });
      return;
    }

    const db = getDb();
    await db.run("UPDATE reports SET title = ?, description = ? WHERE id = ?", [
      nextTitle,
      nextDescription,
      request.params.id,
    ]);

    const updatedReport = await fetchReportById(request.params.id);
    response.json(updatedReport);
  } catch (error) {
    next(error);
  }
}

async function updateReportStatus(request, response, next) {
  try {
    const { status } = request.body;

    if (!VALID_STATUSES.includes(status)) {
      response.status(400).json({
        message: `Status must be one of: ${VALID_STATUSES.join(", ")}.`,
      });
      return;
    }

    const report = await fetchReportById(request.params.id);

    if (!report) {
      response.status(404).json({
        message: "Report not found.",
      });
      return;
    }

    const db = getDb();
    await db.run("UPDATE reports SET status = ? WHERE id = ?", [
      status,
      request.params.id,
    ]);

    const updatedReport = await fetchReportById(request.params.id);
    response.json(updatedReport);
  } catch (error) {
    next(error);
  }
}

async function deleteReport(request, response, next) {
  try {
    const db = getDb();
    const report = await fetchReportById(request.params.id);

    if (!report) {
      response.status(404).json({
        message: "Report not found.",
      });
      return;
    }

    const images = await db.all(
      "SELECT url FROM report_images WHERE report_id = ? ORDER BY id ASC",
      [request.params.id]
    );

    await db.run("DELETE FROM reports WHERE id = ?", [request.params.id]);

    await Promise.all(
      images.map(async (image) => {
        if (!image.url) {
          return;
        }

        const fileName = path.basename(image.url);
        const filePath = path.join(uploadsDirectory, fileName);

        try {
          await fs.unlink(filePath);
        } catch (_error) {
          // Ignore missing files so deleting a report remains safe and idempotent.
        }
      })
    );

    response.json({
      message: "Report deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  VALID_STATUSES,
  getReports,
  getReport,
  createReport,
  updateReport,
  updateReportStatus,
  deleteReport,
};
