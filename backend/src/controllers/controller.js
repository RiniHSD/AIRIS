import { pool } from '../../db.js'

// Submit data
export async function submitData(req, res) {
  const {
    nama, jenis, tanggal, fungsi, bahan, lokasi,
    kondisi, luasoncoran, luaskolam, jeniskebutuhan,
    keterangantambahan, koordinat, foto, id_user,
    luassawah, luaskebun, saluranBagi // <--- tambahkan ini
  } = req.body;

  try {
    // Ambil id_saluran berdasarkan nama saluran
    const saluranRes = await pool.query(
      `SELECT id FROM saluran_irigasi WHERE nama_saluran = $1`,
      [lokasi]
    );

    if (saluranRes.rows.length === 0) {
      return res.status(400).json({ error: 'Saluran tidak ditemukan di database' });
    }

    const id_saluran = saluranRes.rows[0].id;

    // Simpan data bangunan_irigasi dan dapatkan id-nya
    const insertRes = await pool.query(`
      INSERT INTO bangunan_irigasi (
        nama, jenis, tanggal, fungsi, bahan, lokasi, kondisi,
        luasoncoran, luaskolam, jeniskebutuhan, keterangantambahan,
        koordinat, foto, id_saluran, id_user, luassawah, luaskebun
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING id
    `, [
      nama, jenis, tanggal, fungsi, bahan, lokasi, kondisi,
      luasoncoran, luaskolam, jeniskebutuhan, keterangantambahan,
      koordinat, foto, id_saluran, id_user, luassawah, luaskebun
    ]);

    const id_bangunan = insertRes.rows[0].id;

    // Jika jenis adalah Bangunan Bagi, simpan saluranBagi ke tabel pembagian_air
    if (jenis === 'Bangunan Bagi' && Array.isArray(saluranBagi)) {
      for (const saluran of saluranBagi) {
        await pool.query(`
          INSERT INTO pembagian_air (
            id_bangunan, nama_saluran, luasoncoran, luassawah, luaskolam, luaskebun
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          id_bangunan,
          saluran.namaSaluran,
          parseFloat(saluran.luasoncoran || 0),
          parseFloat(saluran.luassawah || 0),
          parseFloat(saluran.luaskolam || 0),
          parseFloat(saluran.luaskebun || 0)
        ]);
      }
    }

    res.status(201).json({ message: 'Data bangunan irigasi berhasil disimpan' });

  } catch (err) {
    console.error('Error insert bangunan_irigasi:', err.message);
    res.status(500).json({ error: 'Gagal menyimpan data bangunan irigasi. ' + err.message });
  }
}


// ambil data titik bangunan irigasi
export async function getBangunanIrigasi(req, res) {
  try {
    const result = await pool.query(`
      SELECT *
      FROM bangunan_irigasi
    `);

    const features = result.rows.map((row) => {
      const [lat, lng] = row.koordinat.split(',').map(Number); // dari "lat, lng"
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lng, lat] // harus [lng, lat] untuk GeoJSON
        },
        properties: {
          id: row.id,
          name: row.nama,
          jenis: row.jenis,
          tanggal: row.tanggal,
          fungsi: row.fungsi,
          bahan: row.bahan,
          lokasi: row.lokasi,
          kondisi: row.kondisi,
          luasoncoran: row.luasoncoran,
          luaskolam: row.luaskolam,
          luassawah: row.luassawah,
          luaskebun: row.luaskebun,
          jeniskebutuhan: row.jeniskebutuhan,
          keterangantambahan: row.keterangantambahan,
          koordinat: row.koordinat,
          foto: row.foto
        }
      };
    });

    res.json({
      type: 'FeatureCollection',
      features
    });
  } catch (err) {
    console.error('Error get bangunan:', err.message);
    res.status(500).json({ error: 'Gagal mengambil data bangunan' });
  }
}


// ambil data berdasarkan id
export async function getBangunanById(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(`SELECT * FROM bangunan_irigasi WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan' });
    }

    const row = result.rows[0];
    const [lat, lng] = row.koordinat.split(',').map(Number);

    res.json({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      properties: {
        id: row.id,
        name: row.nama,
        foto: row.foto
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data: ' + err.message });
  }
}

export const getBangunanByNamaIrigasi = async (req, res) => {
  const { nama_irigasi } = req.query;
  if (!nama_irigasi) return res.status(400).json({ error: 'nama_irigasi is required' });

  try {
    const result = await pool.query(`
      SELECT b.*
      FROM bangunan_irigasi b
      JOIN users u ON b.id_user = u.id
      WHERE u.nama_irigasi = $1
    `, [nama_irigasi]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error get bangunan by nama_irigasi:', err.message);
    res.status(500).json({ error: 'Gagal mengambil data bangunan: ' + err.message });
  }
};

export async function updateBangunan(req, res) {
  const { id } = req.params;
  const {
    nama, jenis, fungsi, bahan, lokasi,
    kondisi, luasoncoran, luaskolam, jeniskebutuhan,
    keterangantambahan, foto, luassawah, luaskebun
  } = req.body;

  console.log('🔧 EDIT BANGUNAN - Data diterima:', {
    id,
    nama, jenis, fungsi, bahan, lokasi,
    kondisi, luasoncoran, luaskolam, jeniskebutuhan,
    keterangantambahan, foto, luassawah, luaskebun
  });

  try {
    const result = await pool.query(`
      UPDATE bangunan_irigasi
      SET
        nama = $1,
        jenis = $2,
        fungsi = $3,
        bahan = $4,
        lokasi = $5,
        kondisi = $6,
        luasoncoran = $7,
        luaskolam = $8,
        jeniskebutuhan = $9,
        keterangantambahan = $10,
        foto = $11,
        luassawah = $12,
        luaskebun = $13
      WHERE id = $14
    `, [
      nama, jenis, fungsi, bahan, lokasi, kondisi,
      luasoncoran, luaskolam, jeniskebutuhan,
      keterangantambahan, foto, luassawah, luaskebun,
      id
    ]);

    res.json({ message: 'Data bangunan berhasil diperbarui' });
  } catch (err) {
    console.error('Error update bangunan:', err.message);
    res.status(500).json({ error: 'Gagal memperbarui data bangunan: ' + err.message });
  }
}

export async function deleteBangunan(req, res) {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM bangunan_irigasi WHERE id = $1', [id]);
    res.json({ message: 'Data bangunan berhasil dihapus' });
  } catch (err) {
    console.error('❌ Gagal hapus bangunan:', err.message);
    res.status(500).json({ error: 'Gagal menghapus bangunan' });
  }
}

