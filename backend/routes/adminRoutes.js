const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const {
  getOfficeLocation,
  updateOfficeLocation,
} = require("../controllers/officeLocationController");
const {
  getAttendanceSchedule,
  updateAttendanceSchedule,
} = require("../controllers/attendanceScheduleController");
const {
  getAttendanceByUser,
  createCheckIn,
  createCheckOut,
} = require("../controllers/attendanceController");

// Get all users
router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, username, full_name, role FROM users"
    );
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Gagal mengambil data user" });
  }
});

// Register new user (admin only)
router.post("/register", verifyToken, isAdmin, async (req, res) => {
  try {
    const { username, password, nama, role } = req.body;

    // Cek apakah username sudah terdaftar
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "username sudah terdaftar" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru
    await db.query(
      "INSERT INTO users (username, password, nama, role) VALUES ( ?, ?, ?, ?)",
      [username, hashedPassword, nama, role]
    );

    res.status(201).json({ message: "User berhasil didaftarkan" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Gagal mendaftarkan user" });
  }
});

// Delete user
router.delete("/users/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists and is not an admin
    const [user] = await db.query(
      "SELECT role FROM users WHERE id = ?",
      [id]
    );

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan"
      });
    }

    if (user[0].role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Tidak dapat menghapus akun admin"
      });
    }

    // Delete the user
    await db.query("DELETE FROM users WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "User berhasil dihapus"
    });

  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false, 
      message: "Gagal menghapus user"
    });
  }
});

// Add new endpoint for admin password verification
router.post("/verify", verifyToken, async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    const [admin] = await db.query(
      'SELECT password FROM users WHERE id = ? AND role = "admin"',
      [userId]
    );

    if (!admin[0]) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    const isValid = await bcrypt.compare(password, admin[0].password);
    
    if (!isValid) {
      return res.status(401).json({ message: 'Password admin tidak valid' });
    }

    res.json({ message: 'Password admin valid' });
  } catch (error) {
    console.error('Error verifying admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint untuk mendapatkan lokasi kantor
router.get("/office-location", verifyToken, getOfficeLocation);

// Endpoint untuk memperbarui lokasi kantor
router.put("/office-location", verifyToken, isAdmin, updateOfficeLocation);

// Endpoint untuk mendapatkan jadwal absensi
router.get("/attendance-schedule", verifyToken, getAttendanceSchedule);

// Endpoint untuk memperbarui jadwal absensi
router.put("/attendance-schedule", verifyToken, isAdmin, updateAttendanceSchedule);

// Endpoint untuk mendapatkan data absensi berdasarkan user_id
router.get("/attendance", verifyToken, getAttendanceByUser);

// Endpoint untuk absensi masuk
router.post("/attendance/check-in", verifyToken, createCheckIn);

// Endpoint untuk absensi keluar
router.post("/attendance/check-out", verifyToken, createCheckOut);

module.exports = router;
