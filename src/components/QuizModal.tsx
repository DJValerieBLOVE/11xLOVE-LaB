/**
 * QuizModal Component
 * 
 * Interactive quiz with multiple-choice and fill-in-blank questions
 * Required to unlock "Mark Complete" button
 * One attempt per quiz (stored in localStorage for MVP, Nostr later)
 * 
 * NEW FLOW: Quiz → Results → (triggers journal prompt in parent)
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import type { Quiz } from '@/types/experiment';

interface QuizModalProps {
  quiz: Quiz;
  lessonId: string;
  open: boolean;
  onClose: () => void;
  onPass: () => void; // Called when quiz is passed (triggers journal prompt)
}

export function QuizModal({ quiz, lessonId, open, onClose, onPass }: QuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered - calculate score
      calculateScore();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    
    quiz.questions.forEach((question) => {
      const userAnswer = answers[question.id]?.trim().toLowerCase();
      const correctAnswer = question.correctAnswer.trim().toLowerCase();
      
      // For fill-in-blank with empty correctAnswer, any answer is correct
      if (question.type === 'fill-in-blank' && correctAnswer === '') {
        if (userAnswer && userAnswer.length > 0) {
          correct++;
        }
      } else if (userAnswer === correctAnswer) {
        correct++;
      }
    });

    const scorePercentage = Math.round((correct / totalQuestions) * 100);
    const quizPassed = scorePercentage >= quiz.passingScore;
    
    setScore(scorePercentage);
    setPassed(quizPassed);
    setShowResults(true);

    // Save quiz attempt to localStorage (will be Nostr event later)
    localStorage.setItem(`quiz-attempt-${lessonId}`, JSON.stringify({
      score: scorePercentage,
      passed: quizPassed,
      completedAt: new Date().toISOString(),
    }));

    // If passed, auto-close after showing results for 2 seconds
    if (quizPassed) {
      setTimeout(() => {
        onClose();
        onPass();
      }, 2000); // Show celebration for 2 seconds, then transition to journal
    }
  };

  const handleRetry = () => {
    // Reset quiz state
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
    setPassed(false);
  };

  const handleClose = () => {
    if (passed) {
      onClose();
    } else {
      // If failed, can retry or close
      if (confirm('You haven\'t passed the quiz yet. Are you sure you want to close?')) {
        onClose();
      }
    }
  };

  const isAnswered = answers[currentQuestion?.id];
  const canProceed = isAnswered && isAnswered.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {!showResults ? (
          <>
            <DialogHeader>
              <DialogTitle>Test Your Knowledge</DialogTitle>
              <DialogDescription>
                Question {currentQuestionIndex + 1} of {totalQuestions} • {quiz.passingScore}% needed to pass
              </DialogDescription>
              <Progress value={progress} className="mt-2" />
            </DialogHeader>

            <div className="space-y-6 py-6">
              {/* Question */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {currentQuestion.question}
                </h3>

                {/* Multiple Choice */}
                {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                  <RadioGroup
                    value={answers[currentQuestion.id] || ''}
                    onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
                  >
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`option-${index}`} />
                          <Label 
                            htmlFor={`option-${index}`}
                            className="flex-1 cursor-pointer py-3 px-4 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}

                {/* Fill in the Blank */}
                {currentQuestion.type === 'fill-in-blank' && (
                  <div>
                    <Input
                      placeholder="Your answer..."
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                      className="text-base"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Share your thoughts - there's no wrong answer! 💜
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                >
                  {currentQuestionIndex === totalQuestions - 1 ? 'Submit Quiz' : 'Next Question'}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Results Screen */}
            <DialogHeader>
              <DialogTitle className="text-center">
                {passed ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                    <span>Quiz Passed!</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <XCircle className="h-6 w-6 text-orange-500" />
                    <span>Not Quite Yet</span>
                  </div>
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="py-6 text-center space-y-6">
              {/* Score Display */}
              <div className="space-y-2">
                <div className="text-6xl font-bold text-primary">
                  {score}%
                </div>
                <p className="text-muted-foreground">
                  You got {Math.round((score / 100) * totalQuestions)} out of {totalQuestions} correct
                </p>
              </div>

              {passed ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 space-y-3">
                  <Sparkles className="h-12 w-12 mx-auto text-green-600" />
                  <h3 className="text-xl font-bold text-green-700">Lesson Complete!</h3>
                  <p className="text-sm text-green-600">
                    You mastered it! Ready for the next one?
                  </p>
                </div>
              ) : (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 space-y-3">
                  <p className="text-sm text-orange-600">
                    You need {quiz.passingScore}% to pass. Review the lesson and try again!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Remember: You're a VIP — Victory In Progress! 💜
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                {!passed && (
                  <Button variant="outline" onClick={handleRetry}>
                    Try Again
                  </Button>
                )}
                <Button onClick={onClose}>
                  {passed ? 'Continue' : 'Review Lesson'}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
