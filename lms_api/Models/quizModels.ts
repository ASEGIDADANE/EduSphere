import mongoose, { Schema, Document } from 'mongoose';

interface IQuizQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
}

interface IQuiz extends Document {
  lesson: mongoose.Types.ObjectId;
  questions: IQuizQuestion[];
  timeLimit?: number; // in minutes
  attemptsAllowed?: number;
}

const quizSchema: Schema = new mongoose.Schema({
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true,
  },
  questions: [
    {
      questionText: { type: String, required: true },
      options: [{ type: String, required: true }],
      correctAnswer: { type: String, required: true },
    },
  ],
  timeLimit: {
    type: Number,
  },
  attemptsAllowed: {
    type: Number,
    default: 1,
  },
}, { timestamps: true });

const QuizModel = mongoose.model<IQuiz>('Quiz', quizSchema);

export default QuizModel;
export type { IQuiz };
