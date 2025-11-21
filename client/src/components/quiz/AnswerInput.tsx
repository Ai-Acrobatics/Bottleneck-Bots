import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type Question = {
  id: number;
  questionText: string;
  questionType: string;
  options: any;
  hint: string | null;
};

type AnswerInputProps = {
  question: Question;
  value: any;
  onChange: (value: any) => void;
};

export function AnswerInput({ question, value, onChange }: AnswerInputProps) {
  const options = typeof question.options === 'string'
    ? JSON.parse(question.options)
    : question.options || [];

  switch (question.questionType) {
    case 'multiple_choice':
      return (
        <div className="space-y-3">
          <RadioGroup value={value || ''} onValueChange={onChange}>
            {options.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${question.id}-${index}`} />
                <Label
                  htmlFor={`option-${question.id}-${index}`}
                  className="flex-1 cursor-pointer py-2"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {question.hint && (
            <p className="text-sm text-muted-foreground italic mt-2">
              Hint: {question.hint}
            </p>
          )}
        </div>
      );

    case 'true_false':
      return (
        <div className="space-y-3">
          <RadioGroup value={value === true ? 'true' : value === false ? 'false' : ''} onValueChange={(val) => onChange(val === 'true')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id={`true-${question.id}`} />
              <Label htmlFor={`true-${question.id}`} className="cursor-pointer py-2">
                True
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id={`false-${question.id}`} />
              <Label htmlFor={`false-${question.id}`} className="cursor-pointer py-2">
                False
              </Label>
            </div>
          </RadioGroup>
          {question.hint && (
            <p className="text-sm text-muted-foreground italic mt-2">
              Hint: {question.hint}
            </p>
          )}
        </div>
      );

    case 'short_answer':
      return (
        <div className="space-y-2">
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter your answer..."
            className="max-w-md"
          />
          {question.hint && (
            <p className="text-sm text-muted-foreground italic">
              Hint: {question.hint}
            </p>
          )}
        </div>
      );

    case 'essay':
      return (
        <div className="space-y-2">
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter your detailed answer..."
            rows={6}
            className="resize-y"
          />
          {question.hint && (
            <p className="text-sm text-muted-foreground italic">
              Hint: {question.hint}
            </p>
          )}
        </div>
      );

    default:
      return <p className="text-muted-foreground">Unknown question type</p>;
  }
}
