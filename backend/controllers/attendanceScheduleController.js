const db = require("../config/db");

// Mendapatkan jadwal absensi
const getAttendanceSchedule = async (req, res) => {
  try {
    const [schedule] = await db.query("SELECT * FROM attendance_schedule LIMIT 1");
    if (schedule.length === 0) {
      return res.status(404).json({ error: "Jadwal absensi belum diatur" });
    }
    res.json(schedule[0]);
  } catch (error) {
    console.error("Error fetching attendance schedule:", error);
    res.status(500).json({ error: "Gagal mengambil jadwal absensi" });
  }
};

// Memperbarui jadwal absensi
const updateAttendanceSchedule = async (req, res) => {
  try {
    const { check_in_start, check_in_end, check_out_start, check_out_end } = req.body;

    // Validasi input
    if (
      !check_in_start || !check_in_end || !check_out_start || !check_out_end ||
      check_in_end <= check_in_start || check_out_end <= check_out_start
    ) {
      return res.status(400).json({ error: "Jadwal tidak valid. Pastikan waktu selesai lebih besar dari waktu mulai." });
    }

    await db.query(
      "REPLACE INTO attendance_schedule (id, check_in_start, check_in_end, check_out_start, check_out_end) VALUES (1, ?, ?, ?, ?)",
      [check_in_start, check_in_end, check_out_start, check_out_end]
    );

    res.json({ message: "Jadwal absensi berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating attendance schedule:", error);
    res.status(500).json({ error: "Gagal memperbarui jadwal absensi" });
  }
};

module.exports = {
  getAttendanceSchedule,
  updateAttendanceSchedule,
};