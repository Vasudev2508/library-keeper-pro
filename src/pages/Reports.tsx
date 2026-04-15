import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, BookOpen, ArrowLeftRight, AlertTriangle, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { StatCard } from '@/components/ui/stat-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Reports() {
  const [stats, setStats] = useState({ totalBooks: 0, totalIssued: 0, totalReturned: 0, totalOverdue: 0, totalFines: 0 });
  const [categoryBreakdown, setCategoryBreakdown] = useState<{ category: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [books, issued, returned, overdue, fines, cats] = await Promise.all([
        supabase.from('books').select('*', { count: 'exact', head: true }),
        supabase.from('book_issues').select('*', { count: 'exact', head: true }).eq('status', 'issued'),
        supabase.from('book_issues').select('*', { count: 'exact', head: true }).eq('status', 'returned'),
        supabase.from('book_issues').select('*', { count: 'exact', head: true }).eq('status', 'overdue'),
        supabase.from('book_issues').select('fine_amount'),
        supabase.from('books').select('category'),
      ]);

      const totalFines = (fines.data || []).reduce((sum, i) => sum + (i.fine_amount || 0), 0);
      const catMap = new Map<string, number>();
      (cats.data || []).forEach((b) => catMap.set(b.category, (catMap.get(b.category) || 0) + 1));

      setStats({
        totalBooks: books.count || 0,
        totalIssued: issued.count || 0,
        totalReturned: returned.count || 0,
        totalOverdue: overdue.count || 0,
        totalFines: totalFines,
      });
      setCategoryBreakdown(Array.from(catMap).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count));
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground text-sm">Library usage overview</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Books" value={stats.totalBooks} icon={BookOpen} delay={0} />
            <StatCard title="Active Issues" value={stats.totalIssued} icon={ArrowLeftRight} delay={0.1} />
            <StatCard title="Overdue" value={stats.totalOverdue} icon={AlertTriangle} delay={0.2} />
            <StatCard title="Total Fines" value={`₹${stats.totalFines.toFixed(0)}`} icon={TrendingUp} delay={0.3} />
          </div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Books by Category</h2>
            {categoryBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data available.</p>
            ) : (
              <div className="space-y-3">
                {categoryBreakdown.map((cat, i) => (
                  <div key={cat.category} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-32 truncate">{cat.category}</span>
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(cat.count / stats.totalBooks) * 100}%` }}
                        transition={{ delay: 0.5 + i * 0.05, duration: 0.6 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">{cat.count}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
