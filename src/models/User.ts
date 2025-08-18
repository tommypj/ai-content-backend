// src/models/User.ts
import mongoose, { Schema } from 'mongoose';
import type { InferSchemaType, HydratedDocument, Model } from 'mongoose';

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    plan: { type: String, enum: ['free', 'pro'], default: 'free' }
  },
  { timestamps: true }
);

// optional instance method
userSchema.methods.comparePassword = async function (plain: string) {
  const bcrypt = await import('bcryptjs').then(m => m.default);
  return bcrypt.compare(plain, this.passwordHash);
};

export type User = InferSchemaType<typeof userSchema> & {
  comparePassword: (plain: string) => Promise<boolean>;
};
export type UserDoc = HydratedDocument<User>;

// ✅ IMPORTANT: give the model a concrete, non-union type
export const UserModel: Model<User> =
  (mongoose.models.User as Model<User> | undefined) ??
  mongoose.model<User>('User', userSchema);
