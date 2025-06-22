import { combineReducers } from '@reduxjs/toolkit';
import streamReducer from './streamSlice';

const rootReducer = combineReducers({
  streamData: streamReducer,
});

export default rootReducer;
