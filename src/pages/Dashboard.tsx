import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Library, Users, ArrowLeftRight, AlertTriangle, BookOpen, TrendingUp, Clock, CheckCircle2, Shield, GraduationCap, BookMarked } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { StatCard } from '@/components/ui/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { profile, roles, isStaff, hasRole, user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ books: 0, issued: 0, overdue: 0, users: 0, fines: 0, returned: 0 });
  const [recentBooks, setRecentBooks] = useState<any[]>([]);
  const [myIssues, setMyIssues] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const primaryRole = roles[0] || 'student';

  useEffect(() => {
    async function load() {
      const promises: Promise<any>[] = [
        supabase.from('books').select('*', { count: 'exact', head: true }),
        supabase.from('books').select('*').order('created_at', { ascending: false }).limit(5),
      ];

      if (isStaff()) {
        // Staff sees all issues
        promises.push(
          supabase.from('book_issues').select('*', { count: 'exact', head: true }).eq('status', 'issued'),
          supabase.from('book_issues').select('*', { count: 'exact', head: true }).eq('status', 'returned'),
          supabase.from('book_issues').select('fine_amount'),
          supabase.from('book_issues').select('*, books(title, author)').order('created_at', { ascending: false }).limit(8),
        );
      } else {
        // Students/faculty see own issues
        promises.push(
          supabase.from('book_issues').select('*', { count: 'exact', head: true }).eq('status', 'issued').eq('user_id', user!.id),
          supabase.from('book_issues').select('*', { count: 'exact', head: true }).eq('status', 'returned').eq('user_id', user!.id),
          supabase.from('book_issues').select('fine_amount').eq('user_id', user!.id),
          supabase.from('book_issues').select('*, books(title, author)').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(5),
        );
      }

      const [booksRes, recent, issuedRes, returnedRes, finesRes, activityRes] = await Promise.all(promises);

      const totalFines = (finesRes.data || []).reduce((sum: number, i: any) => sum + (i.fine_amount || 0), 0);
      const overdueCount = (activityRes.data || []).filter((i: any) => i.status === 'issued' && new Date(i.due_date) < new Date()).length;

      setStats({
        books: booksRes.count || 0,
        issued: issuedRes.count || 0,
        overdue: overdueCount,
        users: 0,
        fines: totalFines,
        returned: returnedRes.count || 0,
      });
      setRecentBooks(recent.data || []);
      setRecentActivity(activityRes.data || []);
      setMyIssues((activityRes.data || []).filter((i: any) => i.status === 'issued'));
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

  const roleIcon = () => {
    switch (primaryRole) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'librarian': return <BookMarked className="w-4 h-4" />;
      case 'faculty': return <Users className="w-4 h-4" />;
      default: return <GraduationCap className="w-4 h-4" />;
    }
  };

  const roleColor = () => {
    switch (primaryRole) {
      case 'admin': return 'bg-rose-500/10 text-rose-500';
      case 'librarian': return 'bg-amber-500/10 text-amber-500';
      case 'faculty': return 'bg-emerald-500/10 text-emerald-500';
      default: return 'bg-blue-500/10 text-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{greeting()}, {profile?.full_name?.split(' ')[0] || 'there'}!</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {hasRole('admin') && 'Full system overview and control panel.'}
            {hasRole('librarian') && !hasRole('admin') && 'Manage books, issues, and library operations.'}
            {hasRole('faculty') && !isStaff() && 'Your faculty library dashboard.'}
            {hasRole('student') && !isStaff() && 'Your library dashboard — track books and dues.'}
          </p>
        </div>
        <Badge className={`${roleColor()} border-0 gap-1.5 px-3 py-1 capitalize`}>
          {roleIcon()} {primaryRole}
        </Badge>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* ADMIN / LIBRARIAN DASHBOARD */}
          {isStaff() && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Books" value={stats.books} icon={Library} description="In catalog" delay={0} />
                <StatCard title="Active Issues" value={stats.issued} icon={ArrowLeftRight} description="Currently loaned" delay={0.1} />
                <StatCard title="Overdue" value={stats.overdue} icon={AlertTriangle} description="Needs follow-up" delay={0.2} />
                <StatCard title="Fines Collected" value={`₹${stats.fines}`} icon={TrendingUp} description="Total amount" delay={0.3} />
              </div>

              {/* Quick Actions for Staff */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
                <h2 className="text-sm font-semibold text-muted-foreground mb-3">QUICK ACTIONS</h2>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => navigate('/books')}>
                    <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Add Book
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate('/transactions')}>
                    <ArrowLeftRight className="w-3.5 h-3.5 mr-1.5" /> Issue Book
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate('/reports')}>
                    <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> View Reports
                  </Button>
                  {hasRole('admin') && (
                    <Button size="sm" variant="outline" onClick={() => navigate('/users')}>
                      <Users className="w-3.5 h-3.5 mr-1.5" /> Manage Users
                    </Button>
                  )}
                </div>
              </motion.div>

              {/* Recent Activity for Staff */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <ArrowLeftRight className="w-5 h-5 text-primary" /> Recent Transactions
                </h2>
                <div className="space-y-3">
                  {recentActivity.slice(0, 6).map((issue, i) => {
                    const isOverdue = issue.status === 'issued' && new Date(issue.due_date) < new Date();
                    return (
                      <motion.div key={issue.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.04 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isOverdue ? 'bg-destructive/10' : issue.status === 'returned' ? 'bg-success/10' : 'bg-primary/10'}`}>
                            {isOverdue ? <AlertTriangle className="w-3.5 h-3.5 text-destructive" /> : issue.status === 'returned' ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <Clock className="w-3.5 h-3.5 text-primary" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{issue.books?.title || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">Due: {new Date(issue.due_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Badge variant={isOverdue ? 'destructive' : issue.status === 'returned' ? 'secondary' : 'default'} className="capitalize text-xs">
                          {isOverdue ? 'overdue' : issue.status}
                        </Badge>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}

          {/* STUDENT / FACULTY DASHBOARD */}
          {!isStaff() && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Books Borrowed" value={stats.issued} icon={BookOpen} description="Currently with you" delay={0} />
                <StatCard title="Overdue" value={stats.overdue} icon={AlertTriangle} description={stats.overdue > 0 ? 'Return ASAP!' : 'All clear'} delay={0.1} />
                <StatCard title="Books Returned" value={stats.returned} icon={CheckCircle2} description="Total returns" delay={0.2} />
                <StatCard title="Pending Fines" value={`₹${stats.fines}`} icon={TrendingUp} description={stats.fines > 0 ? 'Please clear' : 'No fines'} delay={0.3} />
              </div>

              {/* My Active Books */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-primary" /> My Current Books
                </h2>
                {myIssues.length === 0 ? (
                  <div className="text-center py-6">
                    <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No books currently borrowed.</p>
                    <Button size="sm" variant="outline" className="mt-3" onClick={() => navigate('/books')}>Browse Catalog</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myIssues.map((issue, i) => {
                      const isOverdue = new Date(issue.due_date) < new Date();
                      const daysLeft = Math.ceil((new Date(issue.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      return (
                        <motion.div key={issue.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.04 }}
                          className={`flex items-center justify-between p-3 rounded-lg ${isOverdue ? 'bg-destructive/5 border border-destructive/20' : 'bg-muted/50'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isOverdue ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                              {isOverdue ? <AlertTriangle className="w-3.5 h-3.5 text-destructive" /> : <BookOpen className="w-3.5 h-3.5 text-primary" />}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{issue.books?.title || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">Due: {new Date(issue.due_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {isOverdue ? (
                              <span className="text-xs font-medium text-destructive">{Math.abs(daysLeft)} days overdue</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">{daysLeft} days left</span>
                            )}
                            {issue.fine_amount > 0 && (
                              <p className="text-xs font-medium text-destructive">Fine: ₹{issue.fine_amount}</p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              {/* Browse suggestion */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Library className="w-5 h-5 text-primary" /> Recently Added
                </h2>
                <div className="space-y-2">
                  {recentBooks.map((book, i) => (
                    <motion.div key={book.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.04 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div>
                        <p className="font-medium text-sm">{book.title}</p>
                        <p className="text-xs text-muted-foreground">{book.author} · {book.category}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${book.available_copies > 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {book.available_copies > 0 ? `${book.available_copies} avail` : 'Unavailable'}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </>
      )}
    </div>
  );
}
