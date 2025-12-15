import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../../_core/trpc";
import { getDb } from "../../db";
import { quizzes, quizQuestions, quizAttempts } from "../../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

/**
 * Quiz System Router
 * Comprehensive quiz management with automatic scoring and attempt tracking
 *
 * Features:
 * - Full CRUD operations for quizzes and questions
 * - Automated scoring for multiple choice and true/false questions
 * - Quiz attempt tracking with pass/fail determination
 * - Support for multiple question types
 * - User attempt history
 */

// ========================================
// VALIDATION SCHEMAS
// ========================================

const questionTypeEnum = z.enum([
  "multiple_choice",
  "true_false",
  "short_answer",
  "essay"
]);

const difficultyEnum = z.enum(["easy", "medium", "hard"]);

const createQuizSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  category: z.string().default("general"),
  difficulty: difficultyEnum.default("medium"),
  timeLimit: z.number().int().positive().optional(),
  passingScore: z.number().int().min(0).max(100).default(70),
  isPublished: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  attemptsAllowed: z.number().int().positive().optional(),
});

const updateQuizSchema = z.object({
  id: z.number().int(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  difficulty: difficultyEnum.optional(),
  timeLimit: z.number().int().positive().optional().nullable(),
  passingScore: z.number().int().min(0).max(100).optional(),
  isPublished: z.boolean().optional(),
  isActive: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  attemptsAllowed: z.number().int().positive().optional().nullable(),
});

const createQuestionSchema = z.object({
  quizId: z.number().int(),
  questionText: z.string().min(1),
  questionType: questionTypeEnum,
  options: z.array(z.string()).optional(), // For multiple choice
  correctAnswer: z.any(), // Can be string, array, or object depending on type
  points: z.number().int().positive().default(1),
  order: z.number().int().nonnegative(),
  explanation: z.string().optional(),
  hint: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

const updateQuestionSchema = z.object({
  id: z.number().int(),
  questionText: z.string().min(1).optional(),
  questionType: questionTypeEnum.optional(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.any().optional(),
  points: z.number().int().positive().optional(),
  order: z.number().int().nonnegative().optional(),
  explanation: z.string().optional(),
  hint: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

const submitAnswerSchema = z.object({
  attemptId: z.number().int(),
  questionId: z.number().int(),
  answer: z.any(), // Can be string, number, array, etc.
});

// ========================================
// QUIZ ROUTER
// ========================================

export const quizRouter = router({
  /**
   * Create a new quiz
   */
  createQuiz: protectedProcedure
    .input(createQuizSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // PLACEHOLDER: Get userId from auth context
        // Currently using ctx.user.id - ensure this is properly authenticated
        const userId = ctx.user?.id;

        if (!userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User must be authenticated to create quizzes",
          });
        }

        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const [quiz] = await db.insert(quizzes).values({
          ...input,
          userId,
          tags: input.tags ? JSON.stringify(input.tags) : null,
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
          publishedAt: input.isPublished ? new Date() : null,
        }).returning();

        return {
          success: true,
          quiz,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create quiz",
          cause: error,
        });
      }
    }),

  /**
   * List all quizzes with optional filtering
   */
  listQuizzes: publicProcedure
    .input(
      z.object({
        userId: z.number().int().optional(), // Filter by creator
        category: z.string().optional(),
        difficulty: difficultyEnum.optional(),
        isPublished: z.boolean().optional(),
        tags: z.array(z.string()).optional(),
        limit: z.number().int().positive().max(100).default(50),
        offset: z.number().int().nonnegative().default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const filters = [];

        if (input?.userId) {
          filters.push(eq(quizzes.userId, input.userId));
        }

        if (input?.category) {
          filters.push(eq(quizzes.category, input.category));
        }

        if (input?.difficulty) {
          filters.push(eq(quizzes.difficulty, input.difficulty));
        }

        if (input?.isPublished !== undefined) {
          filters.push(eq(quizzes.isPublished, input.isPublished));
        }

        const whereClause = filters.length > 0 ? and(...filters) : undefined;

        const results = await db
          .select()
          .from(quizzes)
          .where(whereClause)
          .orderBy(desc(quizzes.createdAt))
          .limit(input?.limit || 50)
          .offset(input?.offset || 0);

        // Count total for pagination
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)` })
          .from(quizzes)
          .where(whereClause);

        return {
          quizzes: results,
          total: Number(count),
          limit: input?.limit || 50,
          offset: input?.offset || 0,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch quizzes",
          cause: error,
        });
      }
    }),

  /**
   * Get a single quiz with all questions
   */
  getQuiz: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const [quiz] = await db
          .select()
          .from(quizzes)
          .where(eq(quizzes.id, input.id))
          .limit(1);

        if (!quiz) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Quiz not found",
          });
        }

        const questions = await db
          .select()
          .from(quizQuestions)
          .where(eq(quizQuestions.quizId, input.id))
          .orderBy(quizQuestions.order);

        return {
          ...quiz,
          questions,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch quiz",
          cause: error,
        });
      }
    }),

  /**
   * Update quiz metadata
   */
  updateQuiz: protectedProcedure
    .input(updateQuizSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // PLACEHOLDER: Verify user owns this quiz
        const userId = ctx.user?.id;

        if (!userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User must be authenticated",
          });
        }

        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const [existingQuiz] = await db
          .select()
          .from(quizzes)
          .where(eq(quizzes.id, input.id))
          .limit(1);

        if (!existingQuiz) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Quiz not found",
          });
        }

        // PLACEHOLDER: Check ownership
        if (existingQuiz.userId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to update this quiz",
          });
        }

        const { id, ...updateData } = input;

        // Handle published state
        const publishedAt = input.isPublished && !existingQuiz.isPublished
          ? new Date()
          : existingQuiz.publishedAt;

        const [updatedQuiz] = await db
          .update(quizzes)
          .set({
            ...updateData,
            tags: input.tags ? JSON.stringify(input.tags) : undefined,
            metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
            publishedAt,
            updatedAt: new Date(),
          })
          .where(eq(quizzes.id, id))
          .returning();

        return {
          success: true,
          quiz: updatedQuiz,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update quiz",
          cause: error,
        });
      }
    }),

  /**
   * Delete a quiz (and all associated questions and attempts)
   */
  deleteQuiz: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // PLACEHOLDER: Verify user owns this quiz
        const userId = ctx.user?.id;

        if (!userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User must be authenticated",
          });
        }

        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const [existingQuiz] = await db
          .select()
          .from(quizzes)
          .where(eq(quizzes.id, input.id))
          .limit(1);

        if (!existingQuiz) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Quiz not found",
          });
        }

        // PLACEHOLDER: Check ownership
        if (existingQuiz.userId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to delete this quiz",
          });
        }

        // Delete in order: attempts -> questions -> quiz (due to foreign keys)
        await db.delete(quizAttempts).where(eq(quizAttempts.quizId, input.id));
        await db.delete(quizQuestions).where(eq(quizQuestions.quizId, input.id));
        await db.delete(quizzes).where(eq(quizzes.id, input.id));

        return {
          success: true,
          message: "Quiz and all associated data deleted successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete quiz",
          cause: error,
        });
      }
    }),

  /**
   * Add a question to a quiz
   */
  addQuestion: protectedProcedure
    .input(createQuestionSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // PLACEHOLDER: Verify user owns the quiz
        const userId = ctx.user?.id;

        if (!userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User must be authenticated",
          });
        }

        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        // Verify quiz exists and user owns it
        const [quiz] = await db
          .select()
          .from(quizzes)
          .where(eq(quizzes.id, input.quizId))
          .limit(1);

        if (!quiz) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Quiz not found",
          });
        }

        // PLACEHOLDER: Check ownership
        if (quiz.userId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to add questions to this quiz",
          });
        }

        const [question] = await db.insert(quizQuestions).values({
          ...input,
          options: input.options ? JSON.stringify(input.options) : null,
          correctAnswer: JSON.stringify(input.correctAnswer),
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        }).returning();

        return {
          success: true,
          question,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add question",
          cause: error,
        });
      }
    }),

  /**
   * Update a question
   */
  updateQuestion: protectedProcedure
    .input(updateQuestionSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // PLACEHOLDER: Verify user owns the quiz this question belongs to
        const userId = ctx.user?.id;

        if (!userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User must be authenticated",
          });
        }

        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const [existingQuestion] = await db
          .select({
            question: quizQuestions,
            quiz: quizzes,
          })
          .from(quizQuestions)
          .innerJoin(quizzes, eq(quizQuestions.quizId, quizzes.id))
          .where(eq(quizQuestions.id, input.id))
          .limit(1);

        if (!existingQuestion) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Question not found",
          });
        }

        // PLACEHOLDER: Check ownership
        if (existingQuestion.quiz.userId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to update this question",
          });
        }

        const { id, ...updateData } = input;

        const [updatedQuestion] = await db
          .update(quizQuestions)
          .set({
            ...updateData,
            options: input.options ? JSON.stringify(input.options) : undefined,
            correctAnswer: input.correctAnswer ? JSON.stringify(input.correctAnswer) : undefined,
            metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
            updatedAt: new Date(),
          })
          .where(eq(quizQuestions.id, id))
          .returning();

        return {
          success: true,
          question: updatedQuestion,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update question",
          cause: error,
        });
      }
    }),

  /**
   * Delete a question
   */
  deleteQuestion: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // PLACEHOLDER: Verify user owns the quiz this question belongs to
        const userId = ctx.user?.id;

        if (!userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User must be authenticated",
          });
        }

        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const [existingQuestion] = await db
          .select({
            question: quizQuestions,
            quiz: quizzes,
          })
          .from(quizQuestions)
          .innerJoin(quizzes, eq(quizQuestions.quizId, quizzes.id))
          .where(eq(quizQuestions.id, input.id))
          .limit(1);

        if (!existingQuestion) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Question not found",
          });
        }

        // PLACEHOLDER: Check ownership
        if (existingQuestion.quiz.userId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to delete this question",
          });
        }

        await db.delete(quizQuestions).where(eq(quizQuestions.id, input.id));

        return {
          success: true,
          message: "Question deleted successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete question",
          cause: error,
        });
      }
    }),

  /**
   * Start a new quiz attempt
   */
  startAttempt: protectedProcedure
    .input(z.object({ quizId: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // PLACEHOLDER: Get userId from auth context
        const userId = ctx.user?.id;

        if (!userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User must be authenticated to start quiz",
          });
        }

        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        // Verify quiz exists and is published
        const [quiz] = await db
          .select()
          .from(quizzes)
          .where(eq(quizzes.id, input.quizId))
          .limit(1);

        if (!quiz) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Quiz not found",
          });
        }

        if (!quiz.isPublished || !quiz.isActive) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Quiz is not available for attempts",
          });
        }

        // Check attempt limit
        const existingAttempts = await db
          .select()
          .from(quizAttempts)
          .where(
            and(
              eq(quizAttempts.quizId, input.quizId),
              eq(quizAttempts.userId, userId)
            )
          );

        const attemptNumber = existingAttempts.length + 1;

        if (quiz.attemptsAllowed && attemptNumber > quiz.attemptsAllowed) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Maximum attempts (${quiz.attemptsAllowed}) reached for this quiz`,
          });
        }

        // Create new attempt
        const [attempt] = await db.insert(quizAttempts).values({
          quizId: input.quizId,
          userId,
          status: "in_progress",
          answers: JSON.stringify([]),
          attemptNumber,
          startedAt: new Date(),
        }).returning();

        return {
          success: true,
          attempt,
          attemptNumber,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to start quiz attempt",
          cause: error,
        });
      }
    }),

  /**
   * Submit an answer for a question (can be called multiple times during attempt)
   */
  submitAnswer: protectedProcedure
    .input(submitAnswerSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // PLACEHOLDER: Get userId from auth context
        const userId = ctx.user?.id;

        if (!userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User must be authenticated",
          });
        }

        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        // Verify attempt exists and belongs to user
        const [attempt] = await db
          .select()
          .from(quizAttempts)
          .where(eq(quizAttempts.id, input.attemptId))
          .limit(1);

        if (!attempt) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Quiz attempt not found",
          });
        }

        // PLACEHOLDER: Verify attempt belongs to user
        if (attempt.userId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "This attempt doesn't belong to you",
          });
        }

        if (attempt.status !== "in_progress") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot submit answers to a completed attempt",
          });
        }

        // Parse existing answers
        const answers = typeof attempt.answers === 'string'
          ? JSON.parse(attempt.answers)
          : attempt.answers || [];

        // Update or add answer
        const answerIndex = answers.findIndex(
          (a: any) => a.questionId === input.questionId
        );

        const newAnswer = {
          questionId: input.questionId,
          answer: input.answer,
          answeredAt: new Date().toISOString(),
        };

        if (answerIndex >= 0) {
          answers[answerIndex] = newAnswer;
        } else {
          answers.push(newAnswer);
        }

        // Update attempt
        await db
          .update(quizAttempts)
          .set({
            answers: JSON.stringify(answers),
            updatedAt: new Date(),
          })
          .where(eq(quizAttempts.id, input.attemptId));

        return {
          success: true,
          message: "Answer saved successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit answer",
          cause: error,
        });
      }
    }),

  /**
   * Submit quiz attempt for grading with automatic scoring
   */
  submitAttempt: protectedProcedure
    .input(z.object({ attemptId: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // PLACEHOLDER: Get userId from auth context
        const userId = ctx.user?.id;

        if (!userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User must be authenticated",
          });
        }

        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        // Get attempt with quiz data
        const [attemptData] = await db
          .select({
            attempt: quizAttempts,
            quiz: quizzes,
          })
          .from(quizAttempts)
          .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
          .where(eq(quizAttempts.id, input.attemptId))
          .limit(1);

        if (!attemptData) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Quiz attempt not found",
          });
        }

        const { attempt, quiz } = attemptData;

        // PLACEHOLDER: Verify attempt belongs to user
        if (attempt.userId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "This attempt doesn't belong to you",
          });
        }

        if (attempt.status !== "in_progress") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Attempt is already submitted",
          });
        }

        // Get all questions for this quiz
        const questions = await db
          .select()
          .from(quizQuestions)
          .where(eq(quizQuestions.quizId, quiz.id));

        // Parse user answers
        const userAnswers = typeof attempt.answers === 'string'
          ? JSON.parse(attempt.answers)
          : attempt.answers || [];

        // AUTOMATIC SCORING LOGIC
        let totalScore = 0;
        let totalPoints = 0;

        for (const question of questions) {
          totalPoints += question.points || 1;

          const userAnswer = userAnswers.find(
            (a: any) => a.questionId === question.id
          );

          if (!userAnswer) continue; // Question not answered

          const correctAnswer = typeof question.correctAnswer === 'string'
            ? JSON.parse(question.correctAnswer)
            : question.correctAnswer;

          let isCorrect = false;

          // Score based on question type
          switch (question.questionType) {
            case "multiple_choice":
              // Handle both single and multiple correct answers
              if (Array.isArray(correctAnswer)) {
                // Multiple correct answers - compare arrays
                const userAns = Array.isArray(userAnswer.answer)
                  ? userAnswer.answer.sort()
                  : [userAnswer.answer];
                const correctAns = correctAnswer.sort();
                isCorrect = JSON.stringify(userAns) === JSON.stringify(correctAns);
              } else {
                // Single correct answer
                isCorrect = userAnswer.answer === correctAnswer;
              }
              break;

            case "true_false":
              // Boolean comparison
              isCorrect = Boolean(userAnswer.answer) === Boolean(correctAnswer);
              break;

            case "short_answer":
              // Case-insensitive string comparison with trim
              const userAns = String(userAnswer.answer || "").trim().toLowerCase();
              const correctAns = String(correctAnswer || "").trim().toLowerCase();
              isCorrect = userAns === correctAns;
              break;

            case "essay":
              // Essay questions require manual grading
              // PLACEHOLDER: Implement manual grading workflow
              isCorrect = false; // Don't auto-score essays
              break;

            default:
              isCorrect = false;
          }

          if (isCorrect) {
            totalScore += question.points || 1;
          }
        }

        // Calculate percentage
        const percentage = totalPoints > 0
          ? Math.round((totalScore / totalPoints) * 100)
          : 0;

        // Determine pass/fail
        const passed = percentage >= (quiz.passingScore || 70);

        // Calculate time spent (in minutes)
        const startTime = new Date(attempt.startedAt).getTime();
        const endTime = Date.now();
        const timeSpent = Math.round((endTime - startTime) / 60000); // Convert ms to minutes

        // Update attempt with results
        const [gradedAttempt] = await db
          .update(quizAttempts)
          .set({
            status: "graded",
            score: totalScore,
            percentage,
            passed,
            timeSpent,
            submittedAt: new Date(),
            gradedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(quizAttempts.id, input.attemptId))
          .returning();

        return {
          success: true,
          attempt: gradedAttempt,
          results: {
            score: totalScore,
            totalPoints,
            percentage,
            passed,
            timeSpent,
            passingScore: quiz.passingScore,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit quiz attempt",
          cause: error,
        });
      }
    }),

  /**
   * Get user's quiz attempts
   */
  getUserAttempts: protectedProcedure
    .input(
      z.object({
        quizId: z.number().int().optional(), // Filter by specific quiz
        status: z.enum(["in_progress", "submitted", "graded"]).optional(),
        limit: z.number().int().positive().max(100).default(20),
        offset: z.number().int().nonnegative().default(0),
      }).optional()
    )
    .query(async ({ input, ctx }) => {
      try {
        // PLACEHOLDER: Get userId from auth context
        const userId = ctx.user?.id;

        if (!userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User must be authenticated",
          });
        }

        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const filters = [eq(quizAttempts.userId, userId)];

        if (input?.quizId) {
          filters.push(eq(quizAttempts.quizId, input.quizId));
        }

        if (input?.status) {
          filters.push(eq(quizAttempts.status, input.status));
        }

        const whereClause = and(...filters);

        const attempts = await db
          .select({
            attempt: quizAttempts,
            quiz: {
              id: quizzes.id,
              title: quizzes.title,
              description: quizzes.description,
              category: quizzes.category,
              difficulty: quizzes.difficulty,
              passingScore: quizzes.passingScore,
            },
          })
          .from(quizAttempts)
          .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
          .where(whereClause)
          .orderBy(desc(quizAttempts.startedAt))
          .limit(input?.limit || 20)
          .offset(input?.offset || 0);

        // Count total for pagination
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)` })
          .from(quizAttempts)
          .where(whereClause);

        return {
          attempts,
          total: Number(count),
          limit: input?.limit || 20,
          offset: input?.offset || 0,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user attempts",
          cause: error,
        });
      }
    }),
});
