import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token tidak ditemukan' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'secret'); // Ganti 'secret' sesuai .env jika perlu
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token tidak valid' });
  }
}
