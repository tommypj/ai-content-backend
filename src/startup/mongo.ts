// src/startup/mongo.ts
import mongoose from 'mongoose';

export async function connectMongo(uri: string) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    // add options if you need, defaults are fine for mongoose@8
  });
  console.log('[mongo] connected');
}
