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
  Upload,
  Palette,
  LayoutGrid,
  Play,
  Layout,
  Trash2,
  Globe,
  HelpCircle,
  Info,
  Link2,
  Copy,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useUser, useFirestore, useDoc, useCollection, useStorage } from '@/firebase';
import { doc, updateDoc, collection, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from '@/components/ui/slider';
import Cropper from 'react-easy-crop';
import { ThemeToggle } from '@/components/theme-toggle';

type LayoutType = 'mural' | 'carousel' | 'grid' | 'popup';

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  type: 'logo' | 'cover'
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Falha ao obter contexto 2D');

  const targetWidth = type === 'cover' ? 3840 : 1024; 
  const aspectRatio = pixelCrop.width / pixelCrop.height;
  const targetHeight = targetWidth / aspectRatio;

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return new Promise((resolve, reject) => {
    const mimeType = type === 'cover' ? 'image/png' : 'image/jpeg';
    const quality = type === 'cover' ? 1.0 : 0.92;

    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('Canvas vazio'));
        else resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

const TestimonialCard = ({ t, themeColor, secondaryColor, index = 0, muralIndex = 0 }: { t: any, themeColor: string, secondaryColor: string, index?: number, muralIndex?: number }) => {
  const side = (index + muralIndex) % 2 === 0 ? 'left' : 'right';
  
  return (
    <Card 
      key={`${t.id}-${muralIndex}`}
      className={cn(
        "bg-card shadow-lg border-none text-left overflow-hidden transition-all duration-700 p-4",
        "border-t-4 animate-in duration-700 ease-out fill-both",
        side === 'left' ? "slide-in-from-left-full fade-in" : "slide-in-from-right-full fade-in"
      )} 
      style={{ 
        borderTopColor: themeColor,
        boxShadow: `0 10px 30px -15px ${themeColor}30`,
        backgroundColor: secondaryColor && secondaryColor !== '#ffffff' ? `${secondaryColor}20` : undefined
      }}
    >
      <div className="flex flex-col space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full shrink-0" style={{ backgroundColor: secondaryColor && secondaryColor !== '#ffffff' ? `${secondaryColor}30` : `${themeColor}15` }}>
            <User className="w-4 h-4" style={{ color: themeColor }} />
          </div>
          <span className="font-bold text-foreground leading-tight truncate text-xs">{t.userName}</span>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: t.rating || 5 }).map((_, i) => (
            <Star key={i} className="fill-primary text-primary w-3 h-3" style={{ color: themeColor, fill: themeColor }} />
          ))}
        </div>
        <p className="text-foreground/80 italic leading-relaxed text-xs line-clamp-4">"{t.text}"</p>
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
  onFileSelect,
  isUploading
}: any) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
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

      <Tabs defaultValue="geral" className="w-full flex-1 flex flex-col min-h-0">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-12 px-2 shrink-0">
          <TabsTrigger value="geral" className="text-xs">Visual</TabsTrigger>
          <TabsTrigger value="design" className="text-xs">Layout</TabsTrigger>
          <TabsTrigger value="social" className="text-xs">Social</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-8 pb-10">
            <TabsContent value="geral" className="mt-0 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Logotipo (Square)</Label>
                  {logoUrl && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setLogoUrl('')}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
                <div 
                  onClick={() => !isUploading && logoInputRef.current?.click()}
                  className="aspect-square w-24 border-2 border-dashed rounded-2xl flex items-center justify-center bg-muted/20 overflow-hidden relative group mx-auto cursor-pointer"
                >
                  {isUploading ? <Loader2 className="animate-spin text-primary" /> : (logoUrl ? <img src={logoUrl} className="w-full h-full object-cover rounded-xl" /> : <Upload className="text-muted-foreground" />)}
                </div>
                <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => onFileSelect(e, 'logo')} />
              </div>

              <div className="space-y-6 pt-4 border-t">
                <div className="space-y-4">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Palette className="w-3 h-3 text-primary" /> Cor Principal
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button key={color} onClick={() => setThemeColor(color)} className={cn("w-7 h-7 rounded-full border-2 transition-transform", themeColor === color ? "border-foreground scale-110 shadow-sm" : "border-transparent opacity-80 shadow-inner")} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-4 border-t">
                <div className="space-y-4">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Palette className="w-3 h-3 text-primary" /> Cor Secundária
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button key={color} onClick={() => setSecondaryColor(color)} className={cn("w-7 h-7 rounded-full border-2 transition-transform", secondaryColor === color ? "border-foreground scale-110 shadow-sm" : "border-transparent opacity-80 shadow-inner")} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="design" className="mt-0 space-y-6">
              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nome da Página</Label>
                <Input value={widgetName} onChange={(e) => setWidgetName(e.target.value)} />
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Estilo de Exibição</Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'mural', icon: LayoutGrid, label: 'Mural Masonry' },
                    { id: 'carousel', icon: Play, label: 'Carrossel' },
                    { id: 'grid', icon: Layout, label: 'Grade Estática' },
                    { id: 'popup', icon: MessageSquare, label: 'Notificação' },
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
            </TabsContent>

            <TabsContent value="social" className="mt-0 space-y-6">
              <div className="space-y-4 p-4 border rounded-xl bg-muted/5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold">Botão WhatsApp</Label>
                  <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
                </div>
                {whatsappEnabled && (
                  <Input type="text" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="Número WhatsApp" className="h-10" />
                )}
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">URL do Site Oficial</Label>
                <Input value={externalSiteUrl} onChange={(e) => setExternalSiteUrl(e.target.value)} placeholder="https://seusite.com.br" />
              </div>
              <div className="space-y-3 pt-4 border-t">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Google Business URL</Label>
                <Input value={googleMapsUrl} onChange={(e) => setGoogleMapsUrl(e.target.value)} placeholder="Link do Perfil Google" />
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

  const widgetRef = useMemo(() => (db && user ? doc(db, 'users', user.uid, 'widgets', widgetId) : null), [db, user, widgetId]);
  const { data: widgetData, loading: widgetLoading } = useDoc(widgetRef);

  const userDocRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: userData, loading: userDataLoading } = useDoc(userDocRef);

  const testimonialsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'testimonials'), where('status', '==', 'approved'));
  }, [db, user]);

  const { data: approvedTestimonials, loading: testimonialsLoading } = useCollection(testimonialsQuery);

  const allWidgetsQuery = useMemo(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'widgets');
  }, [db, user]);
  const { data: allWidgets } = useCollection(allWidgetsQuery);

  const [widgetName, setWidgetName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [themeColor, setThemeColor] = useState('#f97316');
  const [secondaryColor, setSecondaryColor] = useState('#ffffff');
  const [layout, setLayout] = useState<LayoutType>('mural');
  const [logoUrl, setLogoUrl] = useState('');
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [externalSiteUrl, setExternalSiteUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [muralIndex, setMuralIndex] = useState(0);
  const [baseUrl, setBaseUrl] = useState('');
  const [showAll, setShowAll] = useState(false);

  const [tempImage, setTempImage] = useState<string | null>(null);
  const [cropType, setCropType] = useState<'logo' | 'cover' | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (widgetData) {
      setWidgetName(widgetData.name || '');
      setSelectedIds(widgetData.selectedTestimonialIds || []);
      setThemeColor(widgetData.themeColor || '#f97316');
      setSecondaryColor(widgetData.secondaryColor || '#ffffff');
      setLayout(widgetData.layout || 'mural');
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

  useEffect(() => {
    if (layout === 'mural' && selectedIds.length > 0) {
      const interval = setInterval(() => setMuralIndex(prev => (prev + 1) % selectedIds.length), 6000);
      return () => clearInterval(interval);
    }
  }, [layout, selectedIds]);

  const publicPageLink = useMemo(() => {
    if (!baseUrl || !userData || !widgetId) return '';
    const slug = userData.companySlug || userData.companyName?.toLowerCase().replace(/\s+/g, '-') || '';
    return `${baseUrl}/pp/${slug}/${widgetId}`;
  }, [baseUrl, userData, widgetId]);

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${description} copiado para a área de transferência.`,
    });
  };

  const takenTestimonialIds = useMemo(() => {
    if (!allWidgets) return new Set<string>();
    const set = new Set<string>();
    allWidgets.forEach((w: any) => {
      if (w.id !== widgetId && w.selectedTestimonialIds) {
        w.selectedTestimonialIds.forEach((id: string) => set.add(id));
      }
    });
    return set;
  }, [allWidgets, widgetId]);

  const selectableTestimonials = useMemo(() => {
    if (!approvedTestimonials) return [];
    return approvedTestimonials.filter((t: any) => 
      !takenTestimonialIds.has(t.id) || selectedIds.includes(t.id)
    );
  }, [approvedTestimonials, takenTestimonialIds, selectedIds]);

  const displayedTestimonialsSelection = useMemo(() => {
    return showAll ? selectableTestimonials : selectableTestimonials.slice(0, 10);
  }, [selectableTestimonials, showAll]);

  const currentTestimonials = useMemo(() => {
    return approvedTestimonials?.filter(t => selectedIds.includes(t.id)) || [];
  }, [approvedTestimonials, selectedIds]);

  const visibleTestimonials = useMemo(() => {
    if (layout !== 'mural' || currentTestimonials.length === 0) return currentTestimonials.slice(0, 8);
    const slice = [];
    const count = Math.min(8, currentTestimonials.length);
    for (let i = 0; i < count; i++) {
      const idx = (muralIndex + i) % currentTestimonials.length;
      slice.push(currentTestimonials[idx]);
    }
    return slice;
  }, [currentTestimonials, muralIndex, layout]);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setTempImage(reader.result as string);
      setCropType(type);
    });
    reader.readAsDataURL(file);
  };

  const handleConfirmCrop = async () => {
    if (!tempImage || !cropType || !user || !storage || !croppedAreaPixels) return;
    setIsUploading(true);
    setTempImage(null);
    try {
      const croppedBlob = await getCroppedImg(tempImage, croppedAreaPixels, cropType);
      const extension = cropType === 'cover' ? 'png' : 'jpg';
      const storageRef = ref(storage, `users/${user.uid}/widgets/${widgetId}/${cropType}_${Date.now()}.${extension}`);
      const snapshot = await uploadBytes(storageRef, croppedBlob);
      const url = await getDownloadURL(snapshot.ref);
      if (cropType === 'logo') setLogoUrl(url);
    } catch (err) {
      toast({ variant: "destructive", title: "Erro no processamento" });
    } finally {
      setIsUploading(false);
      setCropType(null);
    }
  };

  const handleSave = async () => {
    if (!widgetRef) return;
    setIsSaving(true);
    updateDoc(widgetRef, {
      name: widgetName.trim(),
      selectedTestimonialIds: selectedIds,
      themeColor,
      secondaryColor,
      layout,
      logoUrl,
      whatsappEnabled,
      whatsappNumber,
      googleMapsUrl,
      externalSiteUrl,
    }).then(() => {
      setIsSaving(false);
      toast({ title: "Alterações Salvas", description: "Sua página pública foi atualizada." });
    }).catch(() => setIsSaving(false));
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  if (authLoading || widgetLoading || testimonialsLoading || userDataLoading) {
    return <div className="flex h-screen items-center justify-center bg-muted/30"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  }

  const hasValidLogo = logoUrl && logoUrl.startsWith('http');

  const sidebarProps = { 
    widgetName, setWidgetName, themeColor, setThemeColor, secondaryColor, setSecondaryColor,
    whatsappEnabled, setWhatsappEnabled, whatsappNumber, setWhatsappNumber,
    googleMapsUrl, setGoogleMapsUrl, externalSiteUrl, setExternalSiteUrl,
    layout, setLayout, logoUrl, setLogoUrl,
    onFileSelect, isUploading
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col font-body w-full overflow-hidden text-foreground">
      <header className="bg-background border-b h-20 flex items-center px-4 md:px-6 sticky top-0 z-[60] shadow-sm">
        <div className="flex items-center gap-3 flex-1">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/5 transition-all h-12 w-12 flex items-center justify-center">
                <Monitor className="h-8 w-8" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80 border-none">
              <SheetHeader className="sr-only">
                <SheetTitle>Configurações da Página Pública</SheetTitle>
                <DialogDescription>Ajuste o visual e as redes sociais da sua página.</DialogDescription>
              </SheetHeader>
              <PublicPageSettings {...sidebarProps} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black uppercase tracking-tight truncate max-w-[150px]">{widgetName || 'Editor'}</h1>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <Button onClick={handleSave} disabled={isSaving || isUploading} className="shadow-lg h-10 px-6 font-bold">
            {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Tudo
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative w-full flex-row">
        <aside className="hidden lg:flex w-80 bg-background border-r flex-col shrink-0">
          <PublicPageSettings {...sidebarProps} />
        </aside>

        <div className="flex-1 overflow-y-auto bg-muted/10 p-4 sm:p-8">
          <div className="max-w-none mx-auto space-y-8 pb-20">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Link href="/widgets" className="inline-block group">
                <Button variant="ghost" className="gap-2 px-0 hover:bg-transparent text-muted-foreground hover:text-primary transition-colors">
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Voltar para a Lista</span>
                </Button>
              </Link>
              
              <div className="flex items-center gap-2 bg-background border rounded-xl p-1.5 shadow-sm max-w-md w-full">
                <div className="flex-1 px-3">
                  <p className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter mb-0.5">Link da Página Pública</p>
                  <Input 
                    readOnly 
                    value={publicPageLink} 
                    className="h-6 border-none bg-transparent p-0 text-[11px] font-mono focus-visible:ring-0"
                  />
                </div>
                <div className="flex gap-1 pr-1">
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg"
                    onClick={() => copyToClipboard(publicPageLink, "Link da Página Pública")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg border-primary/20 text-primary"
                    asChild
                  >
                    <a href={publicPageLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Eye className="w-4 h-4" /> Preview Dinâmico
              </h2>
              <Button variant="link" size="sm" onClick={() => setIsTutorialOpen(true)} className="text-[10px] font-bold gap-1 text-primary p-0 h-auto">
                <Info className="w-3 h-3" /> Ver Tutorial
              </Button>
            </div>

            <div className="relative border-none shadow-2xl bg-background rounded-[2.5rem] min-h-[600px] flex flex-col overflow-hidden ring-1 ring-primary/5">
              <div className={cn("p-8 sm:p-12 space-y-12 flex-1 flex flex-col", "pt-24")}>
                <div className="text-center space-y-10">
                  {hasValidLogo && (
                    <div className="mx-auto w-24 h-24 sm:w-32 sm:h-32 relative">
                      <img src={logoUrl} className="w-full h-full object-cover rounded-[2.5rem] shadow-xl border-4 border-background" alt="Logo" />
                    </div>
                  )}
                  <h1 className="text-4xl sm:text-7xl font-black tracking-tighter text-foreground leading-[1.1]">
                    O que dizem sobre <span style={{ color: themeColor }}>{userData?.companyName}</span>
                  </h1>
                </div>

                <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {visibleTestimonials.length > 0 ? (
                    visibleTestimonials.map((t, i) => (
                      <TestimonialCard 
                        key={`${t.id}-${muralIndex}-${i}`} 
                        t={t} 
                        themeColor={themeColor} 
                        secondaryColor={secondaryColor} 
                        index={i} 
                        muralIndex={muralIndex} 
                      />
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center opacity-30 italic text-sm">Selecione depoimentos para o preview.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-12 border-t">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="selection" className="border-none">
                  <AccordionTrigger className="hover:no-underline py-0 group">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                      <MessageSquare className="w-4 h-4" /> Depoimentos Disponíveis ({selectableTestimonials.length})
                    </h2>
                  </AccordionTrigger>
                  <AccordionContent className="pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {displayedTestimonialsSelection.map((t: any) => (
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
                              <p className="text-[10px] text-muted-foreground italic line-clamp-2 mt-1">"{t.text}"</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {!showAll && selectableTestimonials.length > 10 && (
                        <div className="col-span-full mt-6 flex justify-center">
                          <Button 
                            variant="outline" 
                            onClick={() => setShowAll(true)} 
                            className="rounded-full gap-2 border-primary/20 text-primary hover:bg-primary/5 font-bold h-11 px-8"
                          >
                            Mostrar Todos <ChevronDown className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={isTutorialOpen} onOpenChange={setIsTutorialOpen}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black font-headline flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-primary" /> Como configurar sua Página Pública
            </DialogTitle>
            <DialogDescription>
              Crie um destino VIP para sua marca em 3 passos rápidos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">1</div>
              <div>
                <p className="text-sm font-bold">Aba Visual (Design e Identidade)</p>
                <p className="text-xs text-muted-foreground">Use o ícone de <Monitor className="w-3 h-3 inline-block mb-0.5" /> para subir sua logo e definir as cores que combinam com seu branding.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">2</div>
              <div>
                <p className="text-sm font-bold">Aba Layout (Estilo de Exibição)</p>
                <p className="text-xs text-muted-foreground">Personalize o título da página e escolha o formato do mural (Masonry, Grade, etc).</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">3</div>
              <div>
                <p className="text-sm font-bold">Aba Social (Interação e Site Oficial)</p>
                <p className="text-xs text-muted-foreground">Ative o botão de WhatsApp e configure o *Site Oficial*. **Dica:** Copie o link da sua página pública e use-o no seu perfil do WhatsApp ou na bio do Instagram!</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full font-black h-12" onClick={() => setIsTutorialOpen(false)}>Entendi, vamos lá!</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!tempImage} onOpenChange={(open) => !open && setTempImage(null)}>
        <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col p-0 overflow-hidden rounded-3xl border-none">
          <div className="flex-1 relative bg-black">
            {tempImage && (
              <Cropper
                image={tempImage}
                crop={crop}
                zoom={zoom}
                aspect={cropType === 'logo' ? 1 : 21 / 9}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>
          <div className="p-6 border-t bg-background shrink-0 space-y-6">
            <Slider value={[zoom]} min={1} max={3} step={0.1} onValueChange={(vals) => setZoom(vals[0])} />
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setTempImage(null)}>Cancelar</Button>
              <Button onClick={handleConfirmCrop} className="font-bold">Salvar Corte 4K</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
