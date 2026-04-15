import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { BookOpen, ArrowRight, ArrowLeft, Mail, Lock, User, Shield, GraduationCap, BookMarked, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const roles = [
  { id: 'student', label: 'Student', icon: GraduationCap, color: 'from-blue-500 to-cyan-400', desc: 'Browse & borrow books' },
  { id: 'faculty', label: 'Faculty', icon: Users, color: 'from-emerald-500 to-teal-400', desc: 'Extended borrowing privileges' },
  { id: 'librarian', label: 'Librarian', icon: BookMarked, color: 'from-amber-500 to-orange-400', desc: 'Manage books & issues' },
  { id: 'admin', label: 'Admin', icon: Shield, color: 'from-rose-500 to-pink-400', desc: 'Full system control' },
] as const;

interface AuthPageProps {
  onBack?: () => void;
}

export function AuthPage({ onBack }: AuthPageProps) {
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* College/Library Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://vemu.org/vm-uploads/banners/vemu1.jpg')`,
        }}
      />
      {/* Dark overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70 z-[1]" />

      {/* Subtle animated accent blobs */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10 px-4"
      >
        {/* Back button */}
        {onBack && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </motion.button>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">CSE Library</h1>
            <p className="text-xs text-white/50">Department Library Portal</p>
          </div>
        </div>

        {/* Role Selector - Glassmorphism */}
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
                  "relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 cursor-pointer backdrop-blur-lg",
                  active
                    ? "border-white/30 bg-white/15 shadow-lg shadow-black/20"
                    : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br transition-all",
                  active ? role.color : "from-white/10 to-white/5"
                )}>
                  <Icon className={cn("w-4 h-4", active ? "text-white" : "text-white/50")} />
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  active ? "text-white" : "text-white/50"
                )}>
                  {role.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="role-indicator"
                    className="absolute -bottom-px left-3 right-3 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Login Card - Glassmorphism */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRole + (isLogin ? '-login' : '-signup')}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="p-6 rounded-2xl border border-white/15 backdrop-blur-xl bg-white/10 shadow-2xl shadow-black/30"
          >
            <div className="flex items-center gap-2 mb-4">
              <currentRole.icon className="w-4 h-4 text-blue-400" />
              <h2 className="text-base font-semibold text-white">
                {isLogin ? 'Sign In' : 'Create Account'} as {currentRole.label}
              </h2>
            </div>
            <p className="text-xs text-white/50 mb-5">{currentRole.desc}</p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {!isLogin && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs text-white/70">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-9 h-9 text-sm bg-white/10 border-white/15 text-white placeholder:text-white/30 focus:border-blue-400/50 focus:ring-blue-400/20"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-white/70">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-9 text-sm bg-white/10 border-white/15 text-white placeholder:text-white/30 focus:border-blue-400/50 focus:ring-blue-400/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs text-white/70">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 h-9 text-sm bg-white/10 border-white/15 text-white placeholder:text-white/30 focus:border-blue-400/50 focus:ring-blue-400/20"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-9 text-sm bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-0 shadow-lg shadow-blue-500/20"
                disabled={loading}
              >
                {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="ml-2 w-3.5 h-3.5" />
              </Button>

              <p className="text-center text-xs text-white/40 pt-1">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-blue-400 hover:underline font-medium">
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
