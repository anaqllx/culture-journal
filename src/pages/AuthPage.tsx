import { useState } from 'react';
import { auth } from '@/lib/firebase'; 
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ 
        title: 'Вітаємо!', 
        description: 'Ви успішно увійшли до свого щоденника' 
      });
    } catch (err: any) {
      console.error(err);
      toast({ 
        title: 'Помилка', 
        description: 'Не вдалося увійти через Google. Спробуйте ще раз.', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-warm flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        
        {/* Секція Логотипу */}
        <div className="mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary mb-6 shadow-card">
            <BookOpen className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Culture-Chat</h1>
          <p className="text-muted-foreground text-lg font-medium">Твій персональний культурний щоденник</p>
        </div>

        {/* Секція Дії */}
        <div className="gradient-card rounded-3xl shadow-card p-10 animate-fade-in border border-border/50">
          <p className="text-sm text-muted-foreground mb-8">
            Зберігайте свої враження від книг, ігор та фільмів в одному місці
          </p>
          
          <Button 
            type="button" 
            variant="outline" 
            size="lg"
            className="w-full py-7 flex gap-3 items-center justify-center text-base hover:bg-background transition-all shadow-soft border-border/60 group" 
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Продовжити з Google
              </>
            )}
          </Button>

          <div className="mt-8 pt-6 border-t border-border/40">
            <p className="text-xs text-muted-foreground italic">
              "Культура — це те, що залишається, коли все інше забуто" 📖
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}