
'use client';

import { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  CheckCircle2, 
  MessageSquare,
  LogOut,
  User,
  Loader2,
  ArrowRight,
  ArrowDown,
  Share2,
  Copy,
  Link2,
  Star,
  Clock,
  Layout,
  Plus,
  QrCode,
  Download,
  MapPin,
  TrendingUp,
  Shield,
  Edit3,
  ChevronRight,
  ArrowLeft,
  FileDown,
  Sun,
  Moon,
  TrendingDown
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { useUser, useFirestore, useDoc, useAuth, useCollection } from '@/firebase';
import { doc, collection, query, updateDoc, orderBy, limit } from 'firebase/firestore';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { toast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { ThemeToggle } from '@/components/theme-toggle';
import { jsPDF } from 'jspdf';
import { cn } from '@/lib/utils';

export default function DashPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const [baseUrl, setBaseUrl] = useState('');
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [isGoogleMapsDialogOpen, setIsGoogleMapsDialogOpen] = useState(false);
  
  const [selectedWidgetForLink, setSelectedWidgetForLink] = useState<any>(null);
  const [newGoogleMapsUrl, setNewGoogleMapsUrl] = useState('');
  const [isUpdatingUrl, setIsUpdatingUrl] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfTheme, setPdfTheme] = useState<'light' | 'dark'>('light');

  const userDocRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: userData, loading: userDataLoading } = useDoc(userDocRef);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  // Lógica de Comparação Mensal (Counter Pattern)
  const trendMetrics = useMemo(() => {
    const current = userData?.testimonialsCount || 0;
    const last = userData?.lastMonthCount || 0;
    
    if (last === 0) {
      return { 
        percentage: current > 0 ? 100 : 0, 
        isPositive: true,
        label: current > 0 ? `+${current} novos` : 'Sem dados'
      };
    }
    
    const diff = current - last;
    const percent = Math.round((diff / last) * 100);
    return { 
      percentage: Math.abs(percent), 
      isPositive: percent >= 0,
      label: `${percent >= 0 ? '+' : ''}${percent}%`
    };
  }, [userData]);

  const companySlug = useMemo(() => {
    if (!userData) return '';
    return userData.companySlug || userData?.companyName?.toLowerCase().replace(/\s+/g, '-') || '';
  }, [userData]);

  const testimonialsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'testimonials'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
  }, [db, user]);

  const { data: displayTestimonials, loading: testimonialsLoading } = useCollection(testimonialsQuery);

  const widgetsQuery = useMemo(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'widgets');
  }, [db, user]);

  const { data: widgetsData, loading: widgetsLoading } = useCollection(widgetsQuery);

  const totalGoogleRedirects = useMemo(() => {
    if (!widgetsData) return 0;
    return widgetsData.reduce((acc: number, curr: any) => acc + (curr.googleRedirectCount || 0), 0);
  }, [widgetsData]);

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${description} copiado para a área de transferência.`,
    });
  };

  const handleUpdateGoogleMapsUrl = async () => {
    if (!db || !user || !selectedWidgetForLink || isUpdatingUrl) return;
    
    setIsUpdatingUrl(true);
    const widgetRef = doc(db, 'users', user.uid, 'widgets', selectedWidgetForLink.id);
    
    updateDoc(widgetRef, {
      googleMapsUrl: newGoogleMapsUrl.trim()
    })
      .then(() => {
        toast({ title: "Link Atualizado", description: `Link do Google Business salvo para o widget "${selectedWidgetForLink.name}".` });
        setIsGoogleMapsDialogOpen(false);
        setSelectedWidgetForLink(null);
        setNewGoogleMapsUrl('');
      })
      .catch((err) => {
        console.error("Erro ao atualizar URL:", err);
      })
      .finally(() => {
        setIsUpdatingUrl(false);
      });
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const isDark = pdfTheme === 'dark';
      const companyName = userData?.companyName || 'Sua Empresa';
      const primaryColor = [249, 115, 22]; // Orange hex: #f97316

      // Background
      if (isDark) {
        doc.setFillColor(17, 24, 39); // Gray-900
      } else {
        doc.setFillColor(250, 250, 250); // Light Gray
      }
      doc.rect(0, 0, 210, 297, 'F');

      // Header Orange Bar
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 40, 'F');

      // App Name
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.text('PROOVA', 105, 25, { align: 'center' });

      // Main Container
      if (isDark) {
        doc.setFillColor(31, 41, 55); // Gray-800
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      } else {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(230, 230, 230);
      }
      doc.roundedRect(20, 50, 170, 210, 10, 10, 'FD');

      // Company Name
      if (isDark) {
        doc.setTextColor(255, 255, 255);
      } else {
        doc.setTextColor(31, 41, 55); // Gray-800
      }
      doc.setFontSize(24);
      doc.text(companyName.toUpperCase(), 105, 80, { align: 'center' });

      // Subtitle
      if (isDark) {
        doc.setTextColor(156, 163, 175); // Gray-400
      } else {
        doc.setTextColor(107, 114, 128); // Gray-500
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14);
      doc.text('A sua opinião é muito importante para nós!', 105, 95, { align: 'center' });

      // QR Code conversion
      const svg = document.getElementById('qr-code-svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new (window as any).Image();
        
        await new Promise((resolve) => {
          img.onload = () => {
            canvas.width = img.width * 2;
            canvas.height = img.height * 2;
            if (ctx) {
              ctx.fillStyle = 'white';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
            const pngUrl = canvas.toDataURL('image/png');
            doc.addImage(pngUrl, 'PNG', 55, 110, 100, 100);
            resolve(true);
          };
          img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        });
      }

      // CTA
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('ESCANEIE PARA NOS AVALIAR', 105, 230, { align: 'center' });

      // Footer
      if (isDark) {
        doc.setTextColor(107, 114, 128);
      } else {
        doc.setTextColor(156, 163, 175); // Gray-400
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Tecnologia Proova', 105, 275, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.text('BY SYNAPSE GROUP', 105, 282, { align: 'center' });

      doc.save(`cartaz-proova-${companySlug}-${pdfTheme}.pdf`);
      toast({ title: "PDF Gerado!", description: `O seu cartaz (${pdfTheme === 'light' ? 'Claro' : 'Escuro'}) foi baixado.` });
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      toast({ variant: "destructive", title: "Erro no PDF", description: "Não foi possível gerar o arquivo agora." });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (authLoading || userDataLoading || (user && !userData)) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Autenticando perfil...</p>
        </div>
      </div>
    );
  }

  const collectionLink = `${baseUrl}/c/${companySlug}`;

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col font-body text-foreground">
      <header className="bg-background border-b h-20 flex items-center px-4 md:px-6 sticky top-0 z-[60] shadow-sm">
        <div className="flex items-center gap-2 font-bold text-lg md:text-xl">
          <Image src="/maskable_icon_x512 (3).png" alt="Logo" width={56} height={56} className="rounded-2xl shadow-sm" />
        </div>
        
        <nav className="ml-8 hidden md:flex items-center gap-6">
          <Link href="/dash" className="text-sm font-medium text-primary transition-colors">Dash</Link>
          <Link href="/widgets" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Widgets</Link>
          {userData?.isAdmin && (
            <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Administração</Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <div className="flex flex-col items-end mr-1 md:mr-2">
            <span className="text-xs md:text-sm font-semibold truncate max-w-[120px] md:max-w-none">
              {userData?.companyName || 'Minha Empresa'}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 md:h-10 md:w-10 border border-primary/40 bg-background/50 backdrop-blur-sm">
                <User className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background border-border shadow-xl">
              <DropdownMenuLabel className="font-headline">Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dash')} className="cursor-pointer md:hidden font-medium">
                <TrendingUp className="mr-2 h-4 w-4 text-primary" />
                <span>Dash</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/widgets')} className="cursor-pointer font-medium">
                <Layout className="mr-2 h-4 w-4 text-primary" />
                <span>Meus Widgets</span>
              </DropdownMenuItem>
              {userData?.isAdmin && (
                <DropdownMenuItem onClick={() => router.push('/admin')} className="cursor-pointer md:hidden font-medium">
                  <Shield className="mr-2 h-4 w-4 text-primary" />
                  <span>Administração</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut(auth)} className="text-destructive focus:text-destructive cursor-pointer font-medium">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 space-y-8 md:space-y-12 max-w-7xl mx-auto w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">Painel de Controle</h1>
            <p className="text-sm md:text-base text-muted-foreground">Gestão de prova social dinâmica</p>
          </div>
          <Link href="/widgets" className="w-full md:w-auto">
            <Button className="w-full md:w-auto shadow-lg hover:shadow-xl transition-all" size="lg">
              <Plus className="w-5 h-5 mr-2" /> Novo Mural
            </Button>
          </Link>
        </header>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 relative">
          <Card className="border-none shadow-sm group cursor-default relative overflow-visible">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Resumo</CardTitle>
              {trendMetrics.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl md:text-3xl font-bold">
                  {userData?.testimonialsCount || 0} <span className="text-lg font-medium text-muted-foreground">avaliações</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "border-none text-[10px] h-5 px-1.5 font-black",
                      trendMetrics.isPositive ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {trendMetrics.label}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">vs mês anterior</span>
                </div>
              </div>
            </CardContent>
            
            <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 items-center justify-center bg-background rounded-full border shadow-lg p-1.5 z-30 group-hover:scale-110 transition-transform ring-4 ring-muted/20">
              <ArrowRight className="h-4 w-4 text-primary" />
            </div>

            <div className="flex md:hidden absolute -bottom-5 left-1/2 -translate-x-1/2 items-center justify-center bg-background rounded-full border shadow-lg p-1.5 z-30 transition-transform ring-4 ring-muted/20">
              <ArrowDown className="h-4 w-4 text-primary" />
            </div>
          </Card>

          <div className="relative group">
            <div 
              onClick={() => {
                setSelectedWidgetForLink(null);
                setNewGoogleMapsUrl('');
                setIsGoogleMapsDialogOpen(true);
              }}
              className="absolute -top-3 right-4 z-40 bg-primary text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 ring-2 ring-white"
            >
              <Edit3 className="w-2.5 h-2.5" /> Configurar Link
            </div>
            <Card className="border-none shadow-sm relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Redirecionados Google</CardTitle>
                <MapPin className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">{totalGoogleRedirects}</div>
                  <Badge variant="secondary" className="text-[10px] h-5 bg-primary/10 text-primary border-none">
                    Ativo
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total de cliques para o seu Google Business.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold font-headline tracking-tight">Compartilhar / Coletar</h2>
          </div>
          <Card className="border-none shadow-sm overflow-hidden group">
            <div className="h-1 w-full bg-primary/20 group-hover:bg-primary transition-colors" />
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary" /> Link de Coleta & QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input 
                  readOnly 
                  value={collectionLink} 
                  className="bg-muted/30 font-mono text-[10px] md:text-xs h-10 border-none focus-visible:ring-1 focus-visible:ring-primary/20 flex-1"
                />
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    className="h-10 flex-1 sm:w-10 sm:flex-none justify-center px-4 sm:px-0"
                    onClick={() => copyToClipboard(collectionLink, "Link de coleta")}
                  >
                    <Copy className="h-4 w-4 sm:mr-0 mr-2" />
                    <span className="sm:hidden font-bold">Copiar</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-10 border-primary/20 text-primary hover:bg-primary/5 flex-1 sm:flex-none gap-2 font-bold justify-center px-4"
                    onClick={() => setIsQrDialogOpen(true)}
                  >
                    <QrCode className="h-4 w-4" />
                    <span>Gerar Cartaz</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold font-headline tracking-tight">Últimos Depoimentos</h2>
          </div>
          
          <div className="grid gap-4">
            {testimonialsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
              </div>
            ) : displayTestimonials && displayTestimonials.length > 0 ? (
              displayTestimonials.map((t: any) => (
                <Card key={t.id} className="border-none shadow-sm overflow-hidden">
                  <CardContent className="p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-2 rounded-full hidden sm:block">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-col space-y-0.5 mb-1">
                          <span className="font-bold text-xs">{t.userName}</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: t.rating || 5 }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-foreground italic line-clamp-2 md:line-clamp-none">
                          "{t.text}"
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString('pt-BR') : 'Hoje'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-2xl bg-muted/10">
                <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Nenhum depoimento ainda.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-8 border-t">
        <div className="container px-4 md:px-6 mx-auto flex flex-col justify-center items-center gap-4 text-center">
          <p className="text-xs md:text-sm text-muted-foreground">© 2026 Proova - Prova Social de Verdade.</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">
            Feito Pelo Grupo Synapse | Synapse Group
          </p>
        </div>
      </footer>

      <Dialog open={isGoogleMapsDialogOpen} onOpenChange={setIsGoogleMapsDialogOpen}>
        <DialogContent className="sm:max-w-md w-[90vw] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <MapPin className="w-6 h-6 text-primary" /> Configurar Google Business
            </DialogTitle>
            <DialogDescription>
              {selectedWidgetForLink 
                ? `Defina o link do Google para o mural "${selectedWidgetForLink.name}".`
                : 'Selecione para qual mural você deseja configurar o link do Google Maps.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {!selectedWidgetForLink ? (
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Seus Murais Disponíveis</Label>
                <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
                  {widgetsLoading ? (
                    <div className="py-4 text-center"><Loader2 className="animate-spin h-6 w-6 text-primary mx-auto" /></div>
                  ) : widgetsData && widgetsData.length > 0 ? (
                    widgetsData.map((w: any) => (
                      <Button 
                        key={w.id} 
                        variant="outline" 
                        className="w-full justify-between h-14 rounded-xl px-4 border-muted hover:border-primary group transition-all"
                        onClick={() => {
                          setSelectedWidgetForLink(w);
                          setNewGoogleMapsUrl(w.googleMapsUrl || '');
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/5 p-2 rounded-lg group-hover:bg-primary/10">
                            <Layout className="w-4 h-4 text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold">{w.name}</p>
                            <p className="text-[10px] text-muted-foreground">{w.googleMapsUrl ? 'Link configurado' : 'Link pendente'}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </Button>
                    ))
                  ) : (
                    <div className="py-8 text-center border-2 border-dashed rounded-xl">
                      <p className="text-sm text-muted-foreground">Crie um mural primeiro.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedWidgetForLink(null)}
                  className="px-0 text-primary hover:bg-transparent -ml-1 h-auto py-1"
                >
                  <ArrowLeft className="w-3 h-3 mr-1.5" /> Escolher outro mural
                </Button>
                <div className="space-y-2">
                  <Label htmlFor="google-url" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">URL do Perfil Google</Label>
                  <Input 
                    id="google-url"
                    placeholder="https://g.page/r/..." 
                    value={newGoogleMapsUrl} 
                    onChange={(e) => setNewGoogleMapsUrl(e.target.value)}
                    className="h-12 border-primary/20 focus-visible:ring-primary/20"
                    autoFocus
                  />
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Dica: Use o link "Receber mais avaliações" no painel do seu Google Business para obter a URL direta do formulário.
                </p>
                <Button onClick={handleUpdateGoogleMapsUrl} disabled={isUpdatingUrl} className="w-full h-12 shadow-lg">
                  {isUpdatingUrl ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Salvar Link do Mural
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="sm:max-w-md w-[90vw] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <QrCode className="w-6 h-6 text-primary" />
              Cartaz de Balcão VIP
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              Gere um cartaz profissional em PDF para seus clientes avaliarem sua empresa no local.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-4 md:py-6 space-y-6">
            <div className="flex flex-col items-center gap-3 w-full border-b pb-6">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estilo do Cartaz</Label>
              <div className="flex justify-center gap-4">
                <Button 
                  variant={pdfTheme === 'light' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setPdfTheme('light')}
                  className="gap-2 h-10 px-6 rounded-xl"
                >
                  <Sun className="w-4 h-4" /> Claro
                </Button>
                <Button 
                  variant={pdfTheme === 'dark' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setPdfTheme('dark')}
                  className="gap-2 h-10 px-6 rounded-xl"
                >
                  <Moon className="w-4 h-4" /> Escuro
                </Button>
              </div>
            </div>

            <div className="p-4 md:p-6 bg-white rounded-3xl shadow-inner border-4 border-primary/20">
              <QRCodeSVG 
                id="qr-code-svg"
                value={collectionLink} 
                size={200} 
                level="H"
                includeMargin={true}
              />
            </div>
            
            <div className="w-full">
              <Button 
                className="w-full h-14 shadow-xl font-bold text-lg gap-3"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
              >
                {isGeneratingPdf ? (
                  <><Loader2 className="animate-spin" /> Preparando Cartaz...</>
                ) : (
                  <><FileDown className="w-6 h-6" /> Baixar PDF ({pdfTheme === 'light' ? 'Claro' : 'Escuro'})</>
                )}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase tracking-[0.2em] font-black">
                Powered by Synapse Group
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
