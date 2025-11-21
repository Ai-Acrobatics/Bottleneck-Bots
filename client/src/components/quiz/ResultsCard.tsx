import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, Target } from 'lucide-react';

type ResultsCardProps = {
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  timeSpent?: number | null;
};

export function ResultsCard({ score, totalPoints, percentage, passed, passingScore, timeSpent }: ResultsCardProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quiz Results</CardTitle>
          <Badge
            variant={passed ? 'default' : 'destructive'}
            className={`text-lg px-4 py-1 ${passed ? 'bg-green-500 hover:bg-green-600' : ''}`}
          >
            {passed ? 'PASSED' : 'FAILED'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl font-bold mb-2">{percentage}%</div>
            <p className="text-muted-foreground">
              {score} out of {totalPoints} points
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <div className="flex items-center gap-3">
            {passed ? (
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            ) : (
              <XCircle className="w-8 h-8 text-red-500" />
            )}
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-semibold">{passed ? 'Passed' : 'Failed'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Passing Score</p>
              <p className="font-semibold">{passingScore}%</p>
            </div>
          </div>

          {timeSpent !== null && timeSpent !== undefined && (
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Time Spent</p>
                <p className="font-semibold">{timeSpent} min</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
