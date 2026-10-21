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
  Inbox,
  Save,
  Gem,
  ExternalLink,
  Lock,
  AlertTriangle,
  Fingerprint,
  X,
  Megaphone
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
import { doc, collection, query, updateDoc, orderBy, limit, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { toast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { useTheme } from 'next-themes';
import { jsPDF } from 'jspdf';
import { cn } from '@/lib/utils';

export default function DashPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [baseUrl, setBaseUrl] = useState('');
  
  // Dialog States
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [isGoogleMapsDialogOpen, setIsGoogleMapsDialogOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isSlugDialogOpen, setIsSlugDialogOpen] = useState(false);
  
  // Feature States
  const [selectedWidgetForLink, setSelectedWidgetForLink] = useState<any>(null);
  const [newGoogleMapsUrl, setNewGoogleMapsUrl] = useState('');
  const [isUpdatingUrl, setIsUpdatingUrl] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfTheme, setPdfTheme] = useState<'light' | 'dark'>('light');

  // Slug States
  const [tempSlug, setTempSlug] = useState('');
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  const userDocRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: userData, loading: userDataLoading } = useDoc(userDocRef);

  // Fetch Announcements
  const announcementsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'announcements'), where('isActive', '==', true), orderBy('createdAt', 'desc'), limit(1));
  }, [db]);
  
  const { data: activeAnnouncements, error: announcementsError } = useCollection(announcementsQuery);
  const currentAnnouncement = announcementsError ? null : activeAnnouncements?.[0];
  const [isAnnouncementDismissed, setIsAnnouncementDismissed] = useState(false);

  const isProPlan = useMemo(() => {
    const status = userData?.membershipStatus;
    return status === 'gold' || status === 'enterprise' || status === 'trial';
  }, [userData]);

  const membershipLabel = useMemo(() => {
    const status = userData?.membershipStatus;
    if (status === 'enterprise') return 'Membro Enterprise';
    if (status === 'gold') return 'Membro Gold';
    if (status === 'trial') return 'Período Trial';
    if (status === 'expired') return 'Plano Expirado';
    return 'Plano Base';
  }, [userData]);

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

  useEffect(() => {
    if (userData?.membershipStatus === 'trial' && userData?.trialStartedAt && db && user) {
      const startedAt = userData.trialStartedAt.toDate?.() || new Date(userData.trialStartedAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - startedAt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 14) {
        updateDoc(doc(db, 'users', user.uid), {
          membershipStatus: 'expired'
        });
        toast({
          variant: "destructive",
          title: "Período Trial Expirado",
          description: "Escolha um plano profissional para continuar usando o Proova.",
        });
        router.push('/pricing');
      }
    }
  }, [userData, db, user, router]);

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
    return userData?.companySlug || '';
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

  const totalGoogleRedirects = userData?.googleRedirectCount || 0;

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${description} copiado para a área de transferência.`,
    });
  };

  const handleUpdateGoogleMapsUrl = async () => {
    if (!db || !user || isUpdatingUrl) return;
    
    setIsUpdatingUrl(true);
    const userRef = doc(db, 'users', user.uid);
    
    updateDoc(userRef, {
      googleMapsUrl: newGoogleMapsUrl.trim()
    })
      .then(() => {
        toast({ title: "Link Atualizado", description: `Link do Google Business salvo com sucesso.` });
        setIsGoogleMapsDialogOpen(false);
        setNewGoogleMapsUrl('');
      })
      .catch((err) => {
        console.error("Erro ao atualizar URL:", err);
      })
      .finally(() => {
        setIsUpdatingUrl(false);
      });
  };

  const handleUpdateSlug = async () => {
    if (!db || !user || isCheckingSlug || !tempSlug.trim()) return;
    
    const normalizedSlug = tempSlug.trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    if (normalizedSlug === companySlug) {
      setIsSlugDialogOpen(false);
      return;
    }

    if (normalizedSlug.length < 3) {
      setSlugError("O link deve ter pelo menos 3 caracteres.");
      return;
    }

    setIsCheckingSlug(true);
    setSlugError(null);

    try {
      const q = query(collection(db, 'users'), where('companySlug', '==', normalizedSlug));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        setSlugError("Este link já está sendo usado por outra empresa.");
        setIsCheckingSlug(false);
        return;
      }

      await updateDoc(doc(db, 'users', user.uid), {
        companySlug: normalizedSlug
      });

      toast({
        title: "Link Personalizado!",
        description: "Sua nova URL de coleta já está ativa.",
      });
      setIsSlugDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Erro na atualização", description: "Não foi possível mudar o link agora." });
    } finally {
      setIsCheckingSlug(false);
    }
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

  const collectionLink = `${baseUrl}/c/${companySlug}`;

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col font-body text-foreground overflow-x-hidden">
      {/* GLOBAL ANNOUNCEMENT BANNER - MARQUEE LOOP */}
      {currentAnnouncement && !isAnnouncementDismissed && (
        <div className={cn(
          "w-full py-2.5 flex items-center relative overflow-hidden transition-all duration-500 z-[100]",
          currentAnnouncement.type === 'info' && "bg-blue-600 text-white",
          currentAnnouncement.type === 'warning' && "bg-orange-500 text-white",
          currentAnnouncement.type === 'success' && "bg-green-600 text-white",
          currentAnnouncement.type === 'destructive' && "bg-red-600 text-white"
        )}>
          {/* Animated Background Pulse */}
          <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
          
          <div className="flex-1 overflow-hidden flex items-center relative z-10">
            <div className="flex animate-marquee whitespace-nowrap gap-12 items-center min-w-full">
              {/* Iterating multiple times to fill screen and loop seamlessly */}
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-2">
                  <Megaphone className="w-3.5 h-3.5" />
                  <div className="flex items-center gap-2">
                    <span className="font-black uppercase tracking-widest text-[10px]">
                      {currentAnnouncement.title}:
                    </span>
                    <p className="text-[10px] md:text-xs font-bold opacity-95">
                      {currentAnnouncement.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => setIsAnnouncementDismissed(true)}
            className="p-2 mr-2 rounded-full hover:bg-black/10 transition-colors shrink-0 z-20 relative bg-inherit backdrop-blur-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <header className="bg-background border-b h-20 md:h-28 flex items-center px-4 md:px-8 sticky top-0 z-[60] shadow-sm backdrop-blur-md bg-background/95">
        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/dash" className="flex items-center gap-2 group">
            <div className="relative w-[210px] h-[70px] md:w-[320px] md:h-[100px] transition-transform group-hover:scale-105">
              <Image src="/Logotipo%20PROOVA%20white%20mode%201.png" alt="Logo" fill className="object-contain dark:hidden" priority />
              <Image src="/Logotipo%20PROOVA%20dark%20mode%201.png" alt="Logo" fill className="object-contain hidden dark:block" priority />
            </div>
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-12 px-2 gap-2 rounded-xl hover:bg-primary/5 group transition-all active:bg-primary/10">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold truncate max-w-[80px] sm:max-w-[120px] md:max-w-[200px] transition-colors group-hover:text-primary leading-tight">
                    {userData?.companyName || 'Minha Empresa'}
                  </span>
                  <span className={cn(
                    "text-[8px] uppercase tracking-widest font-black leading-tight",
                    userData?.membershipStatus === 'enterprise' ? "text-primary animate-pulse" : "text-muted-foreground"
                  )}>
                    {membershipLabel}
                  </span>
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
              <DropdownMenuItem onClick={() => router.push('/dash')} className="rounded-xl cursor-pointer font-bold py-2.5 bg-primary/5 text-primary">
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
              <DropdownMenuItem onClick={() => router.push('/pricing')} className="rounded-xl cursor-pointer font-bold py-2.5">
                <Gem className="mr-2 h-4 w-4 text-primary" />
                <span>Planos de Upgrade</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsTutorialOpen(true)} className="rounded-xl cursor-pointer font-bold py-2.5">
                <Info className="mr-2 h-4 w-4 text-primary" />
                <span>Tutorial</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="mx-1" />
              <DropdownMenuItem 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="rounded-xl cursor-pointer font-bold py-2.5"
              >
                {theme === 'light' ? (
                  <Moon className="mr-2 h-4 w-4 text-primary" />
                ) : (
                  <Sun className="mr-2 h-4 w-4 text-primary" />
                )}
                <span>Alternar Tema</span>
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

      <main className="flex-1 p-4 md:p-8 space-y-8 md:space-y-12 max-w-7xl mx-auto w-full overflow-x-hidden">
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

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 relative">
          <Card className="border-none shadow-sm group cursor-default relative overflow-hidden rounded-2xl">
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
          </Card>

          <div className="relative group">
            <div 
              onClick={() => {
                setNewGoogleMapsUrl(userData?.googleMapsUrl || '');
                setIsGoogleMapsDialogOpen(true);
              }}
              className="absolute -top-3 right-4 z-40 bg-primary text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 ring-2 ring-white"
            >
              <span className="flex items-center gap-1.5"><Edit3 className="w-2.5 h-2.5" /> Configurar Link</span>
            </div>
            <Card className="border-none shadow-sm relative overflow-hidden rounded-2xl h-full">
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
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-primary" /> Link de Coleta & QR Code
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setTempSlug(companySlug);
                    setSlugError(null);
                    setIsSlugDialogOpen(true);
                  }}
                  className="h-7 text-[10px] font-black uppercase tracking-widest gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                >
                  {isProPlan ? <Fingerprint className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  Personalizar Link
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="bg-muted/30 font-mono text-[10px] md:text-xs h-10 border flex items-center px-3 flex-1 rounded-xl overflow-x-auto whitespace-nowrap scrollbar-hide select-all relative group">
                  {collectionLink}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm px-1.5 py-0.5 rounded border border-primary/20 text-[8px] font-black text-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Ativo</div>
                </div>
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
                    <span className="whitespace-nowrap">Gerar Cartaz</span>
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

      <footer className="py-8 md:py-16 border-t flex flex-col items-center gap-8 mt-auto">
        <div className="flex items-center gap-2 relative w-[210px] h-[70px] md:w-[320px] md:h-[100px]">
          <Image src="/Logotipo%20PROOVA%20white%20mode%201.png" alt="Logo Footer" fill className="object-contain dark:hidden" />
          <Image src="/Logotipo%20PROOVA%20dark%20mode%201.png" alt="Logo Footer" fill className="object-contain hidden dark:block" />
        </div>
        <div className="container px-4 md:px-6 mx-auto flex flex-col justify-center items-center gap-4 text-center">
          <p className="text-xs md:text-sm text-muted-foreground">© 2026 Proova - Prova Social de Verdade.</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">
            Feito Pelo Grupo Synapse | Synapse Group
          </p>
        </div>
      </footer>

      {/* Identity Dialog */}
      <Dialog open={isSlugDialogOpen} onOpenChange={setIsSlugDialogOpen}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          {isProPlan ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black font-headline flex items-center gap-2">
                  <Fingerprint className="w-6 h-6 text-primary" /> Identidade do Link
                </DialogTitle>
                <DialogDescription>
                  Personalize o final da sua URL de coleta. Links curtos convertem mais!
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="slug-input" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nova URL de Coleta</Label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-muted-foreground/60 pointer-events-none select-none">proova.../c/</span>
                    <Input 
                      id="slug-input"
                      placeholder="minha-loja"
                      value={tempSlug}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                        setTempSlug(val);
                        setSlugError(null);
                      }}
                      className="h-14 pl-28 rounded-2xl border-2 focus:ring-primary/20 text-sm font-bold"
                    />
                  </div>
                  {slugError && <p className="text-[10px] text-destructive font-bold flex items-center gap-1 animate-in slide-in-from-top-1"><AlertTriangle className="w-3 h-3" /> {slugError}</p>}
                </div>

                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex gap-3 items-start">
                   <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                   <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                     <strong className="text-foreground">Aviso Importante:</strong> Ao mudar seu link personalizado, os links e QR codes impressos anteriormente <strong className="text-destructive">deixarão de funcionar</strong> instantaneamente.
                   </p>
                </div>
              </div>
              <DialogFooter>
                <Button className="w-full font-black h-12 rounded-2xl shadow-xl gap-2" onClick={handleUpdateSlug} disabled={isCheckingSlug}>
                  {isCheckingSlug ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />}
                  Atualizar Identidade
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="text-center py-6 space-y-6">
              <div className="mx-auto bg-primary/10 p-5 rounded-full w-fit text-primary animate-pulse">
                <Gem className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <DialogTitle className="text-2xl font-black font-headline">Recurso Profissional</DialogTitle>
                <DialogDescription className="max-w-[280px] mx-auto">
                  A personalização de links (URLs memoráveis) é exclusiva para membros ativos em planos profissionais.
                </DialogDescription>
              </div>
              <div className="pt-2">
                 <Button className="w-full h-14 rounded-2xl text-lg font-black shadow-xl" onClick={() => router.push('/pricing')}>
                   Ver Planos e Upgrade
                 </Button>
                 <Button variant="ghost" className="w-full mt-2 text-xs font-bold text-muted-foreground" onClick={() => setIsSlugDialogOpen(false)}>Depois</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tutorial Dialog */}
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
      
      {/* Google Maps Configuration Dialog */}
      <Dialog open={isGoogleMapsDialogOpen} onOpenChange={setIsGoogleMapsDialogOpen}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black font-headline flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" /> Configurar Google Business
            </DialogTitle>
            <DialogDescription>
              Insira o link direto da sua empresa no Google Maps para turbinar suas avaliações 5 estrelas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="google-url" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Link do Google Maps</Label>
              <Input 
                id="google-url"
                placeholder="https://g.page/r/sua-empresa/review"
                value={newGoogleMapsUrl}
                onChange={(e) => setNewGoogleMapsUrl(e.target.value)}
                className="h-12 rounded-xl"
              />
              <p className="text-[10px] text-muted-foreground">Clientes que avaliarem com 4 ou 5 estrelas verão um botão para replicar o elogio no Google.</p>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full font-black h-12 rounded-2xl shadow-xl" onClick={handleUpdateGoogleMapsUrl} disabled={isUpdatingUrl}>
              {isUpdatingUrl ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar Configuração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* QR Code Dialog */}
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="rounded-[2.5rem] sm:max-w-md border-none shadow-2xl overflow-hidden p-0">
          <DialogHeader className="p-8 pt-10 pb-4 bg-background">
            <DialogTitle className="text-2xl font-black font-headline text-center">Cartaz de Balcão</DialogTitle>
            <DialogDescription className="text-center">Imprima seu QR Code para coletar elogios presencialmente.</DialogDescription>
          </DialogHeader>
          
          <div className="p-8 space-y-8 flex flex-col items-center">
            <div className="p-6 bg-white rounded-3xl shadow-inner border-4 border-primary/10">
              <QRCodeSVG 
                id="qr-code-svg"
                value={collectionLink} 
                size={180}
                level="H"
                includeMargin={false}
                className="max-w-full h-auto"
              />
            </div>

            <div className="w-full space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center block">Escolha o Tema do Cartaz</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={pdfTheme === 'light' ? 'default' : 'outline'}
                  onClick={() => setPdfTheme('light')}
                  className="rounded-xl h-10 text-xs font-bold"
                >
                  <Sun className="w-3.5 h-3.5 mr-2" /> Claro
                </Button>
                <Button 
                  variant={pdfTheme === 'dark' ? 'default' : 'outline'}
                  onClick={() => setPdfTheme('dark')}
                  className="rounded-xl h-10 text-xs font-bold"
                >
                  <Moon className="w-3.5 h-3.5 mr-2" /> Escuro
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 pt-0 pb-10 bg-background">
            <Button 
              className="w-full h-14 rounded-2xl text-lg font-black shadow-xl gap-2" 
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? <Loader2 className="animate-spin" /> : <Download className="w-5 h-5" />}
              Baixar Cartaz PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
