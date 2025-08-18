import mongoose, { Schema, Document } from "mongoose";

export interface ISEOReport extends Document {
  articleId: mongoose.Types.ObjectId;
  readabilityScore: number;
  keywordDensity: Record<string, number>;
  metaDescription: string;
  suggestions: string[];
  createdAt: Date;
}

const SEOReportSchema: Schema = new Schema<ISEOReport>(
  {
    articleId: { type: Schema.Types.ObjectId, ref: "Article", required: true },
    readabilityScore: { type: Number, required: true },
    keywordDensity: { type: Map, of: Number },
    metaDescription: { type: String },
    suggestions: { type: [String], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<ISEOReport>("SEOReport", SEOReportSchema);
