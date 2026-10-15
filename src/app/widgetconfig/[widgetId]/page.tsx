
'use client';

import { useState, useMemo, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Star, 
  Eye,
  MessageSquare,
  Check,
  User,
  LayoutGrid,
  Play,
  CheckCircle2,
  Monitor,
  Terminal,
  Copy,
  Layout,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, updateDoc, collection, query, where } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ThemeToggle } from '@/components/theme-toggle';

type LayoutType = 'mural' | 'carousel' | 'grid' | 'popup';

const TestimonialCard = ({ t, themeColor, secondaryColor, index = 0, muralIndex = 0 }: { t: any, themeColor: string, secondaryColor: string, index?: number, muralIndex?: number }) => {
  const side = (index + muralIndex) % 2 === 0 ? 'left' : 'right';

  return (
    <Card 
      className={cn(
        "bg-background shadow-xl border-none text-left overflow-hidden p-4 transition-all duration-700",
        "border-t-4 animate-in duration-700 ease-out fill-both",
        side === 'left' ? "slide-in-from-left-full fade-in" : "slide-in-from-right-full fade-in"
      )} 
      style={{ 
        borderTopColor: themeColor,
        boxShadow: `0 10px 30px -15px ${themeColor}20`,
        backgroundColor: secondaryColor ? `${secondaryColor}15` : undefined
      }}
    >
      <div className="flex flex-col space-y-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-full" style={{ backgroundColor: secondaryColor ? `${secondaryColor}20` : `${themeColor}15` }}>
            <User className="w-3 h-3" style={{ color: themeColor }} />
          </div>
          <p className="font-bold text-[10px] truncate">{t.userName}</p>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: t.rating || 5 }).map((_, i) => (
            <Star key={i} className="fill-primary text-primary w-2.5 h-2.5" style={{ color: themeColor, fill: themeColor }} />
          ))}
        </div>
        <p className="italic text-[10px] line-clamp-3 text-foreground/80">"{t.text}"</p>
      </div>
    </Card>
  );
};

const EmbedSettings = ({ 
  layout, setLayout, 
  themeColor, setThemeColor,
  secondaryColor, setSecondaryColor
}: any) => {
  const colors = ['#f97316', '#D4AF37', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#e11d48', '#0d9488', '#7c3aed', '#475569', '#000000', '#ffffff'];
  
  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-background">
      <div className="p-4 border-b bg-muted/10 shrink-0">
        <Link href="/widgets" className="w-full">
          <Button variant="ghost" className="w-full justify-start gap-3 h-10 px-2 group">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Voltar</span>
          </Button>
        </Link>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-8 pb-10">
          <div className="space-y-4">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Formato do Mural</Label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'mural', icon: LayoutGrid, label: 'Mural lateral' },
                { id: 'carousel', icon: Play, label: 'Carrossel' },
                { id: 'grid', icon: Layout, label: 'Grade' },
                { id: 'popup', icon: MessageSquare, label: 'Popup Solo' },
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setLayout(item.id as LayoutType)} 
                  className={cn("flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all", layout === item.id ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/20")}
                >
                  <item.icon className={cn("w-4 h-4", layout === item.id ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("text-xs font-bold", layout === item.id ? "text-primary" : "text-foreground")}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6 pt-4 border-t">
            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cor do Tema</Label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button key={color} onClick={() => setThemeColor(color)} className={cn("w-7 h-7 rounded-full border-2 transition-transform", themeColor === color ? "border-foreground scale-110 shadow-sm" : "border-transparent opacity-80 shadow-inner")} style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-4 border-t">
            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cor Secundária</Label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button key={color} onClick={() => setSecondaryColor(color)} className={cn("w-7 h-7 rounded-full border-2 transition-transform", secondaryColor === color ? "border-foreground scale-110 shadow-sm" : "border-transparent opacity-80 shadow-inner")} style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default function EmbedEditorPage({ params }: { params: Promise<{ widgetId: string }> }) {
  const { widgetId } = use(params);
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const widgetRef = useMemo(() => (db && user ? doc(db, 'users', user.uid, 'widgets', widgetId) : null), [db, user, widgetId]);
  const { data: widgetData, loading: widgetLoading } = useDoc(widgetRef);

  const testimonialsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'testimonials'), where('status', '==', 'approved'));
  }, [db, user]);

  const { data: approvedTestimonials, loading: testimonialsLoading } = useCollection(testimonialsQuery);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [layout, setLayout] = useState<LayoutType>('mural');
  const [themeColor, setThemeColor] = useState('#f97316');
  const [secondaryColor, setSecondaryColor] = useState('#ffffff');
  const [isSaving, setIsSaving] = useState(false);
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  const [muralIndex, setMuralIndex] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') setBaseUrl(window.location.origin);
  }, []);

  useEffect(() => {
    if (widgetData) {
      setSelectedIds(widgetData.selectedTestimonialIds || []);
      setLayout(widgetData.layout || 'mural');
      setThemeColor(widgetData.themeColor || '#f97316');
      setSecondaryColor(widgetData.secondaryColor || '#ffffff');
    }
  }, [widgetData]);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (layout === 'mural' && selectedIds.length > 0) {
      const interval = setInterval(() => setMuralIndex(prev => (prev + 1) % selectedIds.length), 6000);
      return () => clearInterval(interval);
    }
  }, [layout, selectedIds]);

  const currentSelection = useMemo(() => {
    return approvedTestimonials?.filter(t => selectedIds.includes(t.id)) || [];
  }, [approvedTestimonials, selectedIds]);

  const visibleTestimonials = useMemo(() => {
    if (layout !== 'mural' || currentSelection.length === 0) return currentSelection.slice(0, 4);
    const slice = [];
    const count = Math.min(4, currentSelection.length);
    for (let i = 0; i < count; i++) {
      const idx = (muralIndex + i) % currentSelection.length;
      slice.push(currentSelection[idx]);
    }
    return slice;
  }, [currentSelection, muralIndex, layout]);

  const handleSave = async () => {
    if (!widgetRef) return;
    setIsSaving(true);
    updateDoc(widgetRef, {
      selectedTestimonialIds: selectedIds,
      layout,
      themeColor,
      secondaryColor,
    }).then(() => {
      setIsSaving(false);
      setIsCodeDialogOpen(true);
    }).catch(() => setIsSaving(false));
  };

  const embedCode = `<script src="${baseUrl}/widget.js?id=${widgetId}&user=${user?.uid}" defer></script>`;

  if (authLoading || widgetLoading || testimonialsLoading) {
    return <div className="flex h-screen items-center justify-center bg-muted/30"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  }

  const sidebarProps = { layout, setLayout, themeColor, setThemeColor, secondaryColor, setSecondaryColor };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col font-body w-full">
      <header className="bg-background border-b h-20 flex items-center px-4 md:px-6 sticky top-0 z-[60] shadow-sm">
        <div className="flex items-center gap-3 flex-1">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/5 transition-all p-1">
                <Monitor className="h-8 w-8" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80 border-none">
              <SheetHeader className="sr-only">
                <SheetTitle>Configurações do Mural</SheetTitle>
              </SheetHeader>
              <EmbedSettings {...sidebarProps} />
            </SheetContent>
          </Sheet>
          <Link href="/widgets" className="hidden lg:block">
            <Button variant="ghost" size="icon" className="text-primary"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black uppercase tracking-tight truncate">{widgetData?.name || 'Mural Embed'}</h1>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          <Button onClick={handleSave} disabled={isSaving} className="shadow-lg h-10 px-6 font-bold">
            {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative w-full">
        <aside className="hidden lg:flex w-80 bg-background border-r flex-col shrink-0">
          <EmbedSettings {...sidebarProps} />
        </aside>

        <div className="flex-1 overflow-y-auto bg-muted/30 p-4 sm:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Eye className="w-4 h-4" /> Preview do Mural</h2>
            
            <div className="relative border shadow-xl bg-muted/20 p-8 rounded-[2rem] min-h-[400px] flex items-center justify-center ring-1 ring-primary/5">
              <div className="w-full max-w-2xl">
                {visibleTestimonials.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibleTestimonials.map((t: any, i) => (
                      <TestimonialCard key={`${t.id}-${muralIndex}-${i}`} t={t} themeColor={themeColor} secondaryColor={secondaryColor} index={i} muralIndex={muralIndex} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center opacity-30 italic text-sm">Selecione depoimentos abaixo para ativar o mural.</div>
                )}
              </div>
            </div>

            <div className="space-y-6 pt-12 border-t">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Conteúdo do Mural</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {approvedTestimonials?.map((t: any) => (
                  <div 
                    key={t.id} 
                    onClick={() => setSelectedIds(prev => prev.includes(t.id) ? prev.filter(i => i !== t.id) : [...prev, t.id])} 
                    className={cn(
                      "cursor-pointer transition-all rounded-xl border-2 p-4 bg-background", 
                      selectedIds.includes(t.id) ? "border-primary bg-primary/5 shadow-md" : "border-transparent shadow-sm hover:border-muted-foreground/10"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("mt-1 w-4 h-4 rounded-md border flex items-center justify-center shrink-0", selectedIds.includes(t.id) ? "bg-primary border-primary" : "border-muted-foreground/30")}>
                        {selectedIds.includes(t.id) && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-[11px] block truncate">{t.userName}</span>
                        <p className="text-[10px] text-muted-foreground italic line-clamp-1 mt-1">"{t.text}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader className="text-center">
            <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4 text-green-600"><CheckCircle2 className="w-8 h-8" /></div>
            <DialogTitle className="text-2xl font-black font-headline">Configuração Salva!</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Snippet de Instalação</Label>
            <div className="relative bg-muted/50 rounded-xl p-4 border border-primary/20">
              <pre className="text-[10px] font-mono text-foreground break-all whitespace-pre-wrap">{embedCode}</pre>
              <Button size="icon" variant="secondary" className="absolute top-2 right-2 h-8 w-8" onClick={() => { navigator.clipboard.writeText(embedCode); toast({ title: "Copiado!" }); }}><Copy className="h-4 w-4" /></Button>
            </div>
          </div>
          <DialogFooter><Button className="w-full font-black h-12" onClick={() => setIsCodeDialogOpen(false)}>Fechar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
