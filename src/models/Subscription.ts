import mongoose, { Schema, Document } from "mongoose";

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  plan: "free" | "pro" | "enterprise";
  status: "active" | "canceled" | "expired";
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema: Schema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },
    status: {
      type: String,
      enum: ["active", "canceled", "expired"],
      default: "active",
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<ISubscription>(
  "Subscription",
  SubscriptionSchema
);
