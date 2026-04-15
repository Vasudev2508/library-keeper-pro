import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function Transactions() {
  const { user } = useAuthStore();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('book_issues')
        .select('*, books(title, author)')
        .order('created_at', { ascending: false });
      setIssues(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'issued': return <Clock className="w-4 h-4 text-primary" />;
      case 'returned': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default: return null;
    }
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case 'issued': return 'default' as const;
      case 'returned': return 'secondary' as const;
      case 'overdue': return 'destructive' as const;
      default: return 'default' as const;
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-muted-foreground text-sm">Book issue and return history</p>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : issues.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
          <ArrowLeftRight className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No transactions yet</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue, i) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                {statusIcon(issue.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{issue.books?.title || 'Unknown Book'}</p>
                <p className="text-xs text-muted-foreground">
                  Issued: {new Date(issue.issue_date).toLocaleDateString()} · Due: {new Date(issue.due_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {issue.fine_amount > 0 && (
                  <span className="text-xs font-medium text-destructive">₹{issue.fine_amount}</span>
                )}
                <Badge variant={statusVariant(issue.status)} className="capitalize">{issue.status}</Badge>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
