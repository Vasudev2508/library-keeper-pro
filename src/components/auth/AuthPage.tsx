import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { BookOpen, ArrowRight, Mail, Lock, User, Shield, GraduationCap, BookMarked, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const roles = [
  { id: 'student', label: 'Student', icon: GraduationCap, color: 'from-blue-500 to-cyan-400', desc: 'Browse & borrow books' },
  { id: 'faculty', label: 'Faculty', icon: Users, color: 'from-emerald-500 to-teal-400', desc: 'Extended borrowing privileges' },
  { id: 'librarian', label: 'Librarian', icon: BookMarked, color: 'from-amber-500 to-orange-400', desc: 'Manage books & issues' },
  { id: 'admin', label: 'Admin', icon: Shield, color: 'from-rose-500 to-pink-400', desc: 'Full system control' },
] as const;

export function AuthPage() {
  const [selectedRole, setSelectedRole] = useState<string>('student');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const currentRole = roles.find(r => r.id === selectedRole)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Welcome back!');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        toast.success('Account created! Check your email to confirm.');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">CSE Library</h1>
            <p className="text-xs text-muted-foreground">Department Library Portal</p>
          </div>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {roles.map((role) => {
            const Icon = role.icon;
            const active = selectedRole === role.id;
            return (
              <motion.button
                key={role.id}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedRole(role.id)}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 cursor-pointer",
                  active
                    ? "border-primary/50 bg-primary/10 shadow-md shadow-primary/10"
                    : "border-border/50 bg-card/50 hover:bg-card/80 hover:border-border"
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br transition-all",
                  active ? role.color : "from-muted to-muted"
                )}>
                  <Icon className={cn("w-4 h-4", active ? "text-white" : "text-muted-foreground")} />
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  active ? "text-foreground" : "text-muted-foreground"
                )}>
                  {role.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="role-indicator"
                    className="absolute -bottom-px left-3 right-3 h-0.5 bg-primary rounded-full"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Login Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRole + (isLogin ? '-login' : '-signup')}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <currentRole.icon className="w-4 h-4 text-primary" />
              <h2 className="text-base font-semibold">
                {isLogin ? 'Sign In' : 'Create Account'} as {currentRole.label}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mb-5">{currentRole.desc}</p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {!isLogin && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input id="name" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-9 h-9 text-sm" required />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9 h-9 text-sm" required />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9 h-9 text-sm" required minLength={6} />
                </div>
              </div>

              <Button type="submit" className="w-full h-9 text-sm" disabled={loading}>
                {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="ml-2 w-3.5 h-3.5" />
              </Button>

              <p className="text-center text-xs text-muted-foreground pt-1">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </form>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
