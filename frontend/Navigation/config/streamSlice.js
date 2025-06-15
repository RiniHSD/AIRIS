import { createSlice } from '@reduxjs/toolkit';

export const streamSlice = createSlice({
  // Kode asli disembunyikan karena bersifat proprietary. Hubungi developer untuk informasi lebih lanjut.
});

export const { setStreamData, clearStreamData, clearAllStreams } = streamSlice.actions;

// Selector untuk memudahkan akses data
export const selectStreamData = (state, streamId) => state.streamData.streams[streamId];
export const selectLastUpdated = (state, streamId) => state.streamData.lastUpdated[streamId];

export default streamSlice.reducer;