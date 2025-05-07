const db = require("../config/db");

// Mendapatkan lokasi kantor
const getOfficeLocation = async (req, res) => {
  try {
    const [location] = await db.query("SELECT id, lat, lng, radius FROM office_location LIMIT 1");
    if (location.length === 0) {
      // Jika tidak ada data, kembalikan nilai default
      return res.json({
        lat: -7.446754760104717,
        lng: 109.24140415854745,
        radius: 100
      });
    }
    res.json(location[0]);
  } catch (error) {
    console.error("Error fetching office location:", error);
    res.status(500).json({ error: "Gagal mengambil lokasi kantor" });
  }
};

// Memperbarui lokasi kantor
const updateOfficeLocation = async (req, res) => {
  try {
    const { lat, lng, radius } = req.body;

    // Validasi input
    if (
      typeof lat !== "number" || lat < -90 || lat > 90 ||
      typeof lng !== "number" || lng < -180 || lng > 180 ||
      typeof radius !== "number" || radius <= 0
    ) {
      return res.status(400).json({ error: "Nilai Latitude (-90 hingga 90), Longitude (-180 hingga 180), dan Radius (> 0) harus valid." });
    }

    // Gunakan REPLACE INTO untuk meng-update atau insert baru jika belum ada
    await db.query(
      "REPLACE INTO office_location (id, lat, lng, radius) VALUES (1, ?, ?, ?)",
      [lat, lng, radius]
    );

    res.json({ message: "Lokasi kantor berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating office location:", error);
    res.status(500).json({ error: "Gagal memperbarui lokasi kantor" });
  }
};

module.exports = {
  getOfficeLocation,
  updateOfficeLocation,
};