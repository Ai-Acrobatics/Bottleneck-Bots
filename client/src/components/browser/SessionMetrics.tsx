/**
 * SessionMetrics Component
 * Analytics dashboard for browser automation sessions
 * Features: success rates, execution times, resource usage, cost tracking
 */

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Activity,
  CheckCircle,
  XCircle,
  Cpu,
  HardDrive,
  RefreshCw,
  Calendar,
  Download,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { BrowserSession, SessionMetric, AggregatedMetrics } from './types';

interface SessionMetricsProps {
  sessions: BrowserSession[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

type TimeRange = '1h' | '24h' | '7d' | '30d' | 'all';

export function SessionMetrics({ sessions, isLoading, onRefresh }: SessionMetricsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');

  // Filter sessions by time range
  const filteredSessions = useMemo(() => {
    if (timeRange === 'all') return sessions;

    const now = new Date();
    const rangeMap: Record<TimeRange, number> = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      all: Infinity,
    };

    const rangeMs = rangeMap[timeRange];
    return sessions.filter((s) => {
      const createdAt = new Date(s.createdAt).getTime();
      return now.getTime() - createdAt <= rangeMs;
    });
  }, [sessions, timeRange]);

  // Calculate metrics
  const metrics = useMemo((): AggregatedMetrics => {
    const total = filteredSessions.length;
    const running = filteredSessions.filter((s) => s.status === 'running').length;
    const completed = filteredSessions.filter((s) => s.status === 'completed').length;
    const failed = filteredSessions.filter((s) => s.status === 'failed').length;

    const successRate = total > 0 ? (completed / total) * 100 : 0;

    const durations = filteredSessions
      .filter((s) => s.duration)
      .map((s) => s.duration!);
    const averageDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;

    // PLACEHOLDER: Replace with actual cost calculation
    const totalCost = filteredSessions.length * 0.01; // $0.01 per session
    const averageCost = total > 0 ? totalCost / total : 0;

    const timeRangeStart = filteredSessions.length > 0
      ? filteredSessions[filteredSessions.length - 1].createdAt
      : new Date().toISOString();

    return {
      totalSessions: total,
      runningSessions: running,
      completedSessions: completed,
      failedSessions: failed,
      averageDuration,
      successRate,
      totalCost,
      averageCost,
      timeRange: {
        start: timeRangeStart,
        end: new Date().toISOString(),
      },
    };
  }, [filteredSessions]);

  // Calculate trends (compare to previous period)
  const trends = useMemo(() => {
    // PLACEHOLDER: Implement actual trend calculation
    // This would compare current period to previous period
    return {
      sessions: 12.5,
      successRate: 5.2,
      avgDuration: -8.3,
      cost: 3.1,
    };
  }, []);

  // Session distribution by status
  const statusDistribution = useMemo(() => {
    const distribution = [
      { status: 'completed', count: metrics.completedSessions, color: 'bg-green-500' },
      { status: 'failed', count: metrics.failedSessions, color: 'bg-red-500' },
      { status: 'running', count: metrics.runningSessions, color: 'bg-blue-500' },
      {
        status: 'expired',
        count: metrics.totalSessions - metrics.completedSessions - metrics.failedSessions - metrics.runningSessions,
        color: 'bg-gray-500',
      },
    ];

    return distribution.filter((d) => d.count > 0);
  }, [metrics]);

  // Hourly session activity (last 24 hours)
  const hourlyActivity = useMemo(() => {
    // PLACEHOLDER: Implement actual hourly grouping
    // This should group sessions by hour for the selected time range
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: Math.floor(Math.random() * 10), // Simulated data
    }));
    return hours;
  }, [filteredSessions]);

  // Format duration
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Session Analytics</h2>
          <p className="text-sm text-slate-500 mt-1">
            Monitor performance and resource usage across all sessions
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Time range..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sessions */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Total Sessions</span>
              <Activity className="h-4 w-4 text-slate-400" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-3xl font-bold">{metrics.totalSessions}</div>
                <div className="flex items-center gap-1 mt-1">
                  {trends.sessions >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={`text-xs ${
                      trends.sessions >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {Math.abs(trends.sessions)}%
                  </span>
                  <span className="text-xs text-slate-500">vs previous period</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Success Rate</span>
              <CheckCircle className="h-4 w-4 text-slate-400" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-3xl font-bold">{metrics.successRate.toFixed(1)}%</div>
                <div className="flex items-center gap-1 mt-1">
                  {trends.successRate >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={`text-xs ${
                      trends.successRate >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {Math.abs(trends.successRate)}%
                  </span>
                  <span className="text-xs text-slate-500">improvement</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Duration */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Avg. Duration</span>
              <Clock className="h-4 w-4 text-slate-400" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-3xl font-bold">
                  {formatDuration(metrics.averageDuration)}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {trends.avgDuration <= 0 ? (
                    <TrendingDown className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={`text-xs ${
                      trends.avgDuration <= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {Math.abs(trends.avgDuration)}%
                  </span>
                  <span className="text-xs text-slate-500">faster</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Cost */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Total Cost</span>
              <DollarSign className="h-4 w-4 text-slate-400" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-3xl font-bold">{formatCurrency(metrics.totalCost)}</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-slate-500">
                    {formatCurrency(metrics.averageCost)} per session
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Session Status Distribution</CardTitle>
            <CardDescription>Breakdown of sessions by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusDistribution.map((item) => (
                <div key={item.status} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="capitalize font-medium">{item.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">{item.count}</span>
                      <span className="text-slate-400">
                        ({((item.count / metrics.totalSessions) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${(item.count / metrics.totalSessions) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resource Usage - PLACEHOLDER */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Usage</CardTitle>
            <CardDescription>Average resource consumption per session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">CPU Usage</span>
                  </div>
                  <span className="text-slate-600">45%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: '45%' }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Memory Usage</span>
                  </div>
                  <span className="text-slate-600">62%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-green-500" style={{ width: '62%' }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">Network Bandwidth</span>
                  </div>
                  <span className="text-slate-600">38%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-purple-500" style={{ width: '38%' }} />
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-slate-500">
                  {/* PLACEHOLDER: Add note about actual resource tracking */}
                  Note: Resource usage metrics are estimated averages. Enable detailed monitoring
                  for real-time tracking.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline - PLACEHOLDER */}
      <Card>
        <CardHeader>
          <CardTitle>Session Activity (24h)</CardTitle>
          <CardDescription>Hourly session execution over the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-1 h-48">
            {hourlyActivity.map((item) => {
              const maxCount = Math.max(...hourlyActivity.map((h) => h.count));
              const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

              return (
                <div
                  key={item.hour}
                  className="flex-1 flex flex-col items-center gap-2 group relative"
                >
                  <div
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                    style={{ height: `${height}%`, minHeight: item.count > 0 ? '4px' : '0' }}
                  >
                    <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {item.count} sessions
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">
                    {item.hour.toString().padStart(2, '0')}h
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>Last 10 completed sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Session ID</th>
                  <th className="text-left py-2 px-4">Status</th>
                  <th className="text-left py-2 px-4">Duration</th>
                  <th className="text-left py-2 px-4">Created</th>
                  <th className="text-left py-2 px-4">Cost</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.slice(0, 10).map((session) => (
                  <tr key={session.id} className="border-b hover:bg-slate-50">
                    <td className="py-2 px-4 font-mono text-xs">{session.sessionId.slice(0, 8)}...</td>
                    <td className="py-2 px-4">
                      <Badge
                        variant={
                          session.status === 'completed'
                            ? 'default'
                            : session.status === 'failed'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {session.status}
                      </Badge>
                    </td>
                    <td className="py-2 px-4">
                      {session.duration ? formatDuration(session.duration) : '-'}
                    </td>
                    <td className="py-2 px-4 text-slate-600">
                      {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                    </td>
                    <td className="py-2 px-4 text-slate-600">
                      {/* PLACEHOLDER: Replace with actual cost */}
                      {formatCurrency(0.01)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSessions.length === 0 && (
              <div className="py-12 text-center text-slate-500">
                No sessions found in this time range
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
