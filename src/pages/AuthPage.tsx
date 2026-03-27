import { useState } from 'react';
import { auth } from '@/lib/firebase'; 
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Film, Gamepad2, Music, Sparkles, ArrowRight, Quote, Loader2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ 
        title: 'Welcome!', 
        description: 'Successfully logged into your journal.' 
      });

      navigate("/dashboard");

    } catch (err: any) {
      console.error(err);
      toast({ 
        title: 'Error', 
        description: 'Failed to sign in with Google. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10 overflow-x-hidden font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/70 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">Personal Culture Journal</span>
          </div>
          <Button 
            variant="ghost" 
            className="font-medium hover:bg-secondary rounded-full px-6"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full h-screen overflow-hidden flex items-center justify-center">
  {/* ВІДЕО-ШАР (Максимально простий) */}
  <video
  autoPlay
  muted
  loop
  playsInline
  className="absolute inset-0 w-full h-full object-cover z-0 opacity-80 dark:opacity-20 transition-opacity duration-1000"
  style={{ filter: 'brightness(0.7) contrast(1.1)' }} // Додає глибини та прибирає зайву яскравість
>
  <source src="/video_book.mp4" type="video/mp4" />
</video>

  {/* ТЕМНИЙ ФІЛЬТР (Тільки якщо відео з'явиться) */}
  <div className="absolute inset-0 bg-black/40 z-10" />

  {/* КОНТЕНТ (Z-20, щоб бути точно зверху) */}
  <div className="relative z-20 max-w-5xl mx-auto text-center px-6 text-white">
    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.85]">
      Every story <br />
      <span className="opacity-70 italic font-normal">leaves a mark.</span>
    </h1>
    
    <p className="max-w-2xl mx-auto text-lg md:text-xl mb-10 font-medium text-balance">
       Your personal cultural ecosystem, gathered in one sophisticated space. 
       Document every impression with ease.
    </p>
<div className="relative group animate-in fade-in slide-in-from-bottom-10 duration-1000">
  {/* Світле пульсуюче сяйво навколо */}
  <div className="absolute -inset-1.5 bg-white/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000 animate-glow-light"></div>
  
  <Button 
    size="lg" 
    className="relative px-12 py-9 text-xl rounded-full transition-all duration-500 bg-[#fdfaf5] hover:bg-[#fffcf7] text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] border border-white/50 group hover:scale-[1.03] active:scale-95 min-w-[320px] overflow-hidden"
    onClick={handleGoogleSignIn}
    disabled={loading}
  >
    {loading ? (
      <Loader2 className="w-6 h-6 animate-spin text-black" />
    ) : (
      <div className="flex items-center gap-3 relative z-10">
        <span className="font-bold tracking-tight uppercase text-sm md:text-base">
          Start Your Cultural Journey
        </span>
        <ArrowRight className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-3" />
      </div>
    )}

    {/* Блік, що пробігає по кнопці при наведенні */}
    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
  </Button>
</div>
  </div>
</section>

      {/* Features Grid */}
      <section className="py-24 px-6 relative bg-background">
  <div className="max-w-7xl mx-auto text-center mb-16">
    <h2 className="text-3xl font-bold tracking-tight mb-4 font-display">Infinite personalization</h2>
    <p className="text-muted-foreground max-w-xl mx-auto">
      Start with the essentials or create your own universe. Your archive grows as your interests expand.
    </p>
  </div>
  
  <div className="max-w-7xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
  {/* КНИГИ */}
  <FeatureBox 
    icon={<BookOpen />} 
    title="Literature" 
    color="bg-chart-1/10 text-chart-1" 
    action="Keep the soul of every chapter."
  />

  {/* КІНО */}
  <FeatureBox 
    icon={<Film />} 
    title="Cinema" 
    color="bg-chart-2/10 text-chart-2" 
    action="Frames that shaped your vision."
  />

  {/* ІГРИ */}
  <FeatureBox 
    icon={<Gamepad2 />} 
    title="Gaming" 
    color="bg-chart-3/10 text-chart-3" 
    action="Worlds lived, memories earned."
  />

  {/* МУЗИКА */}
  <FeatureBox 
    icon={<Music />} 
    title="Music" 
    color="bg-chart-4/10 text-chart-4" 
    action="The soundtrack of your life."
  />
      
      {/* КАРТКА-ПІДКАЗКА ПРО КАСТОМНІ КАТЕГОРІЇ */}
      <div className="p-8 rounded-[2.5rem] bg-secondary/30 border-2 border-dashed border-border hover:border-primary/30 transition-all group cursor-pointer flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-full bg-background flex items-center justify-center mb-6 border border-border group-hover:scale-110 transition-transform shadow-sm">
          <Plus className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold mb-2 font-display">Your own...</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Create custom categories for everything you love.
        </p>
      </div>
    </div>
  </div>
</section>

      {/* Quote Section */}
      <section className="py-32 px-6 text-center bg-secondary/30">
        <div className="max-w-3xl mx-auto space-y-8">
          <Quote className="w-12 h-12 text-primary/20 mx-auto" />
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground leading-snug italic px-4">
            "Culture is what remains when we have forgotten everything we learned."
          </h2>
          <div className="h-px w-20 bg-border mx-auto" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border text-center bg-background">
        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-medium">
          Personal Cultural Journal • 2026
        </p>
      </footer>
    </div>
  );
}

function FeatureBox({ icon, title, color, action }: { 
  icon: React.ReactNode, 
  title: string, 
  color: string, 
  action: string,
}) {
  return (
    <div className="p-8 rounded-[2.5rem] bg-card border border-border hover:border-primary/50 transition-all group cursor-default shadow-sm hover:shadow-md flex flex-col items-start text-left h-full">
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner`}>
        {icon}
      </div>
      <div className="mt-auto"> {/* Штовхаємо текст донизу для балансу */}
        <h3 className="text-xl font-bold font-display mb-3">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed italic">{action}</p>
      </div>
    </div>
  );
}