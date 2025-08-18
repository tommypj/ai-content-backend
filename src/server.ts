// src/server.ts
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from './app.js';

import './startup/env.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const MONGO_URI = process.env.MONGO_URI!;

(async () => {
  await mongoose.connect(MONGO_URI);
  app.listen(PORT, () => console.log(`API running on :${PORT}`));
})();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Listening on ${PORT}`);
});