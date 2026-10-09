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
  Monitor,
  CheckCircle2,
  Menu,
  Copy,
  ExternalLink,
  Link2,
  Image as ImageIcon,
  MessageCircle,
  Layout,
  LayoutGrid,
  Play,
  Upload,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, updateDoc, collection, query, where } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const TestimonialCard = ({ t, themeColor, isPopup = false, index = 0, layout = 'mural', muralIndex = 0, noAnim = false }: { t: any, themeColor: string, isPopup?: boolean, index?: number, layout?: string, muralIndex?: number, noAnim?: boolean }) => {
  const slideSide = (index + muralIndex) % 2 === 0 ? 'left' : 'right';
  const slideClass = layout === 'mural' 
    ? (slideSide === 'left' ? "slide-in-from-left-full" : "slide-in-from-right-full") 
    : (isPopup ? "slide-in-from-bottom-8 fade-in zoom-in duration-700" : "fade-in zoom-in-95 slide-in-from-bottom-4");

  return (
    <Card 
      className={cn(
        "bg-background shadow-lg border-none text-left overflow-hidden transition-all duration-700",
        "p-3",
        isPopup ? "max-w-full border-l-4" : "border-t-4",
        !noAnim && "animate-in duration-1000 ease-out",
        !noAnim && slideClass,
        "mb-0"
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
              <div className="bg-primary/5 p-1 rounded-full shrink-0" style={{ backgroundColor: `${themeColor}10` }}>
                <User className="w-3 h-3" style={{ color: themeColor }} />
              </div>
              <p className="font-bold text-gray-900 leading-tight truncate text-[10px]">{t.userName}</p>
            </div>
            <div className="flex gap-0.5 pl-6">
              {Array.from({ length: t.rating || 5 }).map((_, i) => (
                <Star key={i} className="fill-primary text-primary w-2.5 h-2.5" style={{ color: themeColor, fill: themeColor }} />
              ))}
            </div>
          </div>
        </div>
        <p className="text-gray-700 italic leading-relaxed text-[10px] line-clamp-3">"{t.text}"</p>
      </div>
    </Card>
  );
};

const PublicPageSettings = ({ 
  widgetName, setWidgetName,
  themeColor, setThemeColor,
  whatsappEnabled, setWhatsappEnabled,
  whatsappNumber, setWhatsappNumber,
  externalSiteUrl, setExternalSiteUrl,
  layout, setLayout
}: any) => {
  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <div className="p-4 border-b bg-muted/10 shrink-0">
        <div className="flex items-center gap-2 w-full">
          <Link href="/widgets" className="flex-1">
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-primary transition-colors h-10 px-2 group">
              <div className="bg-muted p-1.5 rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em]">Voltar</span>
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="geral" className="w-full flex-1 flex flex-col min-h-0">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-12 px-2 shrink-0 overflow-x-auto no-scrollbar">
          <TabsTrigger value="geral" className="text-xs shrink-0">Identidade</TabsTrigger>
          <TabsTrigger value="design" className="text-xs shrink-0">Layout</TabsTrigger>
          <TabsTrigger value="social" className="text-xs shrink-0">Social</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6 pb-10">
            <TabsContent value="geral" className="mt-0 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Título da Página</Label>
                <Input value={widgetName} onChange={(e) => setWidgetName(e.target.value)} placeholder="Ex: Nossos Elogios" />
              </div>
              
              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Imagem de Capa</Label>
                <div className="relative group">
                  <div className="border-2 border-dashed border-muted-foreground/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 bg-muted/5 opacity-60 cursor-not-allowed transition-all">
                    <div className="bg-background p-3 rounded-full shadow-sm">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fazer Upload</p>
                      <p className="text-[9px] font-bold text-primary mt-1 animate-pulse">EM BREVE</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cor de Destaque</Label>
                <div className="flex flex-wrap gap-2">
                  {['#f97316', '#D4AF37', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#e11d48', '#0d9488', '#7c3aed', '#475569', '#000000'].map((color) => (
                    <button key={color} onClick={() => setThemeColor(color)} className={cn("w-7 h-7 rounded-full border-2", themeColor === color ? "border-foreground" : "border-transparent")} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="design" className="mt-0 space-y-6">
              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Estilo da Página</Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'mural', icon: LayoutGrid, label: 'Mural Masonry' },
                    { id: 'carousel', icon: Play, label: 'Carrossel' },
                    { id: 'grid', icon: Layout, label: 'Grade (Grid)' },
                    { id: 'popup', icon: MessageSquare, label: 'Notificação' },
                  ].map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => setLayout(item.id as LayoutType)} 
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all",
                        layout === item.id ? "border-primary bg-primary/5 shadow-sm" : "border-muted hover:border-muted-foreground/20"
                      )}
                    >
                      <item.icon className={cn("w-4 h-4", layout === item.id ? "text-primary" : "text-muted-foreground")} />
                      <span className={cn("text-xs font-bold", layout === item.id ? "text-primary" : "text-foreground")}>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="social" className="mt-0 space-y-6">
              <div className="flex items-center justify-between p-3 border rounded-xl bg-muted/10">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold">Botão de WhatsApp</Label>
                  <p className="text-[10px] text-muted-foreground">Ativar botão flutuante</p>
                </div>
                <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
              </div>
              {whatsappEnabled && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Número do WhatsApp</Label>
                  <Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="Ex: 5511999999999" />
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Link do seu Site Externo</Label>
                <Input value={externalSiteUrl} onChange={(e) => setExternalSiteUrl(e.target.value)} placeholder="https://meusite.com.br" />
              </div>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default function PublicPageEditorPage({ params }: { params: Promise<{ widgetId: string }> }) {
  const { widgetId } = use(params);
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const userDocRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: userData, loading: userDataLoading } = useDoc(userDocRef);

  const widgetRef = useMemo(() => (db && user ? doc(db, 'users', user.uid, 'widgets', widgetId) : null), [db, user, widgetId]);
  const { data: widgetData, loading: widgetLoading } = useDoc(widgetRef);

  const widgetsQuery = useMemo(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'widgets');
  }, [db, user]);

  const { data: allWidgets, loading: allWidgetsLoading } = useCollection(widgetsQuery);

  const testimonialsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'testimonials'), where('status', '==', 'approved'));
  }, [db, user]);

  const { data: approvedTestimonials, loading: testimonialsLoading } = useCollection(testimonialsQuery);

  const [widgetName, setWidgetName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [themeColor, setThemeColor] = useState('#f97316');
  const [layout, setLayout] = useState<LayoutType>('mural');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [externalSiteUrl, setExternalSiteUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  const [previewIndex, setPreviewIndex] = useState(0);
  const [muralIndex, setMuralIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (typeof window !== 'undefined') setBaseUrl(window.location.origin);
  }, []);

  useEffect(() => {
    if (widgetData) {
      setWidgetName(widgetData.name || '');
      setSelectedIds(widgetData.selectedTestimonialIds || []);
      setThemeColor(widgetData.themeColor || '#f97316');
      setLayout(widgetData.layout || 'mural');
      setCoverImageUrl(widgetData.coverImageUrl || '');
      setWhatsappEnabled(widgetData.whatsappEnabled || false);
      setWhatsappNumber(widgetData.whatsappNumber || '');
      setExternalSiteUrl(widgetData.externalSiteUrl || '');
    }
  }, [widgetData]);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  const selectedTestimonials = useMemo(() => {
    return approvedTestimonials?.filter(t => selectedIds.includes(t.id)) || [];
  }, [approvedTestimonials, selectedIds]);

  const takenIds = useMemo(() => {
    if (!allWidgets) return new Set<string>();
    const ids = new Set<string>();
    allWidgets.forEach((w: any) => {
      if (w.id !== widgetId && w.selectedTestimonialIds) {
        w.selectedTestimonialIds.forEach((id: string) => ids.add(id));
      }
    });
    return ids;
  }, [allWidgets, widgetId]);

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
    if (!widgetRef || !widgetName.trim()) return;
    setIsSaving(true);
    const updates = {
      name: widgetName.trim(),
      selectedTestimonialIds: selectedIds,
      themeColor,
      layout,
      coverImageUrl,
      whatsappEnabled,
      whatsappNumber,
      externalSiteUrl,
    };
    updateDoc(widgetRef, updates)
      .then(() => {
        setIsSaving(false);
        setIsLinkDialogOpen(true);
      })
      .catch(() => setIsSaving(false));
  };

  const toggleTestimonial = (id: string) => {
    if (takenIds.has(id)) {
      toast({
        variant: "destructive",
        title: "Feedback Indisponível",
        description: "Este depoimento já está sendo usado em outro widget.",
      });
      return;
    }
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const companySlug = userData?.companySlug || '';
  const publicPageLink = `${baseUrl}/pp/${companySlug}/${widgetId}`;

  if (authLoading || widgetLoading || testimonialsLoading || userDataLoading || allWidgetsLoading) {
    return <div className="flex h-screen items-center justify-center bg-muted/30"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  }

  const settingsProps = {
    widgetName, setWidgetName,
    themeColor, setThemeColor,
    whatsappEnabled, setWhatsappEnabled,
    whatsappNumber, setWhatsappNumber,
    externalSiteUrl, setExternalSiteUrl,
    layout, setLayout
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col font-body overflow-x-hidden w-full">
      <header className="bg-background border-b h-20 flex items-center px-4 md:px-6 sticky top-0 z-[60] shadow-sm w-full">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <Link href="/widgets" className="hidden sm:block shrink-0">
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
                <SheetTitle>Editor da Página</SheetTitle>
              </SheetHeader>
              <div className="flex-1 min-h-0"><PublicPageSettings {...settingsProps} /></div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Monitor className="w-5 h-5 sm:w-6 sm:h-6 text-primary hidden xs:block shrink-0" />
            <div className="flex flex-col min-w-0">
              <h1 className="text-xs sm:text-sm font-bold tracking-tight truncate max-w-[100px] sm:max-w-[200px]">{widgetName || 'Página Pública'}</h1>
              <span className="text-[8px] sm:text-[10px] text-muted-foreground uppercase font-black">Editor de Página VIP</span>
            </div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <Button onClick={handleSave} disabled={isSaving} className="shadow-lg font-bold text-[10px] sm:text-sm h-9 sm:h-10 px-3 sm:px-4">
            {isSaving ? <Loader2 className="animate-spin mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> : <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />}
            <span className="hidden xs:inline">Salvar Página</span>
            <span className="xs:hidden">Salvar</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-x-hidden relative w-full">
        <aside className="hidden lg:flex w-80 bg-background border-r flex-col shrink-0">
          <PublicPageSettings {...settingsProps} />
        </aside>

        <div className="flex-1 overflow-y-auto bg-muted/30 p-3 sm:p-4 md:p-8 w-full max-w-full">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 w-full overflow-x-hidden">
            <div className="flex items-center justify-between gap-2 w-full">
              <h2 className="text-[10px] sm:text-sm font-bold font-headline flex items-center gap-2 text-muted-foreground"><Eye className="w-4 h-4 shrink-0" /> Prévia da Página VIP</h2>
              <a href={publicPageLink} target="_blank" rel="noopener noreferrer" className="text-[9px] sm:text-xs text-primary font-black uppercase tracking-widest hover:underline flex items-center gap-1 shrink-0">
                Abrir Link <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative border-none shadow-2xl bg-background rounded-2xl sm:rounded-[2.5rem] min-h-[400px] sm:min-h-[700px] flex flex-col overflow-hidden ring-1 ring-primary/5 w-full">
              {coverImageUrl ? (
                <div className="h-24 sm:h-64 w-full relative">
                  <img src={coverImageUrl} className="w-full h-full object-cover" alt="Capa" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                </div>
              ) : (
                <div className="h-24 sm:h-64 w-full bg-muted/20 flex flex-col items-center justify-center text-muted-foreground/20 gap-2">
                  <ImageIcon className="w-6 h-6 sm:w-16 sm:h-16" />
                  <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em]">Sem Capa</span>
                </div>
              )}
              
              <div className="p-4 sm:p-12 space-y-6 sm:space-y-12 flex-1 flex flex-col w-full">
                <div className="text-center space-y-2 sm:space-y-4 w-full">
                  <Badge variant="outline" className="text-[7px] sm:text-[10px] uppercase tracking-[0.2em] font-black py-0.5 sm:py-1 px-3 sm:px-4 border-primary/20 text-primary" style={{ borderColor: `${themeColor}40`, color: themeColor }}>Social Proof</Badge>
                  <h1 className="text-xl sm:text-6xl font-black tracking-tighter leading-tight break-words px-2" style={{ color: themeColor }}>{userData?.companyName}</h1>
                  <p className="text-muted-foreground font-medium text-xs sm:text-2xl max-w-xl mx-auto px-4">{widgetName}</p>
                </div>

                <div className="w-full max-w-3xl mx-auto px-2">
                  {selectedTestimonials.length > 0 ? (
                    layout === 'mural' ? (
                      <div key={muralIndex} className="columns-1 sm:columns-2 gap-3 sm:gap-4 transition-all duration-700">
                        {visibleMuralTestimonials.map((t: any, i) => (
                          <div key={t.id + muralIndex} className="break-inside-avoid">
                            <TestimonialCard t={t} themeColor={themeColor} index={i} layout={layout} muralIndex={muralIndex} />
                          </div>
                        ))}
                      </div>
                    ) : layout === 'carousel' ? (
                      <div className="w-full max-w-full sm:max-w-md mx-auto">
                        <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
                          <CarouselContent>
                            {selectedTestimonials.map((t: any, i) => (
                              <CarouselItem key={t.id}>
                                <TestimonialCard t={t} themeColor={themeColor} noAnim layout={layout} />
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                        </Carousel>
                      </div>
                    ) : layout === 'popup' ? (
                      <div className="max-w-full sm:max-w-md mx-auto px-2" key={selectedTestimonials[previewIndex]?.id}>
                        <TestimonialCard 
                          t={selectedTestimonials[previewIndex]} 
                          themeColor={themeColor} 
                          isPopup={true} 
                          layout={layout}
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {selectedTestimonials.slice(0, 4).map((t: any, i) => (
                          <TestimonialCard key={t.id} t={t} themeColor={themeColor} index={i} layout={layout} />
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="py-10 sm:py-20 text-center opacity-20 flex flex-col items-center gap-4">
                      <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12" />
                      <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Nenhum depoimento</p>
                    </div>
                  )}
                </div>
              </div>

              {whatsappEnabled && (
                <div className="absolute bottom-4 sm:bottom-10 right-4 sm:right-10 bg-green-500 p-2 sm:p-5 rounded-full text-white shadow-2xl animate-in zoom-in fade-in duration-700 z-10">
                  <MessageCircle className="w-5 h-5 sm:w-8 sm:h-8" />
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 w-2 h-2 rounded-full border-2 border-white animate-pulse" />
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 bg-background rounded-2xl border shadow-sm space-y-4 w-full">
              <div className="flex items-center gap-2 text-primary">
                <Link2 className="w-4 h-4 shrink-0" />
                <h3 className="text-[9px] sm:text-xs font-black uppercase tracking-widest">Link de Compartilhamento</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Input readOnly value={publicPageLink} className="bg-muted/30 border-primary/20 font-mono text-[9px] sm:text-[10px] h-10 flex-1 min-w-0" />
                <Button variant="secondary" className="h-10 px-4 sm:px-6 font-bold text-xs shrink-0" onClick={() => { navigator.clipboard.writeText(publicPageLink); toast({ title: "Copiado!" }); }}>
                  <Copy className="h-3 w-3 sm:mr-2 mr-1" /> Copiar
                </Button>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t w-full">
              <h2 className="text-[10px] sm:text-sm font-bold font-headline flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="w-4 h-4 shrink-0" /> Selecionar Depoimentos
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                {approvedTestimonials?.map((t: any) => {
                  const isTaken = takenIds.has(t.id);
                  return (
                    <div 
                      key={t.id} 
                      onClick={() => toggleTestimonial(t.id)} 
                      className={cn(
                        "cursor-pointer transition-all rounded-xl border-2 p-3 sm:p-4 bg-background w-full", 
                        selectedIds.includes(t.id) ? "border-primary bg-primary/5 shadow-md" : "border-transparent shadow-sm hover:border-muted-foreground/10",
                        isTaken && "opacity-50 cursor-not-allowed grayscale"
                      )}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className={cn("mt-1 w-4 h-4 rounded-md border flex items-center justify-center shrink-0", selectedIds.includes(t.id) ? "bg-primary border-primary" : "border-muted-foreground/30")}>
                          {selectedIds.includes(t.id) && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-[9px] sm:text-xs block truncate">{t.userName}</span>
                          <p className="text-[8px] sm:text-[10px] text-muted-foreground italic line-clamp-2 mt-1 leading-relaxed">"{t.text}"</p>
                          {isTaken && (
                            <div className="mt-2 flex items-center gap-1 text-[7px] font-bold text-destructive uppercase tracking-widest">
                              <Lock className="w-2.5 h-2.5" /> Já em uso em outro widget
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md rounded-2xl p-6 sm:p-8">
          <DialogHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4 sm:mb-6">
              <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-black font-headline tracking-tight">Página Publicada!</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm font-medium leading-relaxed mt-2">
              Suas alterações de design, links sociais e imagem de capa já estão no ar.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button className="w-full font-black h-12 text-sm shadow-xl" onClick={() => setIsLinkDialogOpen(false)}>Concluído</Button>
            <Button variant="ghost" className="w-full font-bold text-[9px] sm:text-[10px] uppercase tracking-widest" onClick={() => { window.open(publicPageLink, '_blank'); }}>Visualizar Link Real</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}