import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Search,
  MoreVertical,
  UserPlus,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  Shield,
  Users as UsersIcon,
} from 'lucide-react';
import { UserRole } from '@/types';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'suspended' | 'pending';
  lastLogin: string;
  createdAt: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'OWNER',
    status: 'active',
    lastLogin: '2024-12-11 10:30 AM',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Sarah Smith',
    email: 'sarah@example.com',
    role: 'MANAGER',
    status: 'active',
    lastLogin: '2024-12-11 09:15 AM',
    createdAt: '2024-02-20',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'VA',
    status: 'active',
    lastLogin: '2024-12-10 04:45 PM',
    createdAt: '2024-03-10',
  },
  {
    id: '4',
    name: 'Lisa Anderson',
    email: 'lisa@example.com',
    role: 'MANAGER',
    status: 'suspended',
    lastLogin: '2024-12-08 02:20 PM',
    createdAt: '2024-04-05',
  },
  {
    id: '5',
    name: 'Tom Wilson',
    email: 'tom@example.com',
    role: 'VA',
    status: 'pending',
    lastLogin: 'Never',
    createdAt: '2024-12-10',
  },
];

const getRoleBadge = (role: UserRole) => {
  const styles = {
    OWNER: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    MANAGER: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    VA: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  const icons = {
    OWNER: Shield,
    MANAGER: UsersIcon,
    VA: UsersIcon,
  };

  const Icon = icons[role];

  return (
    <Badge className={styles[role]}>
      <Icon className="mr-1 h-3 w-3" />
      {role}
    </Badge>
  );
};

const getStatusBadge = (status: User['status']) => {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          <CheckCircle className="mr-1 h-3 w-3" />
          Active
        </Badge>
      );
    case 'suspended':
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
          <Ban className="mr-1 h-3 w-3" />
          Suspended
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          <XCircle className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
  }
};

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSuspendUser = (user: User) => {
    setSelectedUser(user);
    setShowSuspendDialog(true);
  };

  const confirmSuspend = () => {
    if (selectedUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
            : u
        )
      );
    }
    setShowSuspendDialog(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
    }
    setShowDeleteDialog(false);
    setSelectedUser(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">User Management</h2>
            <p className="text-slate-400 mt-1">Manage user accounts and permissions</p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Filters and Search */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[180px] bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="OWNER">Owner</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="VA">VA</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* User Table */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">
              Users ({filteredUsers.length})
            </CardTitle>
            <CardDescription>
              A list of all users including their name, email, role and status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Name</TableHead>
                  <TableHead className="text-slate-400">Email</TableHead>
                  <TableHead className="text-slate-400">Role</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Last Login</TableHead>
                  <TableHead className="text-slate-400">Created</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-slate-400 py-8"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-slate-800">
                      <TableCell className="font-medium text-white">
                        {user.name}
                      </TableCell>
                      <TableCell className="text-slate-300">{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {user.lastLogin}
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                              >
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-slate-900 border-slate-800"
                            >
                              <DropdownMenuLabel className="text-white">
                                Actions
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-slate-800" />
                              <DropdownMenuItem className="text-slate-300 hover:bg-slate-800 hover:text-white">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-slate-300 hover:bg-slate-800 hover:text-white"
                                onClick={() => handleSuspendUser(user)}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                {user.status === 'active' ? 'Suspend' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-slate-800" />
                              <DropdownMenuItem
                                className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                onClick={() => handleDeleteUser(user)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Suspend User Dialog */}
      <AlertDialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.status === 'active' ? 'Suspend' : 'Activate'} User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {selectedUser?.status === 'active' ? 'suspend' : 'activate'}{' '}
              {selectedUser?.name}? {selectedUser?.status === 'active' && 'They will no longer be able to access the system.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSuspend}
              className={selectedUser?.status === 'active' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {selectedUser?.status === 'active' ? 'Suspend' : 'Activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUser?.name}? This action cannot be undone
              and will permanently remove all user data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};
