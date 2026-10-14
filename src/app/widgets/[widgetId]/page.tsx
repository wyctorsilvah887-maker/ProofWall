
'use client';

import { useState, useMemo, useEffect, use, useRef } from 'react';
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
  MessageCircle,
  Layout,
  LayoutGrid,
  Play,
  Upload,
  Lock,
  MapPin,
  Palette,
  ImageIcon,
  X,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useUser, useFirestore, useDoc, useCollection, useStorage } from '@/firebase';
import { doc, updateDoc, collection, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
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
import { ThemeToggle } from '@/components/theme-toggle';

type LayoutType = 'mural' | 'carousel' | 'grid' | 'popup';

/**
 * Utilitário para compressão de imagem no lado do cliente usando Canvas.
 * Aumentado para 2560px (Quad HD) para capas e qualidade superior (0.9).
 */
async function compressImage(file: File, maxWidth = 1200, quality = 0.9): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
        }

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Falha na compressão.'));
          },
          'image/jpeg',
          quality
        );
      };
    };
    reader.onerror = (error) => reject(error);
  });
}

const TestimonialCard = ({ t, themeColor, secondaryColor, isPopup = false, index = 0, layout = 'mural', muralIndex = 0, noAnim = false }: { t: any, themeColor: string, secondaryColor: string, isPopup?: boolean, index?: number, layout?: string, muralIndex?: number, noAnim?: boolean }) => {
  const slideSide = (index + muralIndex) % 2 === 0 ? 'left' : 'right';
  const slideClass = layout === 'mural' 
    ? (slideSide === 'left' ? "slide-in-from-left-full" : "slide-in-from-right-full") 
    : (isPopup ? "slide-in-from-bottom-8 fade-in zoom-in duration-700" : "fade-in zoom-in-95 slide-in-from-bottom-4");

  return (
    <Card 
      className={cn(
        "bg-background shadow-lg border-none text-left overflow-hidden transition-all duration-700",
        "p-2.5",
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
        boxShadow: `0 10px 30px -15px ${themeColor}20`,
        backgroundColor: secondaryColor ? `${secondaryColor}05` : undefined
      }}
    >
      <div className="flex flex-col space-y-1.5">
        <div className="flex items-start justify-between w-full gap-2">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="bg-primary/5 p-1 rounded-full shrink-0" style={{ backgroundColor: secondaryColor ? `${secondaryColor}15` : `${themeColor}10` }}>
                <User className="w-2.5 h-2.5" style={{ color: themeColor }} />
              </div>
              <p className="font-bold text-foreground leading-tight truncate text-[9px]">{t.userName}</p>
            </div>
            <div className="flex gap-0.5 pl-5">
              {Array.from({ length: t.rating || 5 }).map((_, i) => (
                <Star key={i} className="fill-primary text-primary w-2 h-2" style={{ color: themeColor, fill: themeColor }} />
              ))}
            </div>
          </div>
        </div>
        <p className="text-foreground/80 italic leading-relaxed text-[9px] line-clamp-3">"{t.text}"</p>
      </div>
    </Card>
  );
};

const PublicPageSettings = ({ 
  widgetName, setWidgetName,
  themeColor, setThemeColor,
  secondaryColor, setSecondaryColor,
  whatsappEnabled, setWhatsappEnabled,
  whatsappNumber, setWhatsappNumber,
  googleMapsUrl, setGoogleMapsUrl,
  externalSiteUrl, setExternalSiteUrl,
  layout, setLayout,
  logoUrl, setLogoUrl,
  coverImageUrl, setCoverImageUrl,
  coverImageHeight, setCoverImageHeight,
  onUpload,
  isUploading
}: any) => {
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const formatWhatsApp = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (!v) return '';
    const len = v.length;
    if (v.startsWith('55')) {
      if (len <= 2) return `+${v}`;
      if (len <= 4) return `+${v.slice(0, 2)} (${v.slice(2)}`;
      if (len <= 9) return `+${v.slice(0, 2)} (${v.slice(2, 4)}) ${v.slice(4)}`;
      if (len <= 13) return `+${v.slice(0, 2)} (${v.slice(2, 4)}) ${v.slice(4, 9)}-${v.slice(9)}`;
      return `+${v.slice(0, 2)} (${v.slice(2, 4)}) ${v.slice(4, 9)}-${v.slice(9, 13)}`;
    }
    if (len <= 2) return `(${v}`;
    if (len <= 6) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
    if (len <= 10) return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
    return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7, 11)}`;
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value);
    setWhatsappNumber(formatted);
  };

  const colors = ['#f97316', '#D4AF37', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#e11d48', '#0d9488', '#7c3aed', '#475569', '#000000', '#ffffff'];

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
                <Input 
                  value={widgetName} 
                  onChange={(e) => setWidgetName(e.target.value)} 
                  placeholder="Ex: Nossos Elogios" 
                />
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Logo da Empresa</Label>
                <div className="flex flex-col gap-3">
                  <div 
                    onClick={() => !isUploading && logoInputRef.current?.click()}
                    className={cn(
                      "aspect-square w-24 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-2 transition-colors bg-muted/20 overflow-hidden relative group mx-auto",
                      isUploading ? "cursor-wait" : "cursor-pointer hover:bg-muted/50"
                    )}
                  >
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    ) : logoUrl ? (
                      <>
                        <img src={logoUrl} className="h-full w-full object-cover" alt="Logo" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Upload className="w-6 h-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => onUpload(e, 'logo')} />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Imagem de Capa (2K HD)</Label>
                  {coverImageUrl && (
                    <div className="flex items-center gap-1 text-[9px] font-bold text-primary uppercase">
                      <Settings className="w-3 h-3" /> Ajustável
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-4">
                  <div 
                    onClick={() => !isUploading && coverInputRef.current?.click()}
                    className={cn(
                      "h-32 w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors bg-muted/20 overflow-hidden relative group",
                      isUploading ? "cursor-wait" : "cursor-pointer hover:bg-muted/50"
                    )}
                  >
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    ) : coverImageUrl ? (
                      <>
                        <img src={coverImageUrl} className="h-full w-full object-cover" alt="Capa" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                      </>
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => onUpload(e, 'cover')} />
                  
                  {coverImageUrl && (
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">Altura da Capa</Label>
                        <span className="text-[10px] font-mono font-bold text-primary">{coverImageHeight}vh</span>
                      </div>
                      <Slider 
                        value={[coverImageHeight]} 
                        min={30} 
                        max={80} 
                        step={5} 
                        onValueChange={(vals) => setCoverImageHeight(vals[0])}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6 pt-4 border-t">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Palette className="w-3 h-3" /> Cor Principal
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button key={color} onClick={() => setThemeColor(color)} className={cn("w-7 h-7 rounded-full border-2", themeColor === color ? "border-foreground" : "border-transparent")} style={{ backgroundColor: color }} />
                    ))}
                  </div>
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
                      className={cn("flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all", layout === item.id ? "border-primary bg-primary/5 shadow-sm" : "border-muted hover:border-muted-foreground/20")}
                    >
                      <item.icon className={cn("w-4 h-4", layout === item.id ? "text-primary" : "text-muted-foreground")} />
                      <span className={cn("text-xs font-bold", layout === item.id ? "text-primary" : "text-foreground")}>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="social" className="mt-0 space-y-6">
              <div className="space-y-4 border-b pb-6">
                <div className="flex items-center justify-between p-3 border rounded-xl bg-muted/10">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold">Botão de WhatsApp</Label>
                    <p className="text-[10px] text-muted-foreground">Ativar botão flutuante</p>
                  </div>
                  <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
                </div>
                {whatsappEnabled && (
                  <Input 
                    type="text"
                    value={whatsappNumber} 
                    onChange={handleWhatsAppChange} 
                    placeholder="+55 (11) 99999-9999" 
                  />
                )}
              </div>

              <div className="space-y-4 border-b pb-6">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Google Business</Label>
                <Input 
                  value={googleMapsUrl} 
                  onChange={(e) => setGoogleMapsUrl(e.target.value)} 
                  placeholder="https://maps.google.com/..." 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Site Oficial</Label>
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
  const storage = useStorage();
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
  const [secondaryColor, setSecondaryColor] = useState('#ffffff');
  const [layout, setLayout] = useState<LayoutType>('mural');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverImageHeight, setCoverImageHeight] = useState(45);
  const [logoUrl, setLogoUrl] = useState('');
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [externalSiteUrl, setExternalSiteUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
      setSecondaryColor(widgetData.secondaryColor || '#ffffff');
      setLayout(widgetData.layout || 'mural');
      setCoverImageUrl(widgetData.coverImageUrl || '');
      setCoverImageHeight(widgetData.coverImageHeight || 45);
      setLogoUrl(widgetData.logoUrl || '');
      setWhatsappEnabled(widgetData.whatsappEnabled || false);
      setWhatsappNumber(widgetData.whatsappNumber || '');
      setGoogleMapsUrl(widgetData.googleMapsUrl || '');
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file || !user || !storage) return;
    
    setIsUploading(true);
    try {
      const maxWidth = type === 'logo' ? 600 : 2560; // 2K Ultra HD para capas
      const compressedBlob = await compressImage(file, maxWidth, 0.92);

      const storagePath = `users/${user.uid}/widgets/${widgetId}/${type}_${Date.now()}.jpg`;
      const storageRef = ref(storage, storagePath);
      
      const snapshot = await uploadBytes(storageRef, compressedBlob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      if (type === 'logo') setLogoUrl(downloadURL);
      else setCoverImageUrl(downloadURL);
      
      toast({ title: "Imagem HD!", description: "Arquivo otimizado para alta fidelidade." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Falha no Upload" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!widgetRef || !widgetName.trim()) return;
    setIsSaving(true);
    const updates = {
      name: widgetName.trim(),
      selectedTestimonialIds: selectedIds,
      themeColor,
      secondaryColor,
      layout,
      coverImageUrl,
      coverImageHeight,
      logoUrl,
      whatsappEnabled,
      whatsappNumber,
      googleMapsUrl,
      externalSiteUrl,
    };
    updateDoc(widgetRef, updates).then(() => {
      setIsSaving(false);
      setIsLinkDialogOpen(true);
    }).catch(() => setIsSaving(false));
  };

  const toggleTestimonial = (id: string) => {
    if (takenIds.has(id)) {
      toast({ variant: "destructive", title: "Já em uso" });
      return;
    }
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const publicPageLink = `${baseUrl}/pp/${userData?.companySlug || ''}/${widgetId}`;

  if (authLoading || widgetLoading || testimonialsLoading || userDataLoading || allWidgetsLoading) {
    return <div className="flex h-screen items-center justify-center bg-muted/30"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col font-body overflow-x-hidden w-full">
      <header className="bg-background border-b h-20 flex items-center px-4 md:px-6 sticky top-0 z-[60] shadow-sm w-full">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <Link href="/widgets" className="hidden sm:block shrink-0">
            <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/5">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Monitor className="w-5 h-5 sm:w-6 sm:h-6 text-primary hidden xs:block shrink-0" />
            <div className="flex flex-col min-w-0">
              <h1 className="text-xs sm:text-sm font-bold tracking-tight truncate max-w-[100px] sm:max-w-[200px]">{widgetName || 'Página Pública'}</h1>
              <span className="text-[8px] sm:text-[10px] text-muted-foreground uppercase font-black">Editor VIP</span>
            </div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <Button onClick={handleSave} disabled={isSaving || isUploading} className="shadow-lg font-bold text-[10px] sm:text-sm h-9 sm:h-10 px-3 sm:px-4">
            {isSaving || isUploading ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-x-hidden relative w-full">
        <aside className="hidden lg:flex w-80 bg-background border-r flex-col shrink-0">
          <PublicPageSettings {...({ 
            widgetName, setWidgetName, themeColor, setThemeColor, secondaryColor, setSecondaryColor,
            whatsappEnabled, setWhatsappEnabled, whatsappNumber, setWhatsappNumber,
            googleMapsUrl, setGoogleMapsUrl, externalSiteUrl, setExternalSiteUrl,
            layout, setLayout, logoUrl, setLogoUrl, coverImageUrl, setCoverImageUrl,
            coverImageHeight, setCoverImageHeight, onUpload: handleUpload, isUploading
          })} />
        </aside>

        <div className="flex-1 overflow-y-auto bg-muted/30 p-3 sm:p-4 md:p-8 w-full">
          <div className="max-w-5xl mx-auto space-y-8 w-full">
            <div className="relative border-none shadow-2xl bg-background rounded-3xl min-h-[600px] flex flex-col overflow-hidden w-full ring-1 ring-primary/5">
              {coverImageUrl && (
                <div 
                  className="w-full relative shrink-0 transition-all duration-500 overflow-hidden" 
                  style={{ height: `${coverImageHeight}vh` }}
                >
                  <img src={coverImageUrl} className="w-full h-full object-cover" alt="Capa" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                </div>
              )}
              
              <div className="p-12 space-y-12 flex-1 flex flex-col">
                <div className="text-center space-y-4">
                  {logoUrl && (
                    <div className="mx-auto w-24 h-24 mb-6 relative">
                      <img src={logoUrl} className="w-full h-full object-cover rounded-3xl shadow-xl border-2 border-background relative z-10" alt="Logo" />
                    </div>
                  )}
                  <h1 className="text-3xl font-black tracking-tighter text-foreground">
                    O que dizem sobre <span style={{ color: themeColor }}>{userData?.companyName}</span>
                  </h1>
                </div>

                <div className="w-full max-w-4xl mx-auto">
                  {selectedTestimonials.length > 0 ? (
                    <div className="columns-1 md:columns-2 gap-4">
                      {selectedTestimonials.slice(0, 4).map((t, i) => (
                        <div key={t.id} className="mb-4">
                          <TestimonialCard t={t} themeColor={themeColor} secondaryColor={secondaryColor} index={i} layout={layout} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center opacity-20">Nenhum depoimento selecionado.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-black font-headline">Publicado!</DialogTitle>
            <DialogDescription>Sua página VIP foi atualizada com sucesso.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button className="w-full font-black h-12" onClick={() => setIsLinkDialogOpen(false)}>OK</Button>
            <Button variant="ghost" className="w-full font-bold text-[10px] uppercase tracking-widest" onClick={() => window.open(publicPageLink, '_blank')}>Ver Link Real</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
