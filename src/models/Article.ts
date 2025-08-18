import mongoose, { Schema, Document } from "mongoose";

export interface IArticle extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  keywords: string[];
  status: "draft" | "published";
  seoScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema: Schema = new Schema<IArticle>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    keywords: { type: [String], default: [] },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    seoScore: { type: Number, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IArticle>("Article", ArticleSchema);
