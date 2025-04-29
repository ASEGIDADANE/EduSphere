
import { Request, Response } from 'express';
import QuizModel from '../Models/quizModels';
import LessonModel from '../Models/lessonModel';
import StudentQuizSubmissionModel from '../Models/quizSubmissiomModels' // Assuming you have a Lesson model imported
import mongoose from 'mongoose';

export const createQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    // Expect lessonId (string) and questions array in the request body
    const { lessonId, questions, timeLimit, attemptsAllowed } = req.body;

    // --- Input Validation ---

    // 1. Validate lessonId
    if (!lessonId || !mongoose.Types.ObjectId.isValid(lessonId)) {
      res.status(400).json({ message: 'Valid Lesson ID (lessonId) is required.' });
      return;
    }

    // 2. Validate questions array
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ message: 'Questions array cannot be empty.' });
      return;
    }

    // 3. Validate individual questions (basic structure check)
    for (const q of questions) {
      if (!q.questionText || !q.options || !Array.isArray(q.options) || q.options.length < 2 || !q.correctAnswer) {
        res.status(400).json({ message: 'Each question must have questionText, at least two options (array), and correctAnswer.' });
        return;
      }
      // Ensure correctAnswer is one of the options
      if (!q.options.includes(q.correctAnswer)) {
        res.status(400).json({ message: `Correct answer "${q.correctAnswer}" for question "${q.questionText}" must be one of the provided options.` });
        return;
      }
    }

    // --- Check if Lesson Exists ---
    const lessonExists = await LessonModel.findById(lessonId);
    if (!lessonExists) {
      res.status(404).json({ message: 'Lesson not found.' });
      return;
    }

    // --- Create New Quiz ---
    // Use the validated lessonId for the 'lesson' field
    const newQuiz = new QuizModel({
      lesson: lessonId, 
      questions,
      timeLimit, 
      attemptsAllowed, 
    });

    // Save the quiz to the database
    await newQuiz.save();

    res.status(201).json({ message: 'Quiz created successfully.', quiz: newQuiz });
    return;

  } catch (error) {
    console.error('Error creating quiz:', error);
    // Handle potential validation errors from Mongoose if needed
    if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).json({ message: 'Validation failed.', errors: error.errors });
        return;
    }
    res.status(500).json({ message: 'Internal server error.' });
    return;
  }
}


export const summitQuiz = async (req: Request, res: Response):Promise<void> => {
  try {
    // Expect quizId (string) and answers array in the request body
    const { quizId, answers } = req.body;

    // --- Input Validation ---

    // 1. Validate quizId
    if (!quizId || !mongoose.Types.ObjectId.isValid(quizId)) {
      res.status(400).json({ message: 'Valid Quiz ID (quizId) is required.' });
      return;
    }

    // 2. Validate answers array
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      res.status(400).json({ message: 'Answers array cannot be empty.' });
      return;
    }

    // 3. Validate individual answers (basic structure check)
    for (const ans of answers) {
      if (!ans.questionId || !ans.selectedAnswer) {
        res.status(400).json({ message: 'Each answer must have questionId and selectedAnswer.' });
        return;
      }
    }

    // --- Check if Quiz Exists ---
    const quizExists = await QuizModel.findById(quizId);
    if (!quizExists) {
      res.status(404).json({ message: 'Quiz not found.' });
      return;
    }

    const questionMap = new Map();
    quizExists.questions.forEach(q => {
      // Use the string representation of the question's _id as the key
      questionMap.set(q.questionText.toString(), q);
    });

    // --- Calculate Score ---
    let score = 0;
    for (const ans of answers) {
      // Find the corresponding question from the map
      const question = questionMap.get(ans.questionId); // ans.questionId should be the string representation of the question's _id

      // Check if the question exists in the quiz and if the answer is correct
      if (question && question.correctAnswer === ans.selectedAnswer) {
        score++;
      }
    }

    // --- Save Submission ---
    // Assuming you have a StudentQuizSubmission model to save the submission
    const submission = new StudentQuizSubmissionModel({
      student: req.user?._id ?? 'unknown', 
      quiz: quizId,
      answers,
      score,
      submittedAt: new Date(),
    });

    await submission.save();

    res.status(201).json({ message: 'Quiz submitted successfully.', score });
    return;

  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Internal server error.' });
    return;
  }
}