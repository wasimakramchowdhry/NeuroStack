import { useState, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router';
import { adminUserAPI, type AdminUser } from '../../services/adminApi';
import { NeoCard } from '../../components/neo/NeoCard';
import { NeoButton } from '../../components/neo/NeoButton';
import { Badge } from '../../components/ui/badge';
import { useAuthStore } from '../../store/authStore';
import { Users, Trash2, ShieldCheck, ShieldOff, Search } from 'lucide-react';
import { toast } from 'sonner';

export function UserManagementPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const limit = 20;

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminUserAPI.listUsers({ skip: page * limit, limit, search });
      setUsers(response.users);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadUsers();
  };

  const handleToggleRole = async (user: AdminUser) => {
    const newRole = user.role === 'admin' ? 'learner' : 'admin';
    const action = newRole === 'admin' ? 'promote' : 'demote';

    if (!window.confirm(`Are you sure you want to ${action} "${user.full_name}" to ${newRole}?`)) return;

    try {
      await adminUserAPI.updateUser(user.id, { role: newRole });
      toast.success(`${user.full_name} is now ${newRole}`);
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (user.id === currentUser.id) {
      toast.error('You cannot delete your own account');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${user.full_name}"? This action cannot be undone.`)) return;

    try {
      await adminUserAPI.deleteUser(user.id);
      toast.success(`User "${user.full_name}" deleted`);
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const totalPages = Math.ceil(total / limit);

  const roleColors = {
    admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    learner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              User Management
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 ml-14">
            Manage user accounts and permissions
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl bg-background text-slate-800 dark:text-slate-200 placeholder-slate-400
                shadow-[inset_3px_3px_6px_var(--neo-shadow-dark),inset_-3px_-3px_6px_var(--neo-shadow-light)]
                focus:outline-none focus:ring-2 focus:ring-[var(--neo-focus)] transition-all w-64"
            />
          </div>
          <NeoButton type="submit" size="sm">Search</NeoButton>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <NeoCard className="p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400">Total Users</div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{total}</div>
        </NeoCard>
        <NeoCard className="p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400">Admins</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {users.filter(u => u.role === 'admin').length}
          </div>
        </NeoCard>
        <NeoCard className="p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400">Learners</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {users.filter(u => u.role === 'learner').length}
          </div>
        </NeoCard>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <NeoCard className="p-12 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            {search ? 'No users match your search.' : 'No users found.'}
          </p>
        </NeoCard>
      ) : (
        <NeoCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Name
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Email
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Role
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Joined
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === currentUser.id;
                  return (
                    <tr
                      key={u.id}
                      className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {u.full_name}
                          {isSelf && (
                            <span className="ml-2 text-xs text-slate-400">(you)</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-sm">
                        {u.email}
                      </td>
                      <td className="py-4 px-6">
                        <Badge className={`${roleColors[u.role]} capitalize`}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-sm">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          {!isSelf && (
                            <>
                              <NeoButton
                                size="sm"
                                variant="ghost"
                                title={u.role === 'admin' ? 'Demote to Learner' : 'Promote to Admin'}
                                onClick={() => handleToggleRole(u)}
                              >
                                {u.role === 'admin' ? (
                                  <ShieldOff className="w-4 h-4 text-yellow-600" />
                                ) : (
                                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                                )}
                              </NeoButton>
                              <NeoButton
                                size="sm"
                                variant="ghost"
                                title="Delete User"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteUser(u)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </NeoButton>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </NeoCard>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <NeoButton
            size="sm"
            variant="secondary"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </NeoButton>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Page {page + 1} of {totalPages}
          </span>
          <NeoButton
            size="sm"
            variant="secondary"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </NeoButton>
        </div>
      )}

      {/* Back Link */}
      <div className="mt-6">
        <Link to="/admin">
          <NeoButton variant="ghost">← Back to Admin Dashboard</NeoButton>
        </Link>
      </div>
    </div>
  );
}
