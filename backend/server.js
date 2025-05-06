require("dotenv").config();
const session = require("express-session");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");


const app = express();

// Middleware untuk logging
app.use(morgan("dev"));

// Konfigurasi CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Konfigurasi body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Konfigurasi session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "rahasia",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 jam
    },
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    message: "Terjadi kesalahan server",
    error: err.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

// Example function to calculate distance (you need to implement or import getDistance)
const getDistance = (location1, location2) => {
  // Placeholder logic for distance calculation
  const latDiff = location1.latitude - location2.latitude;
  const lngDiff = location1.longitude - location2.longitude;
  return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
};

// Example usage of getDistance (ensure currentLocation and officeLocation are defined)
const isWithinRadius = (currentLocation, officeLocation) => {
  const distance = getDistance(
    { latitude: currentLocation.lat, longitude: currentLocation.lng },
    { latitude: officeLocation.lat, longitude: officeLocation.lng }
  );
  return distance <= officeLocation.radius;
};