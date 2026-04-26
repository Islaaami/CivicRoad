const fs = require("fs/promises");
const path = require("path");
const { getDb } = require("../db");

const uploadsDirectory = path.join(__dirname, "..", "uploads");

function getAdminScope(requestUser, tableAlias = "false_reports") {
  if (requestUser?.role === "admin" && requestUser.municipality) {
    return {
      listClause: `WHERE ${tableAlias}.municipality = ?`,
      itemClause: ` AND ${tableAlias}.municipality = ?`,
      parameters: [requestUser.municipality],
    };
  }

  return {
    listClause: "",
    itemClause: "",
    parameters: [],
  };
}

function formatFallbackAddress(report) {
  const latitude = Number(report.latitude);
  const longitude = Number(report.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return report.municipality || "Unknown location";
  }

  if (report.municipality) {
    return `${report.municipality} (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;
  }

  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

function normalizeFalseReport(report) {
  if (!report) {
    return null;
  }

  return {
    ...report,
    address: report.address || formatFallbackAddress(report),
  };
}

async function deleteImageIfPresent(relativePath) {
  if (!relativePath || !relativePath.startsWith("/uploads/")) {
    return;
  }

  const fileName = path.basename(relativePath);
  const filePath = path.join(uploadsDirectory, fileName);

  try {
    await fs.unlink(filePath);
  } catch (_error) {
    // Ignore missing files so archiving false reports stays safe and idempotent.
  }
}

async function getFalseReports(request, response, next) {
  try {
    const db = getDb();
    const scope = getAdminScope(request.user);
    const falseReports = await db.all(
      `
        SELECT
          false_reports.id,
          false_reports.title,
          false_reports.description,
          false_reports.image_url,
          false_reports.latitude,
          false_reports.longitude,
          false_reports.address,
          false_reports.category_id,
          categories.name AS category_name,
          false_reports.municipality,
          false_reports.created_at,
          false_reports.deleted_at
        FROM false_reports
        LEFT JOIN categories ON categories.id = false_reports.category_id
        ${scope.listClause}
        ORDER BY datetime(false_reports.deleted_at) DESC, false_reports.id DESC
      `,
      scope.parameters
    );

    response.json(falseReports.map((report) => normalizeFalseReport(report)));
  } catch (error) {
    next(error);
  }
}

async function markReportAsFalse(request, response, next) {
  try {
    const db = getDb();
    const scope = getAdminScope(request.user, "reports");
    const report = await db.get(
      `
        SELECT
          reports.id,
          reports.title,
          reports.description,
          reports.latitude,
          reports.longitude,
          reports.municipality,
          reports.category_id,
          reports.created_at,
          (
            SELECT url
            FROM report_images
            WHERE report_id = reports.id
            ORDER BY id ASC
            LIMIT 1
          ) AS image_url
        FROM reports
        WHERE reports.id = ?${scope.itemClause}
      `,
      [request.params.id, ...scope.parameters]
    );

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
    const primaryImageUrl = images[0]?.url || report.image_url || null;
    const archivedAddress = formatFallbackAddress(report);

    const insertResult = await db.run(
      `
        INSERT INTO false_reports (
          title,
          description,
          image_url,
          latitude,
          longitude,
          address,
          category_id,
          municipality,
          created_at,
          deleted_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,
      [
        report.title,
        report.description,
        primaryImageUrl,
        report.latitude,
        report.longitude,
        archivedAddress,
        report.category_id,
        report.municipality,
        report.created_at,
      ]
    );

    await db.run("DELETE FROM reports WHERE id = ?", [request.params.id]);

    await Promise.all(images.slice(1).map((image) => deleteImageIfPresent(image.url)));

    response.json({
      message: "Report archived as false report.",
      false_report_id: insertResult.lastID,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getFalseReports,
  markReportAsFalse,
};
