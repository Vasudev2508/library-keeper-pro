import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Library, Users, ArrowLeftRight, AlertTriangle, BookOpen, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { StatCard } from '@/components/ui/stat-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { profile, roles, isStaff } = useAuthStore();
  const [stats, setStats] = useState({ books: 0, issued: 0, overdue: 0, users: 0 });
  const [recentBooks, setRecentBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [booksRes, issuedRes, overdueRes] = await Promise.all([
        supabase.from('books').select('*', { count: 'exact', head: true }),
        supabase.from('book_issues').select('*', { count: 'exact', head: true }).eq('status', 'issued'),
        supabase.from('book_issues').select('*', { count: 'exact', head: true }).eq('status', 'overdue'),
      ]);

      const recent = await supabase.from('books').select('*').order('created_at', { ascending: false }).limit(5);

      setStats({
        books: booksRes.count || 0,
        issued: issuedRes.count || 0,
        overdue: overdueRes.count || 0,
        users: 0,
      });
      setRecentBooks(recent.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold">{greeting()}, {profile?.full_name?.split(' ')[0] || 'there'}!</h1>
        <p className="text-muted-foreground mt-1">
          {isStaff() ? 'Here\'s your library overview.' : 'Welcome to the CSE Department Library.'}
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Books" value={stats.books} icon={Library} description="In catalog" delay={0} />
          <StatCard title="Currently Issued" value={stats.issued} icon={ArrowLeftRight} description="Active loans" delay={0.1} />
          <StatCard title="Overdue" value={stats.overdue} icon={AlertTriangle} description="Needs attention" delay={0.2} />
          <StatCard title="Your Role" value={roles[0] || 'student'} icon={Users} description="Access level" delay={0.3} />
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-primary" /> Recently Added Books
        </h2>
        {recentBooks.length === 0 ? (
          <p className="text-muted-foreground text-sm">No books in the catalog yet.</p>
        ) : (
          <div className="space-y-3">
            {recentBooks.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">{book.title}</p>
                  <p className="text-xs text-muted-foreground">{book.author} · {book.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${book.available_copies > 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    {book.available_copies > 0 ? `${book.available_copies} available` : 'Unavailable'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
