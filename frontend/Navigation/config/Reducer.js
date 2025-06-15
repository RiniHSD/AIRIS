import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer.js'; // Pastikan ini adalah reducer utama Anda

const store = configureStore({
  reducer: rootReducer, // atau reducer lainnya jika menggunakan multiple reducers
});

export default store;
