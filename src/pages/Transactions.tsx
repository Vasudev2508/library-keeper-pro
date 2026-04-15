import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Clock, CheckCircle2, AlertTriangle, RotateCcw, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function Transactions() {
  const { user, isStaff } = useAuthStore();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [borrowerEmail, setBorrowerEmail] = useState('');
  const [filter, setFilter] = useState<'all' | 'issued' | 'returned'>('all');

  const fetchIssues = async () => {
    let query = supabase.from('book_issues').select('*, books(title, author)').order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('status', filter);
    const { data } = await query;
    setIssues(data || []);
    setLoading(false);
  };

  const fetchAvailableBooks = async () => {
    const { data } = await supabase.from('books').select('id, title, author, available_copies').gt('available_copies', 0).order('title');
    setBooks(data || []);
  };

  useEffect(() => { fetchIssues(); }, [filter]);

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId) { toast.error('Select a book'); return; }

    // For staff: issue to borrower (using current user as demo)
    const { error } = await supabase.from('book_issues').insert({
      book_id: selectedBookId,
      user_id: user!.id,
      issued_by: user!.id,
      status: 'issued',
    });
    if (error) { toast.error(error.message); return; }

    // Decrement available copies
    const book = books.find(b => b.id === selectedBookId);
    if (book) {
      await supabase.from('books').update({ available_copies: book.available_copies - 1 }).eq('id', selectedBookId);
    }

    toast.success('Book issued successfully!');
    setIssueDialogOpen(false);
    setSelectedBookId('');
    fetchIssues();
  };

  const handleReturn = async (issue: any) => {
    const { error } = await supabase.from('book_issues').update({
      status: 'returned',
      return_date: new Date().toISOString(),
    }).eq('id', issue.id);
    if (error) { toast.error(error.message); return; }

    // Increment available copies
    await supabase.from('books').update({ available_copies: (issue.books as any)?.available_copies + 1 || 1 }).eq('id', issue.book_id);

    toast.success('Book returned!');
    fetchIssues();
  };

  const statusIcon = (status: string, dueDate: string) => {
    const isOverdue = status === 'issued' && new Date(dueDate) < new Date();
    if (isOverdue) return <AlertTriangle className="w-4 h-4 text-destructive" />;
    if (status === 'returned') return <CheckCircle2 className="w-4 h-4 text-success" />;
    return <Clock className="w-4 h-4 text-primary" />;
  };

  const getStatusLabel = (status: string, dueDate: string) => {
    if (status === 'issued' && new Date(dueDate) < new Date()) return 'overdue';
    return status;
  };

  const statusVariant = (label: string) => {
    switch (label) {
      case 'returned': return 'secondary' as const;
      case 'overdue': return 'destructive' as const;
      default: return 'default' as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground text-sm">
            {isStaff() ? 'All book issue and return records' : 'Your borrowing history'}
          </p>
        </motion.div>

        <div className="flex gap-2">
          {/* Filter */}
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="issued">Active</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
            </SelectContent>
          </Select>

          {/* Staff: Issue Book */}
          {isStaff() && (
            <Dialog open={issueDialogOpen} onOpenChange={(v) => { setIssueDialogOpen(v); if (v) fetchAvailableBooks(); }}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 mr-1.5" /> Issue Book</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Issue a Book</DialogTitle></DialogHeader>
                <form onSubmit={handleIssueBook} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Book</Label>
                    <Select value={selectedBookId} onValueChange={setSelectedBookId}>
                      <SelectTrigger><SelectValue placeholder="Choose a book..." /></SelectTrigger>
                      <SelectContent>
                        {books.map(b => (
                          <SelectItem key={b.id} value={b.id}>{b.title} ({b.available_copies} avail)</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">Issue Book</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : issues.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
          <ArrowLeftRight className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No transactions found</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue, i) => {
            const label = getStatusLabel(issue.status, issue.due_date);
            return (
              <motion.div key={issue.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className={`glass-card p-4 flex items-center gap-4 ${label === 'overdue' ? 'border-destructive/30' : ''}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${label === 'overdue' ? 'bg-destructive/10' : label === 'returned' ? 'bg-success/10' : 'bg-primary/10'}`}>
                  {statusIcon(issue.status, issue.due_date)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{issue.books?.title || 'Unknown Book'}</p>
                  <p className="text-xs text-muted-foreground">
                    Issued: {new Date(issue.issue_date).toLocaleDateString()} · Due: {new Date(issue.due_date).toLocaleDateString()}
                    {issue.return_date && ` · Returned: ${new Date(issue.return_date).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {issue.fine_amount > 0 && (
                    <span className="text-xs font-medium text-destructive">₹{issue.fine_amount}</span>
                  )}
                  <Badge variant={statusVariant(label)} className="capitalize">{label}</Badge>
                  {/* Staff can mark as returned */}
                  {isStaff() && issue.status === 'issued' && (
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleReturn(issue)}>
                      <RotateCcw className="w-3 h-3 mr-1" /> Return
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
