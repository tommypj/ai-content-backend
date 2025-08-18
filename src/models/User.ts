import mongoose, { Schema, type InferSchemaType, type HydratedDocument } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema({
  email: { type: String, required: true, index: true, unique: true },
  passwordHash: { type: String, required: true },
  plan: { type: String, enum: ['free', 'pro'], default: 'free' },
  createdAt: { type: Date, default: () => new Date() }
});

// Instance method
userSchema.methods.comparePassword = async function (plain: string) {
  return bcrypt.compare(plain, this.passwordHash);
};

// ----- Types -----
export type User = InferSchemaType<typeof userSchema> & {
  comparePassword: (plain: string) => Promise<boolean>;
};
export type UserDoc = HydratedDocument<User>;

export const UserModel = mongoose.model<User>('User', userSchema);
