import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type QuizFormData = {
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number | null;
  passingScore: number;
  attemptsAllowed: number | null;
};

type QuizFormProps = {
  quiz?: QuizFormData;
  onChange: (quiz: QuizFormData) => void;
};

const defaultQuiz: QuizFormData = {
  title: '',
  description: '',
  category: 'general',
  difficulty: 'medium',
  timeLimit: null,
  passingScore: 70,
  attemptsAllowed: null,
};

export function QuizForm({ quiz = defaultQuiz, onChange }: QuizFormProps) {
  const [formData, setFormData] = useState<QuizFormData>(quiz);

  const handleChange = (field: keyof QuizFormData, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange(newData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz Information</CardTitle>
        <CardDescription>
          Configure your quiz settings and metadata
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter quiz title..."
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground">
            {formData.title.length}/200 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe what this quiz covers..."
            rows={3}
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground">
            {formData.description.length}/1000 characters
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(val) => handleChange('category', val)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="customer-service">Customer Service</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select value={formData.difficulty} onValueChange={(val) => handleChange('difficulty', val)}>
              <SelectTrigger id="difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
            <Input
              id="timeLimit"
              type="number"
              min={0}
              max={300}
              value={formData.timeLimit || ''}
              onChange={(e) => handleChange('timeLimit', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="No limit"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for no time limit
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="passingScore">Passing Score (%)</Label>
            <Input
              id="passingScore"
              type="number"
              min={0}
              max={100}
              value={formData.passingScore}
              onChange={(e) => handleChange('passingScore', parseInt(e.target.value) || 70)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="attemptsAllowed">Maximum Attempts</Label>
          <Input
            id="attemptsAllowed"
            type="number"
            min={1}
            max={100}
            value={formData.attemptsAllowed || ''}
            onChange={(e) => handleChange('attemptsAllowed', e.target.value ? parseInt(e.target.value) : null)}
            placeholder="Unlimited"
          />
          <p className="text-xs text-muted-foreground">
            Leave empty for unlimited attempts
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
