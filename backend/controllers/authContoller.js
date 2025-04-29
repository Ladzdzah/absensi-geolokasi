const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Cari user berdasarkan username
    const [users] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (users.length === 0) {
      return res.status(401).json({ error: "Username tidak terdaftar" });
    }

    const user = users[0];

    // Verifikasi password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Password salah" });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Hapus password dari response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: "Login berhasil",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ error: "Gagal melakukan login" });
  }
};

const register = async (req, res) => {
  try {
    const { username, password, full_name, role } = req.body;

    // Validasi input
    if (!username || !password || !full_name) {
      return res.status(400).json({ error: "Semua field wajib diisi" });
    }

    // Cek apakah username sudah terdaftar
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username] // Menggunakan username, bukan email
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Username sudah terdaftar" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru ke database
    const [result] = await db.query(
      "INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)",
      [username, hashedPassword, full_name, role || "user"]
    );

    // Ambil data user yang baru dibuat
    const [newUser] = await db.query(
      "SELECT id, username, full_name, role FROM users WHERE id = ?",
      [result.insertId]
    );

    // Generate token
    const token = jwt.sign(
      {
        id: newUser[0].id,
        username: newUser[0].username,
        full_name: newUser[0].full_name,
        role: newUser[0].role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "User berhasil didaftarkan",
      token,
      user: newUser[0],
    });
  } catch (error) {
    console.error("Error in register:", error);
    res.status(500).json({ error: "Gagal mendaftarkan user" });
  }
};

module.exports = {
  loginUser,
  register,
};
