
'use client';

import { useState, useMemo, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
  Columns,
  Play,
  CheckCircle2,
  BellRing,
  Settings2,
  Phone,
  Image as ImageIcon,
  Upload,
  X,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, updateDoc, collection, query, where } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
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

type LayoutType = 'mural' | 'carousel' | 'grid' | 'popup';

const formatWhatsAppDisplay = (value: string) => {
  const clean = value.replace(/\D/g, '');
  if (clean.length <= 2) return clean;
  if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  if (clean.length <= 10) return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
};

const TestimonialCard = ({ t, small = false, isPopup = false, index = 0, themeColor }: { t: any, small?: boolean, isPopup?: boolean, index?: number, themeColor: string }) => (
  <Card 
    className={cn(
      "bg-background shadow-xl border-none text-left overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-right-12",
      small ? "p-3" : "p-6",
      isPopup && "max-w-[260px] md:max-w-[300px] border-l-4 border-t-0"
    )} 
    style={{ 
      borderTopColor: !isPopup ? themeColor : 'transparent', 
      borderLeftColor: isPopup ? themeColor : 'transparent',
      borderTopWidth: !isPopup ? '3px' : '0', 
      borderLeftWidth: isPopup ? '4px' : '0',
      borderStyle: 'solid',
      animationDelay: `${index * 150}ms`,
      animationFillMode: 'both'
    }}
  >
    <div className="flex flex-col space-y-2">
      <div className="flex flex-col space-y-1 mb-1">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-full" style={{ backgroundColor: `${themeColor}15` }}>
            <User className="w-3 h-3" style={{ color: themeColor }} />
          </div>
          <p className={cn("font-bold leading-tight truncate", small ? "text-[10px]" : "text-xs")}>{t.userName}</p>
        </div>
        <div className="flex gap-0.5 pl-7">
          {Array.from({ length: t.rating || 5 }).map((_, i) => (
            <Star key={i} className={cn("fill-primary text-primary", small ? "w-2 h-2" : "w-2.5 h-2.5")} style={{ color: themeColor, fill: themeColor }} />
          ))}
        </div>
      </div>
      <p className={cn("text-gray-700 italic leading-relaxed", small ? "text-[10px] line-clamp-3" : "text-sm mb-2")}>
        "{t.text}"
      </p>
      <div className={cn("pt-2 border-t flex items-center justify-between", small ? "mt-1" : "pt-3 mt-2")}>
        <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter">
          Proova Social Proof
        </span>
        <Zap className="w-3 h-3 text-primary animate-pulse" style={{ color: themeColor }} />
      </div>
    </div>
  </Card>
);

const WidgetSettings = ({ 
  widgetName, setWidgetName, 
  whatsappEnabled, setWhatsappEnabled, 
  whatsappNumber, setWhatsappNumber, 
  layout, setLayout, 
  themeColor, setThemeColor,
  coverImageUrl, setCoverImageUrl
}: any) => {
  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <div className="p-4 border-b bg-muted/10 shrink-0">
        <Link href="/widgets" className="w-full">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-primary transition-colors h-10 px-2 group">
            <div className="bg-muted p-1.5 rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em]">Voltar ao Início</span>
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="geral" className="w-full flex-1 flex flex-col min-h-0">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-12 px-2 overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-hide shrink-0">
          <TabsTrigger value="geral" className="data-[state=active]:bg-muted text-xs md:text-sm">Geral</TabsTrigger>
          <TabsTrigger value="layout" className="data-[state=active]:bg-muted text-xs md:text-sm">Layout</TabsTrigger>
          <TabsTrigger value="design" className="data-[state=active]:bg-muted text-xs md:text-sm">Design</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="flex-1">
          <div className="p-4 md:p-6 space-y-6 md:space-y-8 pb-10">
            <TabsContent value="geral" className="mt-0 space-y-6 outline-none">
              <div className="space-y-2">
                <Label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome Identificador</Label>
                <Input 
                  value={widgetName}
                  onChange={(e) => setWidgetName(e.target.value)}
                  placeholder="Ex: Mural da Home"
                  className="h-10 md:h-11 border-primary/20 focus:border-primary text-sm"
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <Label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" /> Imagem de Capa
                </Label>
                <div className="space-y-4">
                  {coverImageUrl ? (
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border-2 border-primary/20 shadow-inner group">
                      <img src={coverImageUrl} alt="Preview da capa" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setCoverImageUrl('')}
                        className="absolute top-2 right-2 bg-destructive text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="aspect-video w-full rounded-xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center bg-muted/5 gap-2 text-center px-4">
                      <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Escolha sua capa (Upload em breve)</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Button disabled variant="outline" className="w-full h-10 gap-2 border-muted text-muted-foreground bg-muted/20 text-[10px] font-bold uppercase tracking-widest cursor-not-allowed">
                        <Upload className="w-4 h-4 opacity-30" /> Upload de Foto (Em Breve)
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold flex items-center gap-2">
                      <Phone className="w-4 h-4 text-green-500" /> Botão WhatsApp
                    </Label>
                    <p className="text-[10px] text-muted-foreground">Exibir botão de contato na Página Pública</p>
                  </div>
                  <Switch 
                    checked={whatsappEnabled}
                    onCheckedChange={setWhatsappEnabled}
                  />
                </div>

                {whatsappEnabled && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <Label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Número de Atendimento</Label>
                    <div className="relative">
                      <Input 
                        value={formatWhatsAppDisplay(whatsappNumber)}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '');
                          setWhatsappNumber(raw);
                        }}
                        placeholder="(99) 99999-9999"
                        className="h-10 border-primary/20 focus:border-primary text-sm pl-4"
                        maxLength={15}
                      />
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-tight italic">
                      * Insira DDD + Número (ex: 1199887766). Apenas números.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="layout" className="mt-0 space-y-4 md:space-y-6 outline-none">
              <div className="space-y-3 md:space-y-4">
                <Label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Estilo do Mural</Label>
                <div className="grid grid-cols-1 gap-2 md:gap-3">
                  <button 
                    onClick={() => setLayout('popup')}
                    className={cn(
                      "flex items-center gap-3 p-2 md:p-3 rounded-xl border-2 text-left transition-all relative overflow-hidden",
                      layout === 'popup' ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"
                    )}
                  >
                    <div className={cn("p-1.5 md:p-2 rounded-lg", layout === 'popup' ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                      <BellRing className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-bold">Notificação VIP</p>
                      <p className="text-[9px] md:text-[10px] text-muted-foreground truncate">Popup animado exclusivo</p>
                    </div>
                    <Badge className="absolute -top-1.5 -right-1.5 bg-primary text-[8px] h-3.5 px-1">Novo</Badge>
                    {layout === 'popup' && <CheckCircle2 className="w-4 h-4 ml-auto text-primary shrink-0" />}
                  </button>

                  <button 
                    onClick={() => setLayout('mural')}
                    className={cn(
                      "flex items-center gap-3 p-2 md:p-3 rounded-xl border-2 text-left transition-all",
                      layout === 'mural' ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"
                    )}
                  >
                    <div className={cn("p-1.5 md:p-2 rounded-lg", layout === 'mural' ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                      <LayoutGrid className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-bold">Mural Dinâmico</p>
                      <p className="text-[9px] md:text-[10px] text-muted-foreground">Estilo alvenaria premium</p>
                    </div>
                    {layout === 'mural' && <CheckCircle2 className="w-4 h-4 ml-auto text-primary shrink-0" />}
                  </button>

                  <button 
                    onClick={() => setLayout('carousel')}
                    className={cn(
                      "flex items-center gap-3 p-2 md:p-3 rounded-xl border-2 text-left transition-all",
                      layout === 'carousel' ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"
                    )}
                  >
                    <div className={cn("p-1.5 md:p-2 rounded-lg", layout === 'carousel' ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                      <Play className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-bold">Carrossel Slider</p>
                      <p className="text-[9px] md:text-[10px] text-muted-foreground">Exibição horizontal contínua</p>
                    </div>
                    {layout === 'carousel' && <CheckCircle2 className="w-4 h-4 ml-auto text-primary shrink-0" />}
                  </button>

                  <button 
                    onClick={() => setLayout('grid')}
                    className={cn(
                      "flex items-center gap-3 p-2 md:p-3 rounded-xl border-2 text-left transition-all",
                      layout === 'grid' ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"
                    )}
                  >
                    <div className={cn("p-1.5 md:p-2 rounded-lg", layout === 'grid' ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                      <Columns className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-bold">Grade Estática</p>
                      <p className="text-[9px] md:text-[10px] text-muted-foreground">Colunas e linhas uniformes</p>
                    </div>
                    {layout === 'grid' && <CheckCircle2 className="w-4 h-4 ml-auto text-primary shrink-0" />}
                  </button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="design" className="mt-0 space-y-4 md:space-y-6 outline-none">
              <div className="space-y-4">
                <Label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Cor de Destaque</Label>
                <div className="flex flex-wrap gap-3">
                  {['#f97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#000000'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setThemeColor(color)}
                      className={cn(
                        "w-7 h-7 md:w-8 md:h-8 rounded-full border-2 transition-transform hover:scale-110",
                        themeColor === color ? "border-foreground" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default function WidgetEditPage({ params }: { params: Promise<{ widgetId: string }> }) {
  const { widgetId } = use(params);
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const widgetRef = useMemo(() => (db && user ? doc(db, 'users', user.uid, 'widgets', widgetId) : null), [db, user, widgetId]);
  const { data: widgetData, loading: widgetLoading } = useDoc(widgetRef);

  const testimonialsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'testimonials'),
      where('status', '==', 'approved')
    );
  }, [db, user]);

  const { data: approvedTestimonials, loading: testimonialsLoading } = useCollection(testimonialsQuery);

  const [widgetName, setWidgetName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [layout, setLayout] = useState<LayoutType>('mural');
  const [themeColor, setThemeColor] = useState('#f97316');
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [muralIndex, setMuralIndex] = useState(0);

  useEffect(() => {
    if (widgetData) {
      setWidgetName(widgetData.name || '');
      setSelectedIds(widgetData.selectedTestimonialIds || []);
      setLayout(widgetData.layout || 'mural');
      setThemeColor(widgetData.themeColor || '#f97316');
      setWhatsappEnabled(widgetData.whatsappEnabled || false);
      setWhatsappNumber(widgetData.whatsappNumber || '');
      setCoverImageUrl(widgetData.coverImageUrl || '');
    }
  }, [widgetData]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const selectedTestimonials = useMemo(() => {
    if (!approvedTestimonials) return [];
    return approvedTestimonials.filter((t: any) => selectedIds.includes(t.id));
  }, [approvedTestimonials, selectedIds]);

  useEffect(() => {
    if ((layout === 'carousel' || layout === 'popup') && selectedTestimonials.length > 1) {
      const interval = setInterval(() => {
        setCarouselIndex((prev) => (prev + 1) % selectedTestimonials.length);
      }, 3000);
      return () => clearInterval(interval);
    }

    if (layout === 'mural' && selectedTestimonials.length > 0) {
      const interval = setInterval(() => {
        setMuralIndex(prev => (prev + 1) % selectedTestimonials.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [layout, selectedTestimonials]);

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
      layout,
      themeColor,
      whatsappEnabled,
      whatsappNumber: whatsappNumber.trim(),
      coverImageUrl,
    };

    updateDoc(widgetRef, updates)
      .then(() => {
        setIsSaving(false);
        toast({
          title: "Widget Atualizado",
          description: "As alterações foram salvas com sucesso.",
        });
      })
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: widgetRef.path,
          operation: 'update',
          requestResourceData: updates,
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsSaving(false);
      });
  };

  const toggleTestimonial = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (authLoading || widgetLoading || testimonialsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  const settingsProps = {
    widgetName, setWidgetName,
    whatsappEnabled, setWhatsappEnabled,
    whatsappNumber, setWhatsappNumber,
    layout, setLayout,
    themeColor, setThemeColor,
    coverImageUrl, setCoverImageUrl
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col font-body pb-20">
      <header className="bg-background border-b h-20 md:h-24 flex items-center px-4 md:px-6 sticky top-0 z-[60] shadow-sm">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 text-primary">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80 flex flex-col">
              <SheetHeader className="p-6 pb-2 border-b shrink-0">
                <SheetTitle className="font-headline text-primary flex items-center gap-2">
                  <Image src="/maskable_icon_x512 (3).png" alt="Logo" width={56} height={56} className="rounded-2xl shadow-sm" />
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 min-h-0">
                <WidgetSettings {...settingsProps} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-3 ml-2 lg:ml-0">
            <Image src="/maskable_icon_x512 (3).png" alt="Logo" width={56} height={56} className="rounded-2xl shadow-sm hidden sm:block" />
            <div className="truncate">
              <h1 className="text-sm md:text-xl font-bold font-headline tracking-tight truncate">{widgetName || 'Novo Mural'}</h1>
              <p className="hidden md:block text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Personalização do Widget</p>
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button onClick={handleSave} disabled={isSaving} className="shadow-lg h-9 md:h-10 px-4 md:px-6 text-xs md:text-sm font-bold">
            {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
            <span className="hidden sm:inline">Salvar Alterações</span>
            <span className="sm:hidden">Salvar</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <aside className="hidden lg:flex w-80 bg-background border-r flex-col sticky top-24 h-[calc(100vh-96px)] z-40">
          <WidgetSettings {...settingsProps} />
        </aside>

        <div className="flex-1 overflow-y-auto bg-muted/30 p-4 md:p-8 space-y-8 md:space-y-12">
          <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
            <h2 className="text-base md:text-lg font-bold font-headline flex items-center gap-2">
              <Eye className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Visualização em Tempo Real
            </h2>
            
            <div className={cn(
              "relative border-none shadow-xl bg-gradient-to-br from-primary/5 to-primary/10 p-4 md:p-10 rounded-2xl min-h-[400px] md:min-h-[500px] flex flex-col items-center justify-center transition-all duration-500",
              layout === 'popup' && "items-center lg:items-start lg:justify-end"
            )}>
              {selectedTestimonials.length > 0 ? (
                <div className="w-full h-full flex flex-col items-center">
                  {coverImageUrl && layout !== 'popup' && (
                    <div className="w-full max-w-2xl mb-8 rounded-2xl overflow-hidden shadow-lg border-b-4" style={{ borderColor: themeColor }}>
                      <img src={coverImageUrl} className="w-full h-32 object-cover" alt="Capa Preview" />
                      <div className="bg-background p-4 text-center">
                        <h3 className="font-headline font-bold text-sm">Preview da Capa no Mural</h3>
                      </div>
                    </div>
                  )}

                  <div className="w-full flex items-center justify-center">
                    {layout === 'mural' && (
                      <div 
                        key={muralIndex}
                        className="columns-1 sm:columns-2 gap-4 md:gap-6 space-y-4 md:space-y-6 w-full max-w-2xl"
                      >
                        {visibleMuralTestimonials.map((t, idx) => (
                          <div key={t.id + idx} className="break-inside-avoid">
                            <TestimonialCard t={t} small index={idx} themeColor={themeColor} />
                          </div>
                        ))}
                      </div>
                    )}

                    {layout === 'carousel' && (
                      <div className="flex items-center justify-center gap-2 md:gap-6 animate-in slide-in-from-right-10 duration-500 w-full max-w-lg">
                        <div className="w-full">
                          <TestimonialCard t={selectedTestimonials[carouselIndex % selectedTestimonials.length]} index={0} themeColor={themeColor} />
                        </div>
                      </div>
                    )}

                    {layout === 'grid' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 animate-in zoom-in-95 duration-500 w-full max-w-2xl">
                        {selectedTestimonials.slice(0, 4).map((t, idx) => (
                          <TestimonialCard key={t.id + idx} t={t} small index={idx} themeColor={themeColor} />
                        ))}
                      </div>
                    )}

                    {layout === 'popup' && (
                      <div className="lg:absolute lg:bottom-10 lg:left-10 flex flex-col items-center lg:items-start gap-3 md:gap-4 w-full lg:w-auto">
                        <div 
                          key={selectedTestimonials[carouselIndex % selectedTestimonials.length].id}
                          className="animate-in slide-in-from-bottom-12 lg:slide-in-from-left-full fade-in zoom-in duration-700 ease-out"
                        >
                          <TestimonialCard t={selectedTestimonials[carouselIndex % selectedTestimonials.length]} isPopup index={0} themeColor={themeColor} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 md:space-y-6 opacity-40 group p-6">
                  <div className="relative">
                    <MessageSquare className="w-16 h-16 md:w-20 md:h-20 mx-auto text-primary transition-transform group-hover:scale-110" />
                    <Zap className="w-6 h-6 md:w-8 md:h-8 text-primary absolute bottom-0 right-1/4 animate-bounce" />
                  </div>
                  <p className="font-black uppercase tracking-[0.2em] text-[10px] md:text-sm text-primary">Selecione depoimentos abaixo</p>
                </div>
              )}
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 pt-8 border-t">
            <div className="flex items-center justify-between">
              <h2 className="text-base md:text-lg font-bold font-headline flex items-center gap-2">
                <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-primary" /> 
                Depoimentos Aprovados
              </h2>
              <Badge variant="outline" className="bg-background px-3 text-[10px] md:text-xs">{approvedTestimonials?.length || 0} disponíveis</Badge>
            </div>

            {!approvedTestimonials || approvedTestimonials.length === 0 ? (
              <Card className="border-2 border-dashed bg-background/50 rounded-2xl">
                <CardContent className="py-16 md:py-20 text-center space-y-4">
                  <MessageSquare className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground/20 mx-auto" />
                  <p className="font-bold text-muted-foreground text-sm">Aguardando novos depoimentos para moderação...</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 md:gap-4">
                {approvedTestimonials.map((t: any) => (
                  <div 
                    key={t.id}
                    onClick={() => toggleTestimonial(t.id)}
                    className={cn(
                      "relative group cursor-pointer transition-all duration-300 rounded-2xl border-2 p-4 md:p-5 bg-background hover:shadow-lg",
                      selectedIds.includes(t.id) ? "border-primary bg-primary/5" : "border-transparent shadow-sm hover:border-primary/20"
                    )}
                  >
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className={cn(
                        "mt-1 w-5 h-5 md:w-6 md:h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                        selectedIds.includes(t.id) ? "bg-primary border-primary scale-110" : "border-muted-foreground/30"
                      )}>
                        {selectedIds.includes(t.id) && <Check className="w-3 h-3 md:w-4 md:h-4 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col space-y-0.5 mb-1.5 md:mb-2">
                          <span className="font-black text-xs md:text-sm truncate">{t.userName}</span>
                          <div className="flex gap-0.5 shrink-0">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={cn("w-2.5 h-2.5 md:w-3 md:h-3", i < (t.rating || 5) ? "fill-primary text-primary" : "text-muted-foreground/30")} />
                            ))}
                          </div>
                        </div>
                        <p className="text-[10px] md:text-xs text-muted-foreground italic line-clamp-2 leading-relaxed">
                          "{t.text}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
