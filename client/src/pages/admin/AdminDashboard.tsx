import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Activity,
  Database,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, trend }) => {
  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
            {change && (
              <p className={`text-sm mt-1 flex items-center gap-1 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trend === 'up' ? '↑' : '↓'} {change}
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600/20">
            <Icon className="h-6 w-6 text-indigo-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  status: 'success' | 'error' | 'pending';
}

const recentActivities: ActivityItem[] = [
  {
    id: '1',
    user: 'john@example.com',
    action: 'Created new client profile for "TechCorp"',
    timestamp: '2 minutes ago',
    status: 'success',
  },
  {
    id: '2',
    user: 'sarah@example.com',
    action: 'Updated API key configuration',
    timestamp: '15 minutes ago',
    status: 'success',
  },
  {
    id: '3',
    user: 'mike@example.com',
    action: 'Failed login attempt',
    timestamp: '1 hour ago',
    status: 'error',
  },
  {
    id: '4',
    user: 'admin@example.com',
    action: 'System backup completed',
    timestamp: '3 hours ago',
    status: 'success',
  },
  {
    id: '5',
    user: 'lisa@example.com',
    action: 'Webhook test in progress',
    timestamp: '5 hours ago',
    status: 'pending',
  },
];

const getStatusIcon = (status: ActivityItem['status']) => {
  switch (status) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
  }
};

export const AdminDashboard: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-3xl font-bold text-white">Dashboard Overview</h2>
          <p className="text-slate-400 mt-1">Monitor system health and user activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value="1,284"
            change="+12% from last month"
            icon={Users}
            trend="up"
          />
          <StatCard
            title="Active Sessions"
            value="342"
            change="+8% from yesterday"
            icon={Activity}
            trend="up"
          />
          <StatCard
            title="Database Size"
            value="24.5 GB"
            change="+2.3 GB this week"
            icon={Database}
            trend="up"
          />
          <StatCard
            title="System Errors"
            value="3"
            change="-15 from yesterday"
            icon={AlertCircle}
            trend="down"
          />
        </div>

        {/* Activity Feed and Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <Card className="bg-slate-900/50 border-slate-800 lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                  <CardDescription>Latest actions across the system</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                  View All
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 rounded-lg border border-slate-800 bg-slate-800/50 p-4 transition-colors hover:bg-slate-800"
                  >
                    <div className="mt-0.5">{getStatusIcon(activity.status)}</div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-slate-300">{activity.action}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{activity.user}</span>
                        <span>•</span>
                        <span>{activity.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription>Common admin tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-indigo-600 hover:bg-indigo-700" size="lg">
                <Users className="mr-2 h-5 w-5" />
                Create New User
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-slate-700 text-slate-300 hover:bg-slate-800"
                size="lg"
              >
                <Database className="mr-2 h-5 w-5" />
                Backup Database
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-slate-700 text-slate-300 hover:bg-slate-800"
                size="lg"
              >
                <AlertCircle className="mr-2 h-5 w-5" />
                View System Logs
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-slate-700 text-slate-300 hover:bg-slate-800"
                size="lg"
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">System Status</CardTitle>
            <CardDescription>Current status of all services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-medium text-white">API Server</p>
                  <p className="text-xs text-slate-400">Operational</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-medium text-white">Database</p>
                  <p className="text-xs text-slate-400">Operational</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <div>
                  <p className="text-sm font-medium text-white">Email Service</p>
                  <p className="text-xs text-slate-400">Degraded</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-medium text-white">Storage</p>
                  <p className="text-xs text-slate-400">Operational</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};
