import mongoose, { Schema, Document } from "mongoose";

interface ILesson extends Document {
  title: string;
  content: string;
  videoUrl?: string;
  resources?: string[];
  course: Schema.Types.ObjectId;
}

const lessonSchema = new Schema<ILesson>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    videoUrl: String,
    resources: [String],
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ILesson>("Lesson", lessonSchema);
