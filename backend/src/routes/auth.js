import express from 'express'
import { registerUser, loginUser, getUser } from '../controllers/authController.js'
import { 
    submitData, 
    getBangunanIrigasi, 
    getBangunanById, 
    getBangunanByNamaIrigasi, 
    updateBangunan,
    deleteBangunan
 } from '../controllers/controller.js'
import { upload, uploadHandler } from '../controllers/uploadfoto.js'
import multer from 'multer';

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/user/:userId', getUser);
router.post('/submit', submitData);
router.get('/bangunan', getBangunanIrigasi);
router.get('/bangunan/:id', getBangunanById);
router.post('/upload', upload.single('photo'), uploadHandler);
router.get('/bangunan/filter', getBangunanByNamaIrigasi);
router.put('/bangunan/:id', updateBangunan);
router.delete('/bangunan/:id', deleteBangunan);


export default router