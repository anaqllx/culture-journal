import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createCategory, updateCategory, getCategory } from "@/lib/categories";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Save, Sparkles, Star, MessageSquare, CheckCircle2, Loader2, ArrowLeft, Trash2 } from "lucide-react";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const CATEGORY_PALETTE = [
  { name: 'purple', color: 'text-purple-700', bg: 'bg-purple-100/90', textColor: 'text-purple-950' },
  { name: 'orange', color: 'text-orange-700', bg: 'bg-orange-100/90', textColor: 'text-orange-950' },
  { name: 'cyan', color: 'text-cyan-700', bg: 'bg-cyan-100/90', textColor: 'text-cyan-950' },
  { name: 'pink', color: 'text-pink-700', bg: 'bg-pink-100/90', textColor: 'text-pink-950' },
  { name: 'indigo', color: 'text-indigo-700', bg: 'bg-indigo-100/90', textColor: 'text-indigo-950' },
  { name: 'teal', color: 'text-teal-700', bg: 'bg-teal-100/90', textColor: 'text-teal-950' },
  { name: 'lime', color: 'text-lime-700', bg: 'bg-lime-100/90', textColor: 'text-lime-950' },
];

interface FeatureItemProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (val: boolean) => void;
}

export default function CustomCategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [categoryName, setCategoryName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [colorIndex, setColorIndex] = useState<number | null>(null);
  
  const [settings, setSettings] = useState({
    rating: true,
    comments: true,
    status: true,
  });

  useEffect(() => {
    const loadCategoryData = async () => {
      if (!id) return;
      
      try {
        setIsLoadingData(true);
        const categoryData = await getCategory(id);
        if (categoryData) {
          setCategoryName(categoryData.name);
          setSettings(categoryData.settings);
          if (categoryData.colorIndex !== undefined) {
            setColorIndex(categoryData.colorIndex);
          }
        } else {
          toast({ title: "Not found", description: "Category not found", variant: "destructive" });
          navigate("/library");
        }
      } catch (err) {
        console.error("Error loading category:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadCategoryData();
  }, [id, navigate, toast]);

  const handleDelete = async () => {
    if (!id) return;
    
    if (!window.confirm("Are you sure you want to delete this category? All entries in this category will lose their connection to it.")) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteDoc(doc(db, "categories", id));
      toast({ title: "Deleted", description: "Category has been removed." });
      navigate("/library");
    } catch (err) {
      console.error("Delete error:", err);
      toast({ title: "Error", description: "Could not delete category.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    const trimmedName = categoryName.trim();
    
    if (!trimmedName) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      toast({ title: "Authentication error", variant: "destructive" });
      return;
    }

    setIsSaving(true);

    try {
      const q = query(
        collection(db, "categories"), 
        where("user_id", "==", user.uid),
        where("name", "==", trimmedName)
      );
      const querySnapshot = await getDocs(q);
      const isDuplicate = querySnapshot.docs.some(doc => doc.id !== id);

      if (isDuplicate) {
        toast({ 
          title: "Category exists", 
          description: `You already have a category named "${trimmedName}".`, 
          variant: "destructive" 
        });
        setIsSaving(false);
        return;
      }

      const payload = {
        user_id: user.uid,
        name: trimmedName,
        settings: settings,
        colorIndex: colorIndex ?? Math.floor(Math.random() * CATEGORY_PALETTE.length),
      };

      if (id) {
        await updateCategory(id, payload);
        toast({ title: "Updated!", description: `Category "${trimmedName}" updated.` });
      } else {
        await createCategory({
          ...payload,
          createdAt: new Date().toISOString(),
        });
        toast({ title: "Success!", description: `Category "${trimmedName}" created.` });
      }

      navigate("/library");
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: "Failed to save category.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
        <p className="text-muted-foreground animate-pulse font-medium">Syncing with database...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-bold tracking-tight italic">
            {id ? "Edit Category" : "Category Designer"}
          </h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-chart-4" /> 
            {id ? "Modify your collection rules." : "Define your custom collection."}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {id && (
            <Button 
              variant="ghost" 
              onClick={handleDelete} 
              className="rounded-xl text-destructive hover:bg-destructive/10"
              disabled={isSaving}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete Category
            </Button>
          )}
          <Button variant="ghost" onClick={() => navigate("/library")} className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
      </div>

      <div className="bg-card p-10 rounded-[2.5rem] border border-border/40 shadow-sm space-y-8 relative overflow-hidden">
        <div className="space-y-4">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Category Name
          </Label>
          <Input 
            placeholder="e.g. Manga, Theater, Travel..." 
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="h-14 rounded-2xl bg-background/50 border-border/40 text-lg px-6 focus:ring-2 focus:ring-primary/20 transition-all"
            disabled={isSaving}
          />
        </div>

        <div className="space-y-6 pt-6 border-t border-border/40">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Features (On/Off)
          </Label>
          
          <div className="grid gap-4">
            <FeatureItem 
              icon={<Star className="w-5 h-5 text-chart-1" />}
              label="10-Point Rating" 
              description="Enable a 1-10 rating system for each entry."
              checked={settings.rating}
              onCheckedChange={(val) => setSettings({ ...settings, rating: val })}
            />
            <FeatureItem 
              icon={<MessageSquare className="w-5 h-5 text-chart-2" />}
              label="Personal Comments" 
              description="Add a comment section for your notes."
              checked={settings.comments}
              onCheckedChange={(val) => setSettings({ ...settings, comments: val })}
            />
            <FeatureItem 
              icon={<CheckCircle2 className="w-5 h-5 text-chart-3" />}
              label="Completion Status" 
              description="Track if items are finished or in progress."
              checked={settings.status}
              onCheckedChange={(val) => setSettings({ ...settings, status: val })}
            />
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all"
        >
          {isSaving ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" /> 
              {id ? "Update Category Structure" : "Save Category Structure"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function FeatureItem({ icon, label, description, checked, onCheckedChange }: FeatureItemProps) {
  return (
    <div className="flex items-center justify-between p-5 rounded-3xl bg-muted/20 border border-border/10 transition-colors hover:bg-muted/30 group">
      <div className="flex gap-4 items-center">
        <div className="p-3 rounded-2xl bg-background border border-border/10 shadow-sm group-hover:scale-105 transition-transform">
          {icon}
        </div>
        <div className="space-y-1">
          <p className="font-bold text-sm leading-none">{label}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
      <Switch 
        checked={checked} 
        onCheckedChange={onCheckedChange}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
}