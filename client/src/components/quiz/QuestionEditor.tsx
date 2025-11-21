import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Trash2, Plus, GripVertical } from 'lucide-react';

type Question = {
  id?: number;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: string[];
  correctAnswer: any;
  points: number;
  order: number;
  hint?: string;
  explanation?: string;
};

type QuestionEditorProps = {
  question: Question;
  onChange: (question: Question) => void;
  onDelete: () => void;
  index: number;
};

export function QuestionEditor({ question, onChange, onDelete, index }: QuestionEditorProps) {
  const [options, setOptions] = useState<string[]>(question.options || ['', '']);

  const handleQuestionTextChange = (value: string) => {
    onChange({ ...question, questionText: value });
  };

  const handleQuestionTypeChange = (value: string) => {
    const newQuestion: Question = {
      ...question,
      questionType: value as Question['questionType'],
    };

    // Reset options and correctAnswer based on type
    if (value === 'multiple_choice') {
      newQuestion.options = ['', ''];
      newQuestion.correctAnswer = '';
    } else if (value === 'true_false') {
      newQuestion.options = undefined;
      newQuestion.correctAnswer = true;
    } else {
      newQuestion.options = undefined;
      newQuestion.correctAnswer = '';
    }

    onChange(newQuestion);
    if (value === 'multiple_choice') {
      setOptions(['', '']);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    onChange({ ...question, options: newOptions });
  };

  const handleAddOption = () => {
    const newOptions = [...options, ''];
    setOptions(newOptions);
    onChange({ ...question, options: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return; // Keep at least 2 options
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    onChange({ ...question, options: newOptions });
  };

  const handleCorrectAnswerChange = (value: any) => {
    onChange({ ...question, correctAnswer: value });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
          <CardTitle className="text-base">Question {index + 1}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="ml-auto text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`question-text-${index}`}>Question Text *</Label>
          <Textarea
            id={`question-text-${index}`}
            value={question.questionText}
            onChange={(e) => handleQuestionTextChange(e.target.value)}
            placeholder="Enter your question..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`question-type-${index}`}>Question Type *</Label>
            <Select value={question.questionType} onValueChange={handleQuestionTypeChange}>
              <SelectTrigger id={`question-type-${index}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="true_false">True/False</SelectItem>
                <SelectItem value="short_answer">Short Answer</SelectItem>
                <SelectItem value="essay">Essay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`points-${index}`}>Points *</Label>
            <Input
              id={`points-${index}`}
              type="number"
              min={0}
              max={100}
              value={question.points}
              onChange={(e) => onChange({ ...question, points: parseInt(e.target.value) || 1 })}
            />
          </div>
        </div>

        {question.questionType === 'multiple_choice' && (
          <div className="space-y-3">
            <Label>Answer Options *</Label>
            <RadioGroup value={question.correctAnswer} onValueChange={handleCorrectAnswerChange}>
              {options.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <RadioGroupItem value={option} id={`correct-${index}-${optIndex}`} />
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(optIndex, e.target.value)}
                    placeholder={`Option ${optIndex + 1}`}
                    className="flex-1"
                  />
                  {options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveOption(optIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </RadioGroup>
            {options.length < 6 && (
              <Button variant="outline" size="sm" onClick={handleAddOption}>
                <Plus className="w-4 h-4 mr-1.5" />
                Add Option
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              Select the radio button next to the correct answer
            </p>
          </div>
        )}

        {question.questionType === 'true_false' && (
          <div className="space-y-2">
            <Label>Correct Answer *</Label>
            <RadioGroup
              value={question.correctAnswer === true ? 'true' : 'false'}
              onValueChange={(val) => handleCorrectAnswerChange(val === 'true')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id={`true-${index}`} />
                <Label htmlFor={`true-${index}`}>True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id={`false-${index}`} />
                <Label htmlFor={`false-${index}`}>False</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {question.questionType === 'short_answer' && (
          <div className="space-y-2">
            <Label htmlFor={`correct-answer-${index}`}>Correct Answer *</Label>
            <Input
              id={`correct-answer-${index}`}
              value={question.correctAnswer || ''}
              onChange={(e) => handleCorrectAnswerChange(e.target.value)}
              placeholder="Enter the correct answer..."
            />
            <p className="text-xs text-muted-foreground">
              Case-insensitive matching will be used
            </p>
          </div>
        )}

        {question.questionType === 'essay' && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              Essay questions require manual grading. No correct answer needed.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor={`hint-${index}`}>Hint (Optional)</Label>
          <Input
            id={`hint-${index}`}
            value={question.hint || ''}
            onChange={(e) => onChange({ ...question, hint: e.target.value })}
            placeholder="Provide a hint for students..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`explanation-${index}`}>Explanation (Optional)</Label>
          <Textarea
            id={`explanation-${index}`}
            value={question.explanation || ''}
            onChange={(e) => onChange({ ...question, explanation: e.target.value })}
            placeholder="Explain the correct answer..."
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
}
