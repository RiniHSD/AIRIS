import express from 'express'
import cors from 'cors'
import authRoutes from '../src/routes/auth.js'
import { PORT } from '../config.js'
import path from 'path';

const app = express()

app.use(cors())
app.use(express.json())

app.use('/uploads', express.static('uploads'));

app.use('/auth', authRoutes)


app.get('/', (req, res) => {
    res.send('Welcome to the Airis Apps');
  });  

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

export default app