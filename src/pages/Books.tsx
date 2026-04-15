import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, BookOpen, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Database } from '@/integrations/supabase/types';

type Book = Database['public']['Tables']['books']['Row'];

const CATEGORIES = ['General', 'Programming', 'Data Structures', 'Algorithms', 'Networking', 'Database', 'AI/ML', 'Operating Systems', 'Web Development', 'Cybersecurity'];

export default function Books() {
  const { isStaff } = useAuthStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', author: '', isbn: '', category: 'General', total_copies: 1, publisher: '', shelf_location: '', description: '' });

  const fetchBooks = async () => {
    let query = supabase.from('books').select('*').order('title');
    if (search) query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%,isbn.ilike.%${search}%`);
    if (category !== 'all') query = query.eq('category', category);
    const { data } = await query;
    setBooks(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBooks(); }, [search, category]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('books').insert({
      ...form,
      available_copies: form.total_copies,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Book added!');
    setDialogOpen(false);
    setForm({ title: '', author: '', isbn: '', category: 'General', total_copies: 1, publisher: '', shelf_location: '', description: '' });
    fetchBooks();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-bold">Book Catalog</h1>
          <p className="text-muted-foreground text-sm">{books.length} books in the collection</p>
        </motion.div>

        {isStaff() && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 w-4 h-4" />Add Book</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Book</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Title *</Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Author *</Label>
                    <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>ISBN</Label>
                    <Input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Copies</Label>
                    <Input type="number" min={1} value={form.total_copies} onChange={(e) => setForm({ ...form, total_copies: parseInt(e.target.value) || 1 })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Publisher</Label>
                    <Input value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Shelf Location</Label>
                    <Input value={form.shelf_location} onChange={(e) => setForm({ ...form, shelf_location: e.target.value })} />
                  </div>
                </div>
                <Button type="submit" className="w-full">Add Book</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by title, author, or ISBN..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      ) : books.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No books found</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {books.map((book, i) => (
              <motion.div
                key={book.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card-hover p-5 flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-14 rounded bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${book.available_copies > 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    {book.available_copies > 0 ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{book.author}</p>
                <div className="mt-auto pt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="bg-muted px-2 py-0.5 rounded">{book.category}</span>
                  <span>{book.available_copies}/{book.total_copies} copies</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
