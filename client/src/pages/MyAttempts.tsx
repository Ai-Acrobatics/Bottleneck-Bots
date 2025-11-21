import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuiz } from '@/hooks/useQuiz';
import { Eye, Download, Loader2, FileText } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MyAttempts() {
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { getUserAttempts, listQuizzes } = useQuiz();

  // Build filter params
  const filterParams: any = {};
  if (statusFilter !== 'all') filterParams.status = statusFilter;

  const { data: attemptsData, isLoading } = getUserAttempts(filterParams);
  const { data: quizzesData } = listQuizzes();

  const handleViewResults = (quizId: number, attemptId: number) => {
    setLocation(`/quizzes/${quizId}/results/${attemptId}`);
  };

  const handleExportCSV = () => {
    if (!attemptsData?.attempts) return;

    const csvRows = [
      ['Quiz', 'Date', 'Score (%)', 'Status', 'Time Spent (min)', 'Points', 'Passed'].join(','),
    ];

    attemptsData.attempts.forEach(({ attempt, quiz }) => {
      const date = new Date(attempt.startedAt).toLocaleDateString();
      const status = attempt.status;
      const score = attempt.percentage || 0;
      const timeSpent = attempt.timeSpent || 0;
      const points = `${attempt.score || 0}`;
      const passed = attempt.passed ? 'Yes' : 'No';

      csvRows.push(
        [quiz.title, date, score, status, timeSpent, points, passed].join(',')
      );
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quiz-attempts-${Date.now()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const attempts = attemptsData?.attempts || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Quiz Attempts</h1>
          <p className="text-muted-foreground mt-1">
            View your quiz history and results
          </p>
        </div>
        {attempts.length > 0 && (
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </Button>
        )}
      </div>

      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="graded">Graded</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {attempts.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No attempts yet</CardTitle>
            <CardDescription>
              You haven't taken any quizzes yet. Start by browsing available quizzes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/quizzes')}>
              <FileText className="w-4 h-4 mr-1.5" />
              Browse Quizzes
            </Button>
          </CardContent>
        </Card>
      )}

      {attempts.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quiz</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date Taken</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time Spent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map(({ attempt, quiz }) => {
                  const dateTaken = new Date(attempt.startedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <TableRow key={attempt.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{quiz.title}</p>
                          {quiz.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {quiz.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {quiz.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{dateTaken}</TableCell>
                      <TableCell>
                        {attempt.status === 'graded' ? (
                          <div>
                            <span className="font-semibold">{attempt.percentage}%</span>
                            <span className="text-xs text-muted-foreground ml-1">
                              ({attempt.score} pts)
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {attempt.status === 'graded' ? (
                          <Badge
                            variant={attempt.passed ? 'default' : 'destructive'}
                            className={attempt.passed ? 'bg-green-500 hover:bg-green-600' : ''}
                          >
                            {attempt.passed ? 'Passed' : 'Failed'}
                          </Badge>
                        ) : (
                          <Badge variant="outline">{attempt.status}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {attempt.timeSpent ? (
                          <span>{attempt.timeSpent} min</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {attempt.status === 'graded' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewResults(quiz.id, attempt.id)}
                          >
                            <Eye className="w-4 h-4 mr-1.5" />
                            View Results
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/quizzes/${quiz.id}/take`)}
                          >
                            Continue
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {attemptsData && attemptsData.total > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {attempts.length} of {attemptsData.total} attempts
        </div>
      )}
    </div>
  );
}
