
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
  Play
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

const TestimonialCard = ({ t, themeColor, small = false, isPopup = false, index = 0, layout = 'mural', muralIndex = 0, noAnim = false }: { t: any, themeColor: string, small?: boolean, isPopup?: boolean, index?: number, layout?: string, muralIndex?: number, noAnim?: boolean }) => {
  const slideSide = (index + muralIndex) % 2 === 0 ? 'left' : 'right';
  const slideClass = layout === 'mural' 
    ? (slideSide === 'left' ? "slide-in-from-left-full" : "slide-in-from-right-full") 
    : (isPopup ? "slide-in-from-bottom-8 fade-in zoom-in duration-700" : "fade-in zoom-in-95 slide-in-from-bottom-4");

  return (
    <Card 
      className={cn(
        "bg-background shadow-lg border-none text-left overflow-hidden transition-all duration-700",
        small ? "p-3" : "p-6",
        isPopup ? "max-w-full sm:max-w-md border-l-4" : "border-t-4",
        !noAnim && "animate-in duration-1000 ease-out",
        !noAnim && slideClass,
        small ? "mb-0" : "mb-4"
      )} 
      style={{ 
        borderTopColor: !isPopup ? themeColor : 'transparent',
        borderLeftColor: isPopup ? themeColor : 'transparent',
        borderTopWidth: !isPopup ? '4px' : '0',
        borderLeftWidth: isPopup ? '4px' : '0',
        animationDelay: isPopup || noAnim ? '0ms' : `${index * 100}ms`,
        animationFillMode: 'both',
        boxShadow: `0 10px 30px -15px ${themeColor}20`
      }}
    >
      <div className="flex flex-col space-y-3">
        <div className="flex items-start justify-between w-full gap-2">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-primary/5 p-1 rounded-full shrink-0" style={{ backgroundColor: `${themeColor}10` }}>
                <User className={cn(small ? "w-3 h-3" : "w-4 h-4")} style={{ color: themeColor }} />
              </div>
              <p className={cn("font-bold text-gray-900 leading-tight truncate", small ? "text-[10px]" : "text-sm")}>{t.userName}</p>
            </div>
            <div className={cn("flex gap-0.5", small ? "pl-6" : "pl-7")}>
              {Array.from({ length: t.rating || 5 }).map((_, i) => (
                <Star key={i} className={cn("fill-primary text-primary", small ? "w-2.5 h-2.5" : "w-3 h-3")} style={{ color: themeColor, fill: themeColor }} />
              ))}
            </div>
          </div>
        </div>
        <p className={cn("text-gray-700 italic leading-relaxed", small ? "text-[10px] line-clamp-3" : "text-sm")}>"{t.text}"</p>
      </div>
    </Card>
  );
};

const PublicPageSettings = ({ 
  widgetName, setWidgetName,
  themeColor, setThemeColor,
  coverImageUrl, setCoverImageUrl,
  whatsappEnabled, setWhatsappEnabled,
  whatsappNumber, setWhatsappNumber,
  externalSiteUrl, setExternalSiteUrl,
  layout, setLayout
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

      <Tabs defaultValue="geral" className="w-full flex-1 flex flex-col min-h-0">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-12 px-2 shrink-0">
          <TabsTrigger value="geral" className="text-xs">Identidade</TabsTrigger>
          <TabsTrigger value="design" className="text-xs">Layout</TabsTrigger>
          <TabsTrigger value="social" className="text-xs">Social</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6 pb-10">
            <TabsContent value="geral" className="mt-0 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Título da Página</Label>
                <Input value={widgetName} onChange={(e) => setWidgetName(e.target.value)} placeholder="Ex: Nossos Elogios" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">URL da Imagem de Capa</Label>
                <Input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} placeholder="https://imagem.jpg" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cor de Destaque</Label>
                <div className="flex flex-wrap gap-2">
                  {['#f97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#000000'].map((color) => (
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
                    { id: 'popup', icon: MessageSquare, label: 'Notificação VIP' },
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
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const companySlug = userData?.companySlug || '';
  const publicPageLink = `${baseUrl}/pp/${companySlug}/${widgetId}`;

  if (authLoading || widgetLoading || testimonialsLoading || userDataLoading) {
    return <div className="flex h-screen items-center justify-center bg-muted/30"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  }

  const settingsProps = {
    widgetName, setWidgetName,
    themeColor, setThemeColor,
    coverImageUrl, setCoverImageUrl,
    whatsappEnabled, setWhatsappEnabled,
    whatsappNumber, setWhatsappNumber,
    externalSiteUrl, setExternalSiteUrl,
    layout, setLayout
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col font-body">
      <header className="bg-background border-b h-20 flex items-center px-4 md:px-6 sticky top-0 z-[60] shadow-sm">
        <div className="flex items-center gap-3 flex-1">
          <Link href="/widgets" className="hidden sm:block">
            <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/5">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden text-primary"><Menu className="h-6 w-6" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80 flex flex-col">
              <SheetHeader className="px-4 pt-6 text-left">
                <SheetTitle>Editor da Página VIP</SheetTitle>
              </SheetHeader>
              <div className="flex-1 min-h-0"><PublicPageSettings {...settingsProps} /></div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-3">
            <Monitor className="w-6 h-6 text-primary hidden sm:block" />
            <div className="flex flex-col">
              <h1 className="text-sm font-bold tracking-tight truncate max-w-[200px]">{widgetName || 'Página Pública'}</h1>
              <span className="text-[10px] text-muted-foreground uppercase font-black">Editor de Página VIP</span>
            </div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/widgets"><Button variant="ghost" size="sm" className="hidden sm:flex mr-2">Cancelar</Button></Link>
          <Button onClick={handleSave} disabled={isSaving} className="shadow-lg font-bold">
            {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="hidden lg:flex w-80 bg-background border-r flex-col">
          <PublicPageSettings {...settingsProps} />
        </aside>

        <div className="flex-1 overflow-y-auto bg-muted/30 p-4 md:p-8 space-y-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold font-headline flex items-center gap-2 text-muted-foreground"><Eye className="w-4 h-4" /> Prévia da Página</h2>
              <a href={publicPageLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                Ver Link Real <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative border-none shadow-2xl bg-background rounded-[2rem] min-h-[600px] flex flex-col overflow-hidden">
              {coverImageUrl ? (
                <div className="h-48 w-full relative">
                  <img src={coverImageUrl} className="w-full h-full object-cover" alt="Capa" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                </div>
              ) : (
                <div className="h-48 w-full bg-muted flex items-center justify-center text-muted-foreground/30">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
              
              <div className="p-8 space-y-8 flex-1">
                <div className="text-center space-y-2">
                  <h1 className="text-4xl font-black tracking-tighter" style={{ color: themeColor }}>{userData?.companyName}</h1>
                  <p className="text-muted-foreground font-medium text-xl">{widgetName}</p>
                </div>

                <div className="w-full">
                  {selectedTestimonials.length > 0 ? (
                    layout === 'mural' ? (
                      <div key={muralIndex} className="columns-1 sm:columns-2 gap-4 transition-all duration-700">
                        {visibleMuralTestimonials.map((t: any, i) => (
                          <div key={t.id + muralIndex} className="break-inside-avoid">
                            <TestimonialCard t={t} themeColor={themeColor} small index={i} layout={layout} muralIndex={muralIndex} />
                          </div>
                        ))}
                      </div>
                    ) : layout === 'carousel' ? (
                      <div className="w-full max-w-md mx-auto">
                        <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
                          <CarouselContent>
                            {selectedTestimonials.map((t: any, i) => (
                              <CarouselItem key={t.id}>
                                <TestimonialCard t={t} themeColor={themeColor} small noAnim layout={layout} />
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                        </Carousel>
                      </div>
                    ) : layout === 'popup' ? (
                      <div className="max-w-md mx-auto" key={selectedTestimonials[previewIndex]?.id}>
                        <TestimonialCard 
                          t={selectedTestimonials[previewIndex]} 
                          themeColor={themeColor} 
                          small={false} 
                          isPopup={true} 
                          layout={layout}
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedTestimonials.map((t: any, i) => (
                          <TestimonialCard key={t.id} t={t} themeColor={themeColor} small index={i} layout={layout} />
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="py-20 text-center opacity-20"><MessageSquare className="w-12 h-12 mx-auto" /><p className="text-xs font-bold uppercase mt-2">Nenhum depoimento selecionado</p></div>
                  )}
                </div>
              </div>

              {whatsappEnabled && (
                <div className="absolute bottom-6 right-6 bg-green-500 p-3 rounded-full text-white shadow-lg animate-in zoom-in fade-in">
                  <MessageCircle className="w-6 h-6" />
                </div>
              )}
            </div>

            <div className="p-6 bg-white rounded-2xl border shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-primary"><Link2 className="w-4 h-4" /><h3 className="text-xs font-bold uppercase tracking-widest">Link de Acesso Direto</h3></div>
              <div className="flex gap-2">
                <Input readOnly value={publicPageLink} className="bg-muted/30 border-primary/20 font-mono text-[10px] h-10" />
                <Button variant="secondary" size="icon" onClick={() => { navigator.clipboard.writeText(publicPageLink); toast({ title: "Copiado!" }); }}><Copy className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h2 className="text-sm font-bold font-headline flex items-center gap-2 text-muted-foreground"><MessageSquare className="w-4 h-4" /> Selecionar Depoimentos para Exibir</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {approvedTestimonials?.map((t: any) => (
                  <div key={t.id} onClick={() => toggleTestimonial(t.id)} className={cn("cursor-pointer transition-all rounded-xl border-2 p-4 bg-background", selectedIds.includes(t.id) ? "border-primary bg-primary/5 shadow-md" : "border-transparent shadow-sm hover:border-muted-foreground/10")}>
                    <div className="flex items-start gap-3">
                      <div className={cn("mt-1 w-4 h-4 rounded-md border flex items-center justify-center", selectedIds.includes(t.id) ? "bg-primary border-primary" : "border-muted-foreground/30")}>
                        {selectedIds.includes(t.id) && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-xs block truncate">{t.userName}</span>
                        <p className="text-[10px] text-muted-foreground italic line-clamp-1 mt-0.5">"{t.text}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4"><CheckCircle2 className="w-8 h-8 text-primary" /></div>
            <DialogTitle className="text-2xl font-headline">Página VIP Atualizada!</DialogTitle>
            <DialogDescription className="text-sm text-gray-700">As atualizações no layout, design e links sociais já estão ativas. Seus clientes verão as mudanças instantaneamente.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4"><Button className="w-full font-bold h-12" onClick={() => setIsLinkDialogOpen(false)}>Concluído</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
