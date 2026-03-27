import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import EntryForm from '@/components/EntryForm';
import { ThemeToggle } from './ThemeToggle';
import {
  BookOpen, LayoutDashboard, Library, BarChart3, LogOut, Plus, Menu, X, Settings2
} from 'lucide-react';

// Додаємо новий пункт навігації для кастомних категорій
const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/library', label: 'Library', icon: Library },
  { to: '/stats', label: 'Stats', icon: BarChart3 },
  { to: '/custom-category', label: 'Add Category', icon: Settings2 }, // Пункт для конструктора
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { logout: signOut, user } = useAuth();
  const location = useLocation();
  const [addOpen, setAddOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background transition-colors duration-300">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 border-r border-border/60 bg-card py-6 px-4 gap-2">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-foreground text-lg whitespace-nowrap">Cultural Journal</span>
        </div>

        {/* Add Entry button */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2 mb-2 rounded-xl shadow-sm">
              <Plus className="w-4 h-4" /> Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">New Entry</DialogTitle>
            </DialogHeader>
            <EntryForm onSuccess={() => setAddOpen(false)} onCancel={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Theme & User section */}
        <div className="border-t border-border/60 pt-4 mt-2 space-y-2">
          <div className="flex items-center justify-between px-3 mb-2">
             <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Appearance</span>
             <ThemeToggle />
          </div>
          
          <div className="px-3">
            <p className="text-xs text-muted-foreground truncate font-medium">{user?.email}</p>
          </div>

          <button
            onClick={signOut}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all w-full"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-b border-border/60 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-foreground">Cultural Journal</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 rounded-lg h-8 ml-1">
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">New Entry</DialogTitle>
              </DialogHeader>
              <EntryForm onSuccess={() => setAddOpen(false)} onCancel={() => setAddOpen(false)} />
            </DialogContent>
          </Dialog>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1.5 ml-1 rounded-lg hover:bg-muted text-foreground">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background pt-14 animate-fade-in">
          <nav className="p-4 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" /> {label}
                </Link>
              );
            })}
            <button
              onClick={signOut}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-destructive hover:bg-destructive/10 transition-all w-full mt-4"
            >
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-background text-foreground">
        <div className="md:pt-0 pt-14">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}