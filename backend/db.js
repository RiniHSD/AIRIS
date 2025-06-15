import pkg from 'pg'
import { DATABASE_URL } from './config.js'

const { Pool } = pkg
export const pool = new Pool({ connectionString: DATABASE_URL })

// Test koneksi saat server dijalankan
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Gagal konek ke Database:', err.message)
  } else {
    console.log('✅ Koneksi Database berhasil:', res.rows[0].now)
  }
})