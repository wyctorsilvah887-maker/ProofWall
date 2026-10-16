
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
  TrendingDown,
  Info,
  Monitor,
  Inbox
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
  DialogFooter,
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
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  
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

  // Agora buscamos diretamente do documento do usuário para evitar leituras de widgets apenas para métricas
  const totalGoogleRedirects = userData?.googleRedirectCount || 0;

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
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const isDark = pdfTheme === 'dark';
      const companyName = userData?.companyName || 'Sua Empresa';
      const primaryColor = [249, 115, 22];

      if (isDark) {
        pdf.setFillColor(0, 0, 0);
      } else {
        pdf.setFillColor(250, 250, 250);
      }
      pdf.rect(0, 0, 210, 297, 'F');

      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.rect(0, 0, 210, 40, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(28);
      pdf.text('PROOVA', 105, 25, { align: 'center' });

      if (isDark) {
        pdf.setFillColor(31, 41, 55);
        pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      } else {
        pdf.setFillColor(255, 255, 255);
        pdf.setDrawColor(230, 230, 230);
      }
      pdf.roundedRect(20, 50, 170, 210, 10, 10, 'FD');

      if (isDark) {
        pdf.setTextColor(255, 255, 255);
      } else {
        pdf.setTextColor(31, 41, 55);
      }
      pdf.setFontSize(24);
      pdf.text(companyName.toUpperCase(), 105, 80, { align: 'center' });

      if (isDark) {
        pdf.setTextColor(156, 163, 175);
      } else {
        pdf.setTextColor(107, 114, 128);
      }
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(14);
      pdf.text('A sua opinião é muito importante para nós!', 105, 95, { align: 'center' });

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
            pdf.addImage(pngUrl, 'PNG', 55, 110, 100, 100);
            resolve(true);
          };
          img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        });
      }

      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('ESCANEIE PARA NOS AVALIAR', 105, 230, { align: 'center' });

      if (isDark) {
        pdf.setTextColor(107, 114, 128);
      } else {
        pdf.setTextColor(156, 163, 175);
      }
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('Tecnologia Proova', 105, 275, { align: 'center' });
      pdf.setFont('helvetica', 'bold');
      pdf.text('BY SYNAPSE GROUP', 105, 282, { align: 'center' });

      pdf.save(`cartaz-proova-${companySlug}-${pdfTheme}.pdf`);
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
  
  const membershipLabel = userData?.membershipStatus === 'gold' 
    ? 'Membro Gold' 
    : userData?.membershipStatus === 'standard' 
      ? 'Membro Standard' 
      : null;

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col font-body text-foreground">
      <header className="bg-background border-b h-16 md:h-20 flex items-center px-4 md:px-8 sticky top-0 z-[60] shadow-sm backdrop-blur-md bg-background/95">
        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/dash" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 md:w-12 md:h-12 transition-transform group-hover:scale-105">
              <Image src="/maskable_icon_x512 (3).png" alt="Logo" fill className="rounded-xl shadow-sm object-cover" />
            </div>
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1 md:gap-2 border-r pr-2 md:pr-4 mr-1 md:mr-2">
            <ThemeToggle />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-12 px-2 gap-2 rounded-xl hover:bg-primary/5 group transition-all active:bg-primary/10">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold truncate max-w-[120px] md:max-w-[200px] transition-colors group-hover:text-primary leading-tight">
                    {userData?.companyName || 'Minha Empresa'}
                  </span>
                  {membershipLabel && (
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black leading-tight">
                      {membershipLabel}
                    </span>
                  )}
                </div>
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary group-hover:text-white transition-colors">
                  <User className="w-4 h-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background border-border shadow-xl rounded-2xl p-2">
              <DropdownMenuLabel className="px-3 py-2">
                <p className="text-xs font-headline font-black uppercase tracking-[0.2em] text-muted-foreground">Minha Conta</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="mx-1" />
              <DropdownMenuItem onClick={() => router.push('/dash')} className="rounded-xl cursor-pointer font-bold py-2.5">
                <TrendingUp className="mr-2 h-4 w-4 text-primary" />
                <span>Dash</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/widgets')} className="rounded-xl cursor-pointer font-bold py-2.5">
                <Layout className="mr-2 h-4 w-4 text-primary" />
                <span>Meus Widgets</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/private')} className="rounded-xl cursor-pointer font-bold py-2.5">
                <Inbox className="mr-2 h-4 w-4 text-primary" />
                <span>Inbox Privado</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsTutorialOpen(true)} className="rounded-xl cursor-pointer font-bold py-2.5">
                <Info className="mr-2 h-4 w-4 text-primary" />
                <span>Tutorial</span>
              </DropdownMenuItem>
              {userData?.isAdmin && (
                <DropdownMenuItem onClick={() => router.push('/admin')} className="rounded-xl cursor-pointer font-bold py-2.5">
                  <Shield className="mr-2 h-4 w-4 text-primary" />
                  <span>Administração</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="mx-1" />
              <DropdownMenuItem onClick={() => signOut(auth)} className="rounded-xl text-destructive focus:text-destructive cursor-pointer font-bold py-2.5">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair do Sistema</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 space-y-8 md:space-y-12 max-w-7xl mx-auto w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">Painel de Controle</h1>
              <Button variant="link" size="sm" onClick={() => setIsTutorialOpen(true)} className="text-[10px] font-bold gap-1 text-primary p-0 h-auto">
                <Info className="w-3 h-3" /> Tutorial
              </Button>
            </div>
            <p className="text-sm md:text-base text-muted-foreground">Gestão de prova social dinâmica</p>
          </div>
          <Link href="/widgets" className="w-full md:w-auto">
            <Button className="w-full md:w-auto shadow-lg hover:shadow-xl transition-all h-12 rounded-xl" size="lg">
              Meus Murais
            </Button>
          </Link>
        </header>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 relative">
          <Card className="border-none shadow-sm group cursor-default relative overflow-visible rounded-2xl">
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
              <span className="flex items-center gap-1.5"><Edit3 className="w-2.5 h-2.5" /> Configurar Link</span>
            </div>
            <Card className="border-none shadow-sm relative overflow-hidden rounded-2xl">
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
          <Card className="border-none shadow-sm overflow-hidden group rounded-2xl">
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
                  className="bg-muted/30 font-mono text-[10px] md:text-xs h-10 border-none focus-visible:ring-1 focus-visible:ring-primary/20 flex-1 rounded-xl"
                />
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    className="h-10 flex-1 sm:w-10 sm:flex-none justify-center px-4 sm:px-0 rounded-xl"
                    onClick={() => copyToClipboard(collectionLink, "Link de coleta")}
                  >
                    <Copy className="h-4 w-4 sm:mr-0 mr-2" />
                    <span className="sm:hidden font-bold">Copiar</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-10 border-primary/20 text-primary hover:bg-primary/5 flex-1 sm:flex-none gap-2 font-bold justify-center px-4 rounded-xl"
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold font-headline tracking-tight">Últimos Depoimentos</h2>
            </div>
            <Link href="/private">
              <Button variant="outline" size="sm" className="rounded-full gap-2 text-xs border-primary/20 text-primary hover:bg-primary/5">
                <Inbox className="w-3.5 h-3.5" /> Inbox Privado
              </Button>
            </Link>
          </div>
          
          <div className="grid gap-4">
            {testimonialsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
              </div>
            ) : displayTestimonials && displayTestimonials.length > 0 ? (
              displayTestimonials.map((t: any) => (
                <Card key={t.id} className="border-none shadow-sm overflow-hidden rounded-2xl">
                  <CardContent className="p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-2 rounded-xl hidden sm:block">
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
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
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

      <Dialog open={isTutorialOpen} onOpenChange={setIsTutorialOpen}>
        <DialogContent className="rounded-[2.5rem] sm:max-w-md border-none shadow-2xl overflow-hidden p-0 flex flex-col">
          <DialogHeader className="p-8 pt-16 pb-4 shrink-0 bg-background">
            <DialogTitle className="text-2xl font-black font-headline flex items-center gap-2">
              <Info className="w-6 h-6 text-primary" /> Bem-vindo ao Proova
            </DialogTitle>
            <DialogDescription>
              Aprenda a dominar seu painel de prova social em 3 passos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6 px-8 overflow-y-auto">
            <div className="flex gap-4 group">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black shrink-0 transition-colors group-hover:bg-primary group-hover:text-white">1</div>
              <div>
                <p className="text-sm font-bold">Acompanhe sua Performance</p>
                <p className="text-xs text-muted-foreground leading-relaxed">Monitore o crescimento dos seus depoimentos e cliques no Google em tempo real através dos cards de métricas inteligentes.</p>
              </div>
            </div>
            <div className="flex gap-4 group">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black shrink-0 transition-colors group-hover:bg-primary group-hover:text-white">2</div>
              <div>
                <p className="text-sm font-bold">Crie e Customize Murais</p>
                <p className="text-xs text-muted-foreground leading-relaxed">Clique no ícone de <Monitor className="w-3 h-3 inline-block mb-0.5" /> nos editores para subir sua logo e definir as cores da sua marca.</p>
              </div>
            </div>
            <div className="flex gap-4 group">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black shrink-0 transition-colors group-hover:bg-primary group-hover:text-white">3</div>
              <div>
                <p className="text-sm font-bold">Capture e Compartilhe</p>
                <p className="text-xs text-muted-foreground leading-relaxed">Copie seu link exclusivo ou gere o <strong>Cartaz de Balcão</strong> em PDF para coletar novos elogios no seu estabelecimento físico.</p>
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 pt-4 pb-8 bg-background">
            <Button className="w-full font-black h-12 rounded-2xl shadow-xl" onClick={() => setIsTutorialOpen(false)}>Vamos Começar!</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isGoogleMapsDialogOpen} onOpenChange={setIsGoogleMapsDialogOpen}>
        <DialogContent className="sm:max-w-xs w-[92vw] max-w-[95vw] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden h-auto max-h-[85vh] flex flex-col">
          <DialogHeader className="p-6 pt-12 pb-3 shrink-0 bg-background relative">
            <DialogTitle className="flex items-center gap-2 text-lg font-headline font-black">
              <MapPin className="w-5 h-5 text-primary" /> Configurar Google
            </DialogTitle>
            <DialogDescription className="text-[10px]">
              {selectedWidgetForLink 
                ? `Defina o link para "${selectedWidgetForLink.name}".`
                : 'Selecione um mural para configurar.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6 pt-0 space-y-3 overflow-y-auto flex-1 min-h-0">
            {!selectedWidgetForLink ? (
              <div className="space-y-2 min-w-0">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Seus Murais</Label>
                <div className="grid gap-1.5 pr-1 min-w-0">
                  {widgetsLoading ? (
                    <div className="py-4 text-center"><Loader2 className="animate-spin h-6 w-6 text-primary mx-auto" /></div>
                  ) : widgetsData && widgetsData.length > 0 ? (
                    widgetsData.map((w: any) => (
                      <Button 
                        key={w.id} 
                        variant="outline" 
                        className="w-full justify-between h-auto py-3 rounded-xl px-4 border-muted hover:border-primary group transition-all min-w-0"
                        onClick={() => {
                          setSelectedWidgetForLink(w);
                          setNewGoogleMapsUrl(w.googleMapsUrl || '');
                        }}
                      >
                        <div className="flex items-center gap-2.5 text-left flex-1 min-w-0">
                          <div className="bg-primary/5 p-1.5 rounded-lg group-hover:bg-primary/10 shrink-0">
                            <Layout className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold leading-tight truncate">{w.name}</p>
                            <p className="text-[8px] text-muted-foreground uppercase tracking-widest font-black mt-0.5">{w.googleMapsUrl ? 'Ativo' : 'Pendente'}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
                      </Button>
                    ))
                  ) : (
                    <div className="py-8 text-center border-2 border-dashed rounded-2xl">
                      <p className="text-[10px] text-muted-foreground">Nenhum mural criado.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200 min-w-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedWidgetForLink(null)}
                  className="px-0 text-primary hover:bg-transparent -ml-1 h-auto py-1 font-bold text-[10px]"
                >
                  <ArrowLeft className="w-3 h-3 mr-1.5" /> Voltar
                </Button>
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="google-url" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">URL Google Business</Label>
                  <Input 
                    id="google-url"
                    placeholder="https://g.page/..." 
                    value={newGoogleMapsUrl} 
                    onChange={(e) => setNewGoogleMapsUrl(e.target.value)}
                    className="h-10 rounded-xl border-primary/20 focus-visible:ring-primary/20 text-xs w-full"
                    autoFocus
                  />
                </div>
                <Button onClick={handleUpdateGoogleMapsUrl} disabled={isUpdatingUrl} className="w-full h-11 rounded-xl shadow-xl font-black text-xs transition-all hover:translate-y-[-1px]">
                  {isUpdatingUrl ? <Loader2 className="animate-spin mr-2 h-3.5 w-3.5" /> : <CheckCircle2 className="mr-2 h-3.5 w-3.5" />}
                  Salvar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="sm:max-w-xs w-[90vw] max-w-[95vw] rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-0 flex flex-col">
          <DialogHeader className="p-6 pt-12 pb-3 shrink-0 bg-background relative">
            <DialogTitle className="flex items-center gap-2 text-lg font-black font-headline">
              <QrCode className="w-5 h-5 text-primary" />
              Cartaz VIP
            </DialogTitle>
            <DialogDescription className="text-[10px]">
              Gere um cartaz profissional de balcão.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6 pt-0 flex flex-col items-center space-y-4">
            <div className="flex flex-col items-center gap-2 w-full border-b pb-4">
              <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Tema do Cartaz</Label>
              <div className="flex justify-center gap-3">
                <Button 
                  variant={pdfTheme === 'light' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setPdfTheme('light')}
                  className="gap-1.5 h-8 px-4 rounded-lg font-bold text-[10px] transition-all"
                >
                  <Sun className="w-3 h-3" /> Claro
                </Button>
                <Button 
                  variant={pdfTheme === 'dark' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setPdfTheme('dark')}
                  className="gap-1.5 h-8 px-4 rounded-lg font-bold text-[10px] transition-all"
                >
                  <Moon className="w-3 h-3" /> Escuro
                </Button>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl shadow-xl border-2 border-primary/5 transition-transform hover:scale-105">
              <QRCodeSVG 
                id="qr-code-svg"
                value={collectionLink} 
                size={160} 
                level="H"
                includeMargin={true}
              />
            </div>
            
            <div className="w-full pb-6">
              <Button 
                className="w-full h-12 shadow-xl font-black text-xs gap-2 rounded-xl transition-all hover:translate-y-[-1px]"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
              >
                {isGeneratingPdf ? (
                  <><Loader2 className="animate-spin" /> Gerando...</>
                ) : (
                  <><FileDown className="w-4 h-4" /> Baixar PDF</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
