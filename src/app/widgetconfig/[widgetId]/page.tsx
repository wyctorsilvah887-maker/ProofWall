
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
  Zap,
  LayoutGrid,
  Play,
  CheckCircle2,
  Menu,
  Terminal,
  Copy,
  Layout
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

type LayoutType = 'mural' | 'carousel' | 'grid' | 'popup';

const TestimonialCard = ({ t, small = false, isPopup = false, themeColor, index = 0, layout = 'mural', muralIndex = 0, noAnim = false }: { t: any, small?: boolean, isPopup?: boolean, themeColor: string, index?: number, layout?: string, muralIndex?: number, noAnim?: boolean }) => {
  const slideSide = (index + muralIndex) % 2 === 0 ? 'left' : 'right';
  const slideClass = layout === 'mural' 
    ? (slideSide === 'left' ? "slide-in-from-left-full" : "slide-in-from-right-full") 
    : (isPopup ? "slide-in-from-bottom-8 fade-in zoom-in duration-700" : "fade-in zoom-in-95 slide-in-from-bottom-4");

  return (
    <Card 
      className={cn(
        "bg-background shadow-xl border-none text-left overflow-hidden transition-all duration-700",
        small ? "p-3" : "p-6",
        isPopup ? "max-w-full border-l-4" : "border-t-4",
        !noAnim && "animate-in duration-1000 ease-out",
        !noAnim && slideClass,
        small ? "mb-0" : "mb-4"
      )} 
      style={{ 
        borderTopColor: !isPopup ? themeColor : 'transparent', 
        borderLeftColor: isPopup ? themeColor : 'transparent',
        borderTopWidth: !isPopup ? '3px' : '0', 
        borderLeftWidth: isPopup ? '4px' : '0',
        animationDelay: isPopup || noAnim ? '0ms' : `${index * 100}ms`,
        animationFillMode: 'both',
        boxShadow: `0 10px 30px -15px ${themeColor}20`
      }}
    >
      <div className="flex flex-col space-y-2">
        <div className="flex items-start justify-between w-full gap-2">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-primary/10 p-1.5 rounded-full shrink-0" style={{ backgroundColor: `${themeColor}15` }}>
                <User className={cn(small ? "w-3 h-3" : "w-4 h-4")} style={{ color: themeColor }} />
              </div>
              <p className={cn("font-bold text-gray-900 leading-tight truncate", small ? "text-[10px]" : "text-xs")}>{t.userName}</p>
            </div>
            <div className={cn("flex gap-0.5", small ? "pl-6" : "pl-7")}>
              {Array.from({ length: t.rating || 5 }).map((_, i) => (
                <Star key={i} className={cn("fill-primary text-primary", small ? "w-2.5 h-2.5" : "w-2.5 h-2.5")} style={{ color: themeColor, fill: themeColor }} />
              ))}
            </div>
          </div>
        </div>
        <p className={cn("text-gray-700 italic leading-relaxed", small ? "text-[10px] line-clamp-3" : "text-sm")}>"{t.text}"</p>
      </div>
    </Card>
  );
};

const EmbedSettings = ({ 
  layout, setLayout, 
  themeColor, setThemeColor
}: any) => {
  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <div className="p-4 border-b bg-muted/10 shrink-0">
        <Link href="/widgets" className="w-full">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-primary transition-colors h-10 px-2 group">
            <div className="bg-muted p-1.5 rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em]">Voltar aos Widgets</span>
          </Button>
        </Link>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-8 pb-10">
          <div className="space-y-4">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tipo de Layout</Label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'mural', icon: LayoutGrid, label: 'Mural Masonry' },
                { id: 'carousel', icon: Play, label: 'Carrossel Slider' },
                { id: 'grid', icon: Layout, label: 'Grade Estática' },
                { id: 'popup', icon: MessageSquare, label: 'Notificação VIP' },
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setLayout(item.id as LayoutType)} 
                  className={cn("flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all", layout === item.id ? "border-primary bg-primary/5 shadow-sm" : "border-muted hover:border-muted-foreground/20")}
                >
                  <item.icon className={cn("w-4 h-4", layout === item.id ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("text-xs font-bold", layout === item.id ? "text-primary" : "text-foreground")}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Esquema de Cores</Label>
            <div className="flex flex-wrap gap-2">
              {['#f97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#000000'].map((color) => (
                <button key={color} onClick={() => setThemeColor(color)} className={cn("w-8 h-8 rounded-full border-2", themeColor === color ? "border-foreground" : "border-transparent")} style={{ backgroundColor: color }} />
              ))}
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

  const userDocRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: userData, loading: userDataLoading } = useDoc(userDocRef);

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
  const [isSaving, setIsSaving] = useState(false);
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  const [previewIndex, setPreviewIndex] = useState(0);
  const [muralIndex, setMuralIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (typeof window !== 'undefined') setBaseUrl(window.location.origin);
  }, []);

  useEffect(() => {
    if (widgetData) {
      setSelectedIds(widgetData.selectedTestimonialIds || []);
      setLayout(widgetData.layout || 'mural');
      setThemeColor(widgetData.themeColor || '#f97316');
    }
  }, [widgetData]);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  const selectedTestimonials = useMemo(() => {
    return approvedTestimonials?.filter(t => selectedIds.includes(t.id)) || [];
  }, [approvedTestimonials, selectedIds]);

  useEffect(() => {
    if (layout === 'popup' && selectedTestimonials.length > 1) {
      const interval = setInterval(() => {
        setPreviewIndex(prev => (prev + 1) % selectedTestimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }

    if (layout === 'mural' && selectedTestimonials.length > 0) {
      const interval = setInterval(() => {
        setMuralIndex(prev => (prev + 1) % selectedTestimonials.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [layout, selectedTestimonials]);

  // Autoplay for Carousel Preview
  useEffect(() => {
    if (!api || layout !== 'carousel') return;
    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [api, layout]);

  const visibleMuralTestimonials = useMemo(() => {
    if (layout !== 'mural' || selectedTestimonials.length === 0) return [];
    const slice = [];
    const countToShow = Math.min(4, selectedTestimonials.length);
    for (let i = 0; i < countToShow; i++) {
      const idx = (muralIndex + i) % selectedTestimonials.length;
      slice.push(selectedTestimonials[idx]);
    }
    return slice;
  }, [selectedTestimonials, muralIndex, layout]);

  const handleSave = async () => {
    if (!widgetRef) return;
    setIsSaving(true);
    updateDoc(widgetRef, {
      selectedTestimonialIds: selectedIds,
      layout,
      themeColor,
    })
      .then(() => {
        setIsSaving(false);
        setIsCodeDialogOpen(true);
      })
      .catch(() => setIsSaving(false));
  };

  const toggleTestimonial = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const embedCode = `<script src="${baseUrl}/widget.js?id=${widgetId}&user=${user?.uid}" defer></script>`;

  if (authLoading || widgetLoading || testimonialsLoading || userDataLoading) {
    return <div className="flex h-screen items-center justify-center bg-muted/30"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col font-body overflow-x-hidden w-full">
      <header className="bg-background border-b h-20 flex items-center px-4 md:px-6 sticky top-0 z-[60] shadow-sm w-full">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <Link href="/widgets" className="hidden sm:block">
            <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/5">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden text-primary shrink-0"><Menu className="h-6 w-6" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px] sm:w-80 flex flex-col">
              <SheetHeader className="px-4 pt-6 text-left sr-only">
                <SheetTitle>Editor de Mural Embutido</SheetTitle>
              </SheetHeader>
              <div className="flex-1 min-h-0"><EmbedSettings layout={layout} setLayout={setLayout} themeColor={themeColor} setThemeColor={setThemeColor} /></div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Terminal className="w-5 h-5 sm:w-6 sm:h-6 text-primary hidden xs:block" />
            <div className="flex flex-col min-w-0">
              <h1 className="text-xs sm:text-sm font-bold tracking-tight truncate max-w-[120px] sm:max-w-[200px]">{widgetData?.name}</h1>
              <span className="text-[8px] sm:text-[10px] text-muted-foreground uppercase font-black">Editor de Mural</span>
            </div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <Button onClick={handleSave} disabled={isSaving} className="shadow-lg font-bold text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4">
            {isSaving ? <Loader2 className="animate-spin mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> : <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />}
            <span className="hidden xs:inline">Salvar Código</span>
            <span className="xs:hidden">Salvar</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-x-hidden w-full">
        <aside className="hidden lg:flex w-80 bg-background border-r flex-col shrink-0">
          <EmbedSettings layout={layout} setLayout={setLayout} themeColor={themeColor} setThemeColor={setThemeColor} />
        </aside>

        <div className="flex-1 overflow-y-auto bg-muted/30 p-4 md:p-8 space-y-8 w-full max-w-full">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 w-full overflow-x-hidden">
            <h2 className="text-xs sm:text-sm font-bold font-headline flex items-center gap-2 text-muted-foreground"><Eye className="w-4 h-4" /> Simulação de Incorporação</h2>
            
            <div className="relative border-none shadow-xl bg-gradient-to-br from-primary/5 to-primary/10 p-6 sm:p-10 rounded-2xl sm:rounded-[2rem] min-h-[350px] sm:min-h-[400px] flex items-center justify-center w-full">
              <div className="w-full max-w-2xl px-2">
                {selectedTestimonials.length > 0 ? (
                  <div className="w-full transition-all duration-700 overflow-x-hidden">
                    {layout === 'mural' ? (
                      <div key={muralIndex} className="columns-1 sm:columns-2 gap-3 sm:gap-4 w-full">
                        {visibleMuralTestimonials.map((t: any, i) => (
                          <div key={t.id + muralIndex} className="break-inside-avoid">
                            <TestimonialCard t={t} small themeColor={themeColor} index={i} layout={layout} muralIndex={muralIndex} />
                          </div>
                        ))}
                      </div>
                    ) : layout === 'carousel' ? (
                      <div className="max-w-full sm:max-w-md mx-auto">
                        <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
                          <CarouselContent>
                            {selectedTestimonials.map((t: any) => (
                              <CarouselItem key={t.id}>
                                <TestimonialCard t={t} small themeColor={themeColor} noAnim layout={layout} />
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                        </Carousel>
                      </div>
                    ) : layout === 'popup' ? (
                      <div className="max-w-full sm:max-w-md mx-auto" key={selectedTestimonials[previewIndex]?.id}>
                        <TestimonialCard 
                          t={selectedTestimonials[previewIndex]} 
                          small 
                          themeColor={themeColor} 
                          isPopup={true} 
                          layout={layout}
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {selectedTestimonials.slice(0, 4).map((t: any, i) => (
                          <div key={t.id} className="break-inside-avoid">
                            <TestimonialCard t={t} small themeColor={themeColor} index={i} layout={layout} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center opacity-20"><MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 mx-auto" /><p className="text-[8px] sm:text-[10px] font-bold uppercase mt-2">Selecione depoimentos abaixo</p></div>
                )}
              </div>
              <div className="absolute top-3 right-4 text-[7px] sm:text-[8px] font-mono text-muted-foreground uppercase">Embed Preview</div>
            </div>

            <div className="space-y-4 pt-4 border-t w-full">
              <h2 className="text-xs sm:text-sm font-bold font-headline flex items-center gap-2 text-muted-foreground"><MessageSquare className="w-4 h-4" /> Escolher Depoimentos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                {approvedTestimonials?.map((t: any) => (
                  <div key={t.id} onClick={() => toggleTestimonial(t.id)} className={cn("cursor-pointer transition-all rounded-xl border-2 p-3 sm:p-4 bg-background w-full", selectedIds.includes(t.id) ? "border-primary bg-primary/5 shadow-md" : "border-transparent shadow-sm hover:border-muted-foreground/10")}>
                    <div className="flex items-start gap-3 w-full">
                      <div className={cn("mt-1 w-4 h-4 rounded-md border flex items-center justify-center shrink-0", selectedIds.includes(t.id) ? "bg-primary border-primary" : "border-muted-foreground/30")}>
                        {selectedIds.includes(t.id) && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-[10px] sm:text-xs block truncate">{t.userName}</span>
                        <p className="text-[8px] sm:text-[10px] text-muted-foreground italic line-clamp-1 mt-0.5">"{t.text}"</p>
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
        <DialogContent className="w-[90vw] max-w-xl rounded-2xl">
          <DialogHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4"><CheckCircle2 className="w-8 h-8 text-primary" /></div>
            <DialogTitle className="text-xl sm:text-2xl font-headline">Mural Embutido Salvo!</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">As alterações de layout e cores já estão ativas no seu site via código de incorporação.</DialogDescription>
          </DialogHeader>
          <div className="py-4 w-full">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Seu Código de Incorporação</Label>
            <div className="relative bg-muted/50 rounded-lg p-3 sm:p-4 border border-primary/20 w-full overflow-hidden">
              <pre className="text-[9px] sm:text-[10px] font-mono text-gray-800 break-all whitespace-pre-wrap">{embedCode}</pre>
              <Button size="icon" variant="secondary" className="absolute top-1 sm:top-2 right-1 sm:right-2 h-7 w-7 sm:h-8 sm:w-8" onClick={() => { navigator.clipboard.writeText(embedCode); toast({ title: "Código Copiado!" }); }}><Copy className="h-4 w-4" /></Button>
            </div>
          </div>
          <DialogFooter><Button className="w-full font-bold h-11 sm:h-12" onClick={() => setIsCodeDialogOpen(false)}>Entendido</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

