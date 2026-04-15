import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, BookOpen, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { Database } from '@/integrations/supabase/types';

type Book = Database['public']['Tables']['books']['Row'];

const CATEGORIES = ['General', 'Programming', 'Data Structures', 'Algorithms', 'Networking', 'Databases', 'Artificial Intelligence', 'Operating Systems', 'Software Engineering', 'Computer Architecture', 'Compilers'];

export default function Books() {
  const { isStaff, hasRole } = useAuthStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [viewBook, setViewBook] = useState<Book | null>(null);
  const [form, setForm] = useState({ title: '', author: '', isbn: '', category: 'General', total_copies: 1, publisher: '', shelf_location: '', description: '', edition: '', published_year: '' });

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
    const payload = {
      title: form.title,
      author: form.author,
      isbn: form.isbn || null,
      category: form.category,
      total_copies: form.total_copies,
      available_copies: form.total_copies,
      publisher: form.publisher || null,
      shelf_location: form.shelf_location || null,
      description: form.description || null,
      edition: form.edition || null,
      published_year: form.published_year ? parseInt(form.published_year) : null,
    };

    if (editBook) {
      const { error } = await supabase.from('books').update(payload).eq('id', editBook.id);
      if (error) { toast.error(error.message); return; }
      toast.success('Book updated!');
    } else {
      const { error } = await supabase.from('books').insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success('Book added!');
    }
    setDialogOpen(false);
    setEditBook(null);
    resetForm();
    fetchBooks();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this book?')) return;
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Book deleted');
    fetchBooks();
  };

  const openEdit = (book: Book) => {
    setEditBook(book);
    setForm({
      title: book.title, author: book.author, isbn: book.isbn || '', category: book.category,
      total_copies: book.total_copies, publisher: book.publisher || '', shelf_location: book.shelf_location || '',
      description: book.description || '', edition: book.edition || '', published_year: book.published_year?.toString() || '',
    });
    setDialogOpen(true);
  };

  const resetForm = () => setForm({ title: '', author: '', isbn: '', category: 'General', total_copies: 1, publisher: '', shelf_location: '', description: '', edition: '', published_year: '' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-bold">Book Catalog</h1>
          <p className="text-muted-foreground text-sm">{books.length} books in the collection</p>
        </motion.div>

        {isStaff() && (
          <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) { setEditBook(null); resetForm(); } }}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 w-4 h-4" />Add Book</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
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
                      <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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
                    <Label>Edition</Label>
                    <Input value={form.edition} onChange={(e) => setForm({ ...form, edition: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input type="number" value={form.published_year} onChange={(e) => setForm({ ...form, published_year: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Shelf Location</Label>
                    <Input value={form.shelf_location} onChange={(e) => setForm({ ...form, shelf_location: e.target.value })} />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Description</Label>
                    <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                </div>
                <Button type="submit" className="w-full">{editBook ? 'Update Book' : 'Add Book'}</Button>
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
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
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
                key={book.id} layout
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
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
                {book.edition && <p className="text-xs text-muted-foreground">{book.edition} Edition · {book.published_year}</p>}
                <div className="mt-auto pt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">{book.category}</Badge>
                  <span>{book.available_copies}/{book.total_copies} copies</span>
                </div>
                {book.shelf_location && <p className="text-xs text-muted-foreground mt-1">📍 {book.shelf_location}</p>}

                {/* Role-based actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
                  <Button size="sm" variant="ghost" className="flex-1 h-7 text-xs" onClick={() => setViewBook(book)}>
                    <Eye className="w-3 h-3 mr-1" /> Details
                  </Button>
                  {isStaff() && (
                    <>
                      <Button size="sm" variant="ghost" className="flex-1 h-7 text-xs" onClick={() => openEdit(book)}>
                        <Edit className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      {hasRole('admin') && (
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(book.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={!!viewBook} onOpenChange={(v) => !v && setViewBook(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{viewBook?.title}</DialogTitle></DialogHeader>
          {viewBook && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Author:</span> <span className="font-medium">{viewBook.author}</span></div>
                <div><span className="text-muted-foreground">ISBN:</span> <span className="font-medium">{viewBook.isbn || 'N/A'}</span></div>
                <div><span className="text-muted-foreground">Publisher:</span> <span className="font-medium">{viewBook.publisher || 'N/A'}</span></div>
                <div><span className="text-muted-foreground">Edition:</span> <span className="font-medium">{viewBook.edition || 'N/A'}</span></div>
                <div><span className="text-muted-foreground">Year:</span> <span className="font-medium">{viewBook.published_year || 'N/A'}</span></div>
                <div><span className="text-muted-foreground">Category:</span> <Badge variant="secondary">{viewBook.category}</Badge></div>
                <div><span className="text-muted-foreground">Shelf:</span> <span className="font-medium">{viewBook.shelf_location || 'N/A'}</span></div>
                <div><span className="text-muted-foreground">Copies:</span> <span className="font-medium">{viewBook.available_copies}/{viewBook.total_copies}</span></div>
              </div>
              {viewBook.description && <p className="text-muted-foreground">{viewBook.description}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
