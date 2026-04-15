import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Lock, Bell } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const { profile, roles, hasRole, fetchProfile } = useAuthStore();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [department, setDepartment] = useState(profile?.department || '');
  const [studentId, setStudentId] = useState(profile?.student_id || '');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: fullName,
      department: department,
      student_id: studentId,
    }).eq('id', profile.id);

    if (error) { toast.error(error.message); }
    else { toast.success('Profile updated!'); fetchProfile(); }
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">
          {hasRole('admin') ? 'Admin configuration & profile settings' : 'Your profile settings'}
        </p>
      </motion.div>

      {/* Profile Section */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Profile</h2>
          <Badge variant="secondary" className="capitalize ml-auto">{roles[0] || 'student'}</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Student / Faculty ID</Label>
            <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e.g. CSE2024001" />
          </div>
        </div>

        <Button onClick={handleSaveProfile} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </motion.div>

      {/* Admin-only: Library Config */}
      {hasRole('admin') && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Library Configuration</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Auto Fine Calculation</p>
                <p className="text-xs text-muted-foreground">Automatically calculate fines for overdue books</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Send email alerts for due dates and fines</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Allow Self-Registration</p>
                <p className="text-xs text-muted-foreground">Let students register without admin approval</p>
              </div>
              <Switch />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
