// upload.js (Vercel-compatible)
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Gunakan memoryStorage agar tidak pakai filesystem lokal
const storage = multer.memoryStorage();
const upload = multer({ storage });

async function uploadHandler(req, res) {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const fileName = `${Date.now()}-${file.originalname}`;

  try {
    // Upload buffer langsung ke Supabase
    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const { data: publicUrlData } = supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME)
      .getPublicUrl(fileName);

    return res.json({
      message: 'File uploaded successfully',
      fileUrl: publicUrlData.publicUrl,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export { upload, uploadHandler };
