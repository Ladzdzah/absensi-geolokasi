const db = require("../config/db");

// Mendapatkan semua data absensi berdasarkan user_id
const getAttendanceByUser = async (req, res) => {
  try {
    const userId = req.user.id; // Ambil user_id dari token
    const [attendance] = await db.query(
      "SELECT * FROM attendance WHERE user_id = ? ORDER BY check_in_time DESC",
      [userId]
    );
    res.json(attendance);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Gagal mengambil data absensi" });
  }
};

// Menyimpan absensi masuk
const createCheckIn = async (req, res) => {
  try {
    const { latitude, longitude, status } = req.body;
    const userId = req.user.id; // Ambil user_id dari token

    // Simpan data absensi masuk
    await db.query(
      "INSERT INTO attendance (user_id, check_in_time, latitude, longitude, status) VALUES (?, NOW(), ?, ?, ?)",
      [userId, latitude, longitude, status]
    );

    res.status(201).json({ message: "Absensi masuk berhasil" });
  } catch (error) {
    console.error("Error creating check-in:", error);
    res.status(500).json({ error: "Gagal menyimpan absensi masuk" });
  }
};

// Memperbarui absensi keluar
const createCheckOut = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user.id; // Ambil user_id dari token

    // Perbarui data absensi keluar
    const [result] = await db.query(
      "UPDATE attendance SET check_out_time = NOW(), latitude = ?, longitude = ? WHERE user_id = ? AND check_out_time IS NULL",
      [latitude, longitude, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Tidak ada absensi masuk yang aktif" });
    }

    res.json({ message: "Absensi keluar berhasil" });
  } catch (error) {
    console.error("Error creating check-out:", error);
    res.status(500).json({ error: "Gagal menyimpan absensi keluar" });
  }
};

module.exports = {
  getAttendanceByUser,
  createCheckIn,
  createCheckOut,
};