import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuizTimer } from '@/components/quiz/QuizTimer';
import { ProgressBar } from '@/components/quiz/ProgressBar';
import { AnswerInput } from '@/components/quiz/AnswerInput';
import { useQuiz } from '@/hooks/useQuiz';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function QuizTake() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/quizzes/:id/take');
  const quizId = params?.id ? parseInt(params.id) : undefined;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const { getQuiz, startAttempt, submitAnswer, submitAttempt } = useQuiz();

  const { data: quiz, isLoading } = quizId ? getQuiz({ id: quizId }) : { data: null, isLoading: false };

  // Load saved answers from localStorage
  useEffect(() => {
    if (quizId && attemptId) {
      const savedAnswers = localStorage.getItem(`quiz-${quizId}-attempt-${attemptId}`);
      if (savedAnswers) {
        setAnswers(JSON.parse(savedAnswers));
      }
    }
  }, [quizId, attemptId]);

  // Auto-save answers to localStorage
  useEffect(() => {
    if (quizId && attemptId && Object.keys(answers).length > 0) {
      localStorage.setItem(`quiz-${quizId}-attempt-${attemptId}`, JSON.stringify(answers));
    }
  }, [answers, quizId, attemptId]);

  // Start attempt when quiz loads
  useEffect(() => {
    if (quiz && !attemptId) {
      handleStartAttempt();
    }
  }, [quiz]);

  const handleStartAttempt = async () => {
    if (!quizId) return;

    try {
      const result = await startAttempt.mutateAsync({ quizId });
      setAttemptId(result.attempt.id);
      toast.success('Quiz started! Good luck!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to start quiz');
      setLocation('/quizzes');
    }
  };

  const handleAnswerChange = async (questionId: number, value: any) => {
    setAnswers({ ...answers, [questionId]: value });

    // Submit answer to server
    if (attemptId) {
      try {
        await submitAnswer.mutateAsync({
          attemptId,
          questionId,
          answer: value,
        });
      } catch (error) {
        console.error('Failed to save answer:', error);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (quiz?.questions && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = async () => {
    if (!attemptId) return;

    setIsSubmitting(true);
    try {
      const result = await submitAttempt.mutateAsync({ attemptId });

      // Clear localStorage
      if (quizId) {
        localStorage.removeItem(`quiz-${quizId}-attempt-${attemptId}`);
      }

      toast.success('Quiz submitted successfully!');
      setLocation(`/quizzes/${quizId}/results/${attemptId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  const handleTimeExpire = () => {
    toast.warning('Time expired! Submitting quiz...');
    handleSubmit();
  };

  if (isLoading || !quiz) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  if (!currentQuestion) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">No questions found in this quiz</p>
        <Button onClick={() => setLocation('/quizzes')} className="mt-4">
          Back to Quizzes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setLocation('/quizzes')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <p className="text-muted-foreground">{quiz.description}</p>
        </div>
      </div>

      {quiz.timeLimit && (
        <QuizTimer timeLimit={quiz.timeLimit} onExpire={handleTimeExpire} />
      )}

      <ProgressBar current={currentQuestionIndex + 1} total={questions.length} />

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">
                Question {currentQuestionIndex + 1} of {questions.length}
              </CardTitle>
              <CardDescription className="mt-1">
                {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <p className="text-base font-medium leading-relaxed whitespace-pre-wrap">
              {currentQuestion.questionText}
            </p>
          </div>

          <AnswerInput
            question={currentQuestion}
            value={answers[currentQuestion.id]}
            onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          {answeredCount} of {questions.length} answered
        </div>

        {!isLastQuestion ? (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        ) : (
          <Button onClick={() => setShowSubmitDialog(true)}>
            <CheckCircle className="w-4 h-4 mr-1.5" />
            Submit Quiz
          </Button>
        )}
      </div>

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answeredCount} of {questions.length} questions.
              {answeredCount < questions.length && (
                <span className="block mt-2 text-destructive font-medium">
                  Warning: {questions.length - answeredCount} unanswered questions will be marked as incorrect.
                </span>
              )}
              <span className="block mt-2">
                Are you sure you want to submit?
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              Submit Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
