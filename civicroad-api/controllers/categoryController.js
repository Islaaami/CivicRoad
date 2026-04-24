const { getDb } = require("../db");

async function getCategories(_request, response, next) {
  try {
    const db = getDb();
    const categories = await db.all(
      "SELECT id, name FROM categories ORDER BY name ASC"
    );

    response.json(categories);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories,
};
