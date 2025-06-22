import { pool } from '../../db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';

// Register user
export async function registerUser(req, res) {
  const { name, email, telp, password, namaIrigasi } = req.body

  // Cek input
  if (!name || !email || !telp || !password || !namaIrigasi) {
    return res.status(400).json({ error: 'Semua field wajib diisi' })
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    console.log('DATA AKHIR:', name, email, telp, hash, namaIrigasi)
    ;
  
    await pool.query(
      `INSERT INTO users (name, email, telp, password, nama_irigasi)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, telp, nama_irigasi`,
      [name, email, telp, hash, namaIrigasi]
    )
    
  
    res.status(201).json({ message: 'Registrasi berhasil' });
  } catch (err) {
    console.error('Register Error:', err.message);
    res.status(500).json({ error: 'Gagal mendaftar. ' + err.message });
  }
  
}

// Login user
export async function loginUser(req, res) {
  const { email, password } = req.body

  // Cek input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi' })
  }

  try {
    // Cari user berdasarkan email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    console.log('Password input:', password);
    console.log('Password from DB:', user.password);

    // Cocokkan password dengan hash di database
    const match = await bcrypt.compare(password, user.password)

    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      telp: user.telp,
      namaIrigasi: user.nama_irigasi,
    };

    const token = jwt.sign(payload, 'secret', { expiresIn: '1d' }); // 'secret' nanti diganti pakai .env

    res.json({ token,user: {
      id: user.id,
      name: user.name,
      email: user.email,
      // fields lain kalau perlu
    }});
    // Kirim data user (tanpa password)
    // res.json({ id: user.id, name: user.name, email: user.email })
  } catch (err) {
    console.error('Login Error:', err.message)
    res.status(500).json({ error: 'Gagal login. ' + err.message })
  }
}

// Get user
export async function getUser(req, res) {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Get User Error:', err.message);
    res.status(500).json({ error: 'Gagal mengambil data pengguna. ' + err.message });
  }
}

// Submit data
// export async function submitData(req, res) {
//   const {
//     nama, jenis, tanggal, fungsi, bahan, lokasi,
//     kondisi, luasoncoran, luaskolam, jeniskebutuhan,
//     keterangantambahan, koordinat, foto, id_user,
//     luassawah, luaskebun, saluranBagi // <--- tambahkan ini
//   } = req.body;

//   try {
//     // Ambil id_saluran berdasarkan nama saluran
//     const saluranRes = await pool.query(
//       `SELECT id FROM saluran_irigasi WHERE nama_saluran = $1`,
//       [lokasi]
//     );

//     if (saluranRes.rows.length === 0) {
//       return res.status(400).json({ error: 'Saluran tidak ditemukan di database' });
//     }

//     const id_saluran = saluranRes.rows[0].id;

//     // Simpan data bangunan_irigasi dan dapatkan id-nya
//     const insertRes = await pool.query(`
//       INSERT INTO bangunan_irigasi (
//         nama, jenis, tanggal, fungsi, bahan, lokasi, kondisi,
//         luasoncoran, luaskolam, jeniskebutuhan, keterangantambahan,
//         koordinat, foto, id_saluran, id_user, luassawah, luaskebun
//       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
//       RETURNING id
//     `, [
//       nama, jenis, tanggal, fungsi, bahan, lokasi, kondisi,
//       luasoncoran, luaskolam, jeniskebutuhan, keterangantambahan,
//       koordinat, foto, id_saluran, id_user, luassawah, luaskebun
//     ]);

//     const id_bangunan = insertRes.rows[0].id;

//     // Jika jenis adalah Bangunan Bagi, simpan saluranBagi ke tabel pembagian_air
//     if (jenis === 'Bangunan Bagi' && Array.isArray(saluranBagi)) {
//       for (const saluran of saluranBagi) {
//         await pool.query(`
//           INSERT INTO pembagian_air (
//             id_bangunan, nama_saluran, luasoncoran, luassawah, luaskolam, luaskebun
//           ) VALUES ($1, $2, $3, $4, $5, $6)
//         `, [
//           id_bangunan,
//           saluran.namaSaluran,
//           parseFloat(saluran.luasoncoran || 0),
//           parseFloat(saluran.luassawah || 0),
//           parseFloat(saluran.luaskolam || 0),
//           parseFloat(saluran.luaskebun || 0)
//         ]);
//       }
//     }

//     res.status(201).json({ message: 'Data bangunan irigasi berhasil disimpan' });

//   } catch (err) {
//     console.error('Error insert bangunan_irigasi:', err.message);
//     res.status(500).json({ error: 'Gagal menyimpan data bangunan irigasi. ' + err.message });
//   }
// }