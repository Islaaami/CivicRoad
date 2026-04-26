const path = require("path");
const os = require("os");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { initDb } = require("./db");
const attachRequestUser = require("./middleware/attachRequestUser");

const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const port = process.env.PORT || 4000;
const host = process.env.HOST || "0.0.0.0";

function getLocalIpv4Addresses() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((network) => network && network.family === "IPv4" && !network.internal)
    .map((network) => network.address);
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(attachRequestUser);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (_request, response) => {
  response.json({
    message: "CivicRoad API is running.",
  });
});

app.use("/auth", authRoutes);
app.use("/reports", reportRoutes);
app.use("/categories", categoryRoutes);
app.use("/users", userRoutes);

app.use((error, _request, response, _next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    response.status(400).json({
      message: "Image must be 5MB or smaller.",
    });
    return;
  }

  const statusCode = error.statusCode || 500;
  response.status(statusCode).json({
    message: statusCode >= 500 ? "Something went wrong." : error.message,
  });
});

initDb()
  .then(() => {
    app.listen(port, host, () => {
      console.log(`CivicRoad API listening on http://localhost:${port}`);

      const localAddresses = getLocalIpv4Addresses();

      if (localAddresses.length) {
        localAddresses.forEach((address) => {
          console.log(`CivicRoad API LAN URL: http://${address}:${port}`);
        });
      }
    });
  })
  .catch((error) => {
    console.error("Failed to start CivicRoad API:", error);
    process.exit(1);
  });
