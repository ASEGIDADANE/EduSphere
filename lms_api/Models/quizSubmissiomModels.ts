import mongoose, { Schema, Document } from 'mongoose';

// Interface defining the structure for a single answer within a submission
interface IAnswer {
  questionId: mongoose.Types.ObjectId;
  selectedAnswer: string; 
}

// Interface defining the structure for a student's quiz submission document
interface IStudentQuizSubmission extends Document {
  student: mongoose.Types.ObjectId; 
  quiz: mongoose.Types.ObjectId; 
  answers: IAnswer[]; 
  score: number; 
  submittedAt: Date; 
}

// Mongoose schema definition for the StudentQuizSubmission collection
const studentQuizSubmissionSchema = new mongoose.Schema<IStudentQuizSubmission>({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User', 
    required: true, 
  },
  quiz: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz', 
    required: true, 
  },
  answers: [ 
    {
      questionId: {
        type: Schema.Types.ObjectId,
        required: true,
        // Note: This refers to the _id of a question *within* the 'questions' array
        // in the corresponding Quiz document. Mongoose doesn't automatically
        // create a 'ref' for subdocuments in this way, but storing the ID allows
        // you to manually look it up later if needed.
      },
      selectedAnswer: {
        type: String,
        required: true, // The student must provide an answer
      },
    }
  ],
  score: {
    type: Number,
    required: true, 
  },
  submittedAt: {
    type: Date,
    default: Date.now, 
  }
}, { timestamps: true }); 

// Create the Mongoose model
const StudentQuizSubmissionModel = mongoose.model<IStudentQuizSubmission>(
  'StudentQuizSubmission', 
  studentQuizSubmissionSchema 
);

// Export the model for use in other parts of the application
export default StudentQuizSubmissionModel;


export type { IStudentQuizSubmission };