import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, BookMarked, GraduationCap, UserCog } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string | null;
  department: string | null;
  student_id: string | null;
  role: AppRole;
  role_id: string;
}

export default function UsersPage() {
  const { hasRole } = useAuthStore();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = hasRole('admin');

  useEffect(() => {
    async function load() {
      // Get profiles with their roles
      const { data: profiles } = await supabase.from('profiles').select('*');
      const { data: roles } = await supabase.from('user_roles').select('*');

      if (profiles && roles) {
        const merged = profiles.map(p => {
          const userRole = roles.find(r => r.user_id === p.user_id);
          return {
            id: p.id,
            user_id: p.user_id,
            full_name: p.full_name,
            department: p.department,
            student_id: p.student_id,
            role: (userRole?.role || 'student') as AppRole,
            role_id: userRole?.id || '',
          };
        });
        setUsers(merged);
      }
      setLoading(false);
    }
    load();
  }, []);

  const changeRole = async (userId: string, roleId: string, newRole: AppRole) => {
    if (!isAdmin) { toast.error('Only admins can change roles'); return; }

    const { error } = await supabase.from('user_roles').update({ role: newRole }).eq('id', roleId);
    if (error) { toast.error(error.message); return; }

    setUsers(prev => prev.map(u => u.role_id === roleId ? { ...u, role: newRole } : u));
    toast.success(`Role updated to ${newRole}`);
  };

  const roleIcon = (role: AppRole) => {
    switch (role) {
      case 'admin': return <Shield className="w-3.5 h-3.5" />;
      case 'librarian': return <BookMarked className="w-3.5 h-3.5" />;
      default: return <GraduationCap className="w-3.5 h-3.5" />;
    }
  };

  const roleColor = (role: AppRole) => {
    switch (role) {
      case 'admin': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'librarian': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'faculty': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground text-sm">
          {isAdmin ? 'Manage all users and assign roles' : 'View library users'}
        </p>
      </motion.div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : users.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No users found</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {users.map((u, i) => (
            <motion.div key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass-card p-4 flex items-center gap-4"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {u.full_name?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{u.full_name || 'Unknown User'}</p>
                <p className="text-xs text-muted-foreground">{u.department || 'No department'} {u.student_id ? `· ${u.student_id}` : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <Select value={u.role} onValueChange={(v: AppRole) => changeRole(u.user_id, u.role_id, v)}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="librarian">Librarian</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={`${roleColor(u.role)} capitalize gap-1`}>
                    {roleIcon(u.role)} {u.role}
                  </Badge>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
