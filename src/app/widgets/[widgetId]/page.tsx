
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
  Upload,
  ImageIcon,
  Palette,
  ChevronRight,
  LayoutGrid,
  Play,
  Layout
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
import { ThemeToggle } from '@/components/theme-toggle';

type LayoutType = 'mural' | 'carousel' | 'grid' | 'popup';

/**
 * Comprime imagem com foco em altíssima fidelidade.
 * Se a imagem for menor que 3MB, mantém o original.
 */
async function compressImage(file: File, maxWidth = 3840, quality = 1.0): Promise<Blob | File> {
  if (file.size < 3 * 1024 * 1024) {
    return file; // Mantém original se for pequeno o suficiente
  }

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
        boxShadow: `0 10px 30px -15px ${themeColor}20`,
        backgroundColor: secondaryColor ? `${secondaryColor}05` : undefined
      }}
    >
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="bg-primary/5 p-1 rounded-full shrink-0" style={{ backgroundColor: secondaryColor ? `${secondaryColor}15` : `${themeColor}10` }}>
            <User className="w-3 h-3" style={{ color: themeColor }} />
          </div>
          <p className="font-bold text-foreground leading-tight truncate text-[10px]">{t.userName}</p>
        </div>
        <div className="flex gap-0.5 pl-6">
          {Array.from({ length: t.rating || 5 }).map((_, i) => (
            <Star key={i} className="fill-primary text-primary w-2.5 h-2.5" style={{ color: themeColor, fill: themeColor }} />
          ))}
        </div>
        <p className="text-foreground/80 italic leading-relaxed text-[10px] line-clamp-3">"{t.text}"</p>
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
  const colors = ['#f97316', '#D4AF37', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#e11d48', '#0d9488', '#7c3aed', '#475569', '#000000', '#ffffff'];

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-background border-r">
      <div className="p-4 border-b bg-muted/10 shrink-0">
        <Link href="/widgets" className="w-full">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-primary transition-colors h-10 px-2 group">
            <div className="bg-muted p-1.5 rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em]">Voltar</span>
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="geral" className="w-full flex-1 flex flex-col min-h-0">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-12 px-2 shrink-0 overflow-x-auto no-scrollbar">
          <TabsTrigger value="geral" className="text-xs shrink-0 data-[state=active]:bg-primary/5">Identidade</TabsTrigger>
          <TabsTrigger value="design" className="text-xs shrink-0 data-[state=active]:bg-primary/5">Estilo</TabsTrigger>
          <TabsTrigger value="social" className="text-xs shrink-0 data-[state=active]:bg-primary/5">Social</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-8 pb-10">
            <TabsContent value="geral" className="mt-0 space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Logotipo (Maskable)</Label>
                <div 
                  onClick={() => !isUploading && logoInputRef.current?.click()}
                  className={cn(
                    "aspect-square w-24 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-2 transition-colors bg-muted/20 overflow-hidden relative group mx-auto ring-offset-4 ring-primary/20 hover:ring-2",
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

              <div className="space-y-4 pt-4 border-t">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Imagem de Capa (4K Fidelity)</Label>
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
                  <div className="space-y-4 p-4 rounded-xl bg-muted/5 border mt-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-[9px] font-bold text-muted-foreground uppercase">Altura da Capa</Label>
                      <span className="text-[10px] font-mono font-bold text-primary">{coverImageHeight}vh</span>
                    </div>
                    <Slider 
                      value={[coverImageHeight]} 
                      min={20} 
                      max={90} 
                      step={1} 
                      onValueChange={(vals) => setCoverImageHeight(vals[0])}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-6 pt-4 border-t">
                <div className="space-y-4">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Palette className="w-3 h-3 text-primary" /> Cor do Tema
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button 
                        key={color} 
                        onClick={() => setThemeColor(color)} 
                        className={cn("w-7 h-7 rounded-full border-2 transition-transform active:scale-90", themeColor === color ? "border-foreground scale-110 shadow-md" : "border-transparent opacity-80 hover:opacity-100")} 
                        style={{ backgroundColor: color }} 
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Palette className="w-3 h-3 text-muted-foreground" /> Cor Secundária
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button 
                        key={color} 
                        onClick={() => setSecondaryColor(color)} 
                        className={cn("w-7 h-7 rounded-full border-2 transition-transform active:scale-90", secondaryColor === color ? "border-foreground scale-110 shadow-md" : "border-transparent opacity-80 hover:opacity-100")} 
                        style={{ backgroundColor: color }} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="design" className="mt-0 space-y-6">
              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nome do Mural</Label>
                <Input value={widgetName} onChange={(e) => setWidgetName(e.target.value)} />
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Formato de Exibição</Label>
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
              <div className="space-y-4 p-4 border rounded-xl bg-muted/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold">Botão WhatsApp</Label>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-tight">Contato flutuante na página</p>
                  </div>
                  <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
                </div>
                {whatsappEnabled && (
                  <Input 
                    type="text"
                    value={whatsappNumber} 
                    onChange={(e) => setWhatsappNumber(e.target.value)} 
                    placeholder="+55 11 99999-9999" 
                  />
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">URL Google Business</Label>
                <Input value={googleMapsUrl} onChange={(e) => setGoogleMapsUrl(e.target.value)} placeholder="Link do Perfil no Maps" />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Link do Site</Label>
                <Input value={externalSiteUrl} onChange={(e) => setExternalSiteUrl(e.target.value)} placeholder="https://www.exemplo.com" />
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file || !user || !storage) return;
    
    setIsUploading(true);
    try {
      const maxWidth = type === 'logo' ? 1200 : 3840;
      const compressedBlob = await compressImage(file, maxWidth, 1.0);
      const storagePath = `users/${user.uid}/widgets/${widgetId}/${type}_${Date.now()}.jpg`;
      const storageRef = ref(storage, storagePath);
      const snapshot = await uploadBytes(storageRef, compressedBlob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      if (type === 'logo') setLogoUrl(downloadURL);
      else setCoverImageUrl(downloadURL);
      
      toast({ title: "Upload Completo!", description: "Imagem processada com alta fidelidade." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erro no processamento" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!widgetRef || !widgetName.trim()) return;
    setIsSaving(true);
    updateDoc(widgetRef, {
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
    }).then(() => {
      setIsSaving(false);
      setIsLinkDialogOpen(true);
    }).catch(() => setIsSaving(false));
  };

  const publicPageLink = `${baseUrl}/pp/${userData?.companySlug || ''}/${widgetId}`;

  if (authLoading || widgetLoading || testimonialsLoading || userDataLoading) {
    return <div className="flex h-screen items-center justify-center bg-muted/30"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col font-body w-full">
      <header className="bg-background border-b h-20 flex items-center px-4 md:px-6 sticky top-0 z-[60] shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link href="/widgets" className="hidden lg:block">
            <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/5">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden text-primary"><Menu className="h-6 w-6" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <SheetHeader className="sr-only"><SheetTitle>Ajustes</SheetTitle></SheetHeader>
              <PublicPageSettings {...({ 
                widgetName, setWidgetName, themeColor, setThemeColor, secondaryColor, setSecondaryColor,
                whatsappEnabled, setWhatsappEnabled, whatsappNumber, setWhatsappNumber,
                googleMapsUrl, setGoogleMapsUrl, externalSiteUrl, setExternalSiteUrl,
                layout, setLayout, logoUrl, setLogoUrl, coverImageUrl, setCoverImageUrl,
                coverImageHeight, setCoverImageHeight, onUpload: handleUpload, isUploading
              })} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" />
            <h1 className="text-sm font-bold tracking-tight truncate max-w-[150px] uppercase font-black">{widgetName || 'Public VIP'}</h1>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          <Button onClick={handleSave} disabled={isSaving || isUploading} className="shadow-lg h-10 px-6 font-bold">
            {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative w-full">
        <aside className="hidden lg:flex w-80 bg-background border-r flex-col shrink-0">
          <PublicPageSettings {...({ 
            widgetName, setWidgetName, themeColor, setThemeColor, secondaryColor, setSecondaryColor,
            whatsappEnabled, setWhatsappEnabled, whatsappNumber, setWhatsappNumber,
            googleMapsUrl, setGoogleMapsUrl, externalSiteUrl, setExternalSiteUrl,
            layout, setLayout, logoUrl, setLogoUrl, coverImageUrl, setCoverImageUrl,
            coverImageHeight, setCoverImageHeight, onUpload: handleUpload, isUploading
          })} />
        </aside>

        <div className="flex-1 overflow-y-auto bg-muted/30 p-4 sm:p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Eye className="w-4 h-4" /> Preview do Layout
              </h2>
              <Link href={publicPageLink} target="_blank">
                <Button variant="link" className="text-xs font-bold gap-1 p-0">
                  Ver Link Real
                </Button>
              </Link>
            </div>

            <div className="relative border shadow-2xl bg-background rounded-[2.5rem] min-h-[600px] flex flex-col overflow-hidden ring-1 ring-primary/5">
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
                <div className="text-center space-y-6">
                  {logoUrl && (
                    <div className="mx-auto w-24 h-24 mb-6 relative">
                      <img src={logoUrl} className="w-full h-full object-cover rounded-[2rem] shadow-xl border-4 border-background" alt="Logo" />
                    </div>
                  )}
                  <h1 className="text-4xl font-black tracking-tighter text-foreground leading-[1.1]">
                    O que dizem sobre <span style={{ color: themeColor }}>{userData?.companyName}</span>
                  </h1>
                </div>

                <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTestimonials.length > 0 ? (
                    selectedTestimonials.slice(0, 4).map((t, i) => (
                      <TestimonialCard key={t.id} t={t} themeColor={themeColor} secondaryColor={secondaryColor} index={i} layout={layout} />
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center opacity-30 italic text-sm">Selecione depoimentos abaixo.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-12 border-t">
              <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Selecionar Depoimentos
              </h2>
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
                        <span className="font-bold text-xs block truncate">{t.userName}</span>
                        <p className="text-[10px] text-muted-foreground italic line-clamp-2 mt-1">"{t.text}"</p>
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
        <DialogContent className="rounded-3xl">
          <DialogHeader className="text-center">
            <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4 text-green-600"><CheckCircle2 className="w-8 h-8" /></div>
            <DialogTitle className="text-2xl font-black font-headline">Configuração Salva!</DialogTitle>
            <DialogDescription>A página pública foi atualizada com alta qualidade.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button className="w-full font-black h-12" onClick={() => setIsLinkDialogOpen(false)}>Entendido</Button>
            <Button variant="ghost" className="w-full font-bold text-[10px] uppercase tracking-widest" onClick={() => window.open(publicPageLink, '_blank')}>Abrir Link Direto</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
