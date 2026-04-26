const express = require("express");
const upload = require("../middleware/upload");
const { getUser, updateUser } = require("../controllers/userController");

const router = express.Router();

router.get("/:id", getUser);
router.patch("/:id", upload.single("profile_image"), updateUser);

module.exports = router;
