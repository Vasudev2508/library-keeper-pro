import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  department: string | null;
  student_id: string | null;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  loading: boolean;
  setUser: (user: User | null) => void;
  fetchProfile: () => Promise<void>;
  fetchRoles: () => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  isStaff: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  roles: [],
  loading: true,

  setUser: (user) => set({ user }),

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (data) set({ profile: data });
  },

  fetchRoles: async () => {
    const { user } = get();
    if (!user) return;
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    if (data) set({ roles: data.map((r) => r.role) });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, roles: [] });
  },

  hasRole: (role) => get().roles.includes(role),
  isStaff: () => {
    const roles = get().roles;
    return roles.includes('admin') || roles.includes('librarian');
  },
}));
