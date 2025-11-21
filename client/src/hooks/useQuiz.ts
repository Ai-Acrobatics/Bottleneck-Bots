import { trpc } from '@/lib/trpc';

/**
 * Comprehensive hook wrapping all quiz tRPC endpoints
 * Provides easy access to all quiz operations
 */
export function useQuiz() {
  const utils = trpc.useUtils();

  // Queries
  const listQuizzes = trpc.quiz.listQuizzes.useQuery;
  const getQuiz = trpc.quiz.getQuiz.useQuery;
  const getUserAttempts = trpc.quiz.getUserAttempts.useQuery;

  // Mutations
  const createQuiz = trpc.quiz.createQuiz.useMutation({
    onSuccess: () => {
      utils.quiz.listQuizzes.invalidate();
    },
  });

  const updateQuiz = trpc.quiz.updateQuiz.useMutation({
    onSuccess: (data) => {
      utils.quiz.listQuizzes.invalidate();
      utils.quiz.getQuiz.invalidate({ id: data.quiz.id });
    },
  });

  const deleteQuiz = trpc.quiz.deleteQuiz.useMutation({
    onSuccess: () => {
      utils.quiz.listQuizzes.invalidate();
    },
  });

  const addQuestion = trpc.quiz.addQuestion.useMutation({
    onSuccess: (data) => {
      utils.quiz.getQuiz.invalidate({ id: data.question.quizId });
    },
  });

  const updateQuestion = trpc.quiz.updateQuestion.useMutation({
    onSuccess: () => {
      // Invalidate the quiz to refresh questions
      utils.quiz.invalidate();
    },
  });

  const deleteQuestion = trpc.quiz.deleteQuestion.useMutation({
    onSuccess: () => {
      utils.quiz.invalidate();
    },
  });

  const startAttempt = trpc.quiz.startAttempt.useMutation();

  const submitAnswer = trpc.quiz.submitAnswer.useMutation();

  const submitAttempt = trpc.quiz.submitAttempt.useMutation({
    onSuccess: () => {
      utils.quiz.getUserAttempts.invalidate();
    },
  });

  return {
    // Queries
    listQuizzes,
    getQuiz,
    getUserAttempts,

    // Mutations
    createQuiz,
    updateQuiz,
    deleteQuiz,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    startAttempt,
    submitAnswer,
    submitAttempt,
  };
}
