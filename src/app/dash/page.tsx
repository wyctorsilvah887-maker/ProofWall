
'use client';

import { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
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
  Eye,
  Layout,
  Plus,
  QrCode,
  Download,
  Printer,
  MapPin,
  TrendingUp,
  Shield
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
import { useUser, useFirestore, useDoc, useAuth, useCollection } from '@/firebase';
import { doc, collection, query, limit } from 'firebase/firestore';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { toast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';

export default function DashPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const [baseUrl, setBaseUrl] = useState('');
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);

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

  const companySlug = useMemo(() => {
    if (!userData) return '';
    return userData.companySlug || userData?.companyName?.toLowerCase().replace(/\s+/g, '-') || '';
  }, [userData]);

  const testimonialsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'testimonials'),
      limit(10)
    );
  }, [db, user]);

  const { data: testimonialsData, loading: testimonialsLoading } = useCollection(testimonialsQuery);

  const sortedTestimonials = useMemo(() => {
    if (!testimonialsData) return [];
    return [...testimonialsData]
      .sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
  }, [testimonialsData]);

  const displayTestimonials = useMemo(() => sortedTestimonials.slice(0, 5), [sortedTestimonials]);

  useEffect(() => {
    if (displayTestimonials.length > 1) {
      const interval = setInterval(() => {
        setPreviewIndex((prev) => (prev + 1) % displayTestimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [displayTestimonials]);

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${description} copiado para a área de transferência.`,
    });
  };

  const handlePrintQr = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const svgElement = document.getElementById('qr-code-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir QR Code de Balcão - Proova</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
            h1 { margin-bottom: 20px; color: #f97316; font-size: 2.5rem; }
            .container { text-align: center; border: 4px solid #f97316; padding: 60px; border-radius: 40px; }
            p { margin-top: 30px; color: #333; font-size: 1.8rem; font-weight: bold; }
            .logo { margin-bottom: 20px; color: #f97316; font-weight: bold; font-size: 1.2rem; text-transform: uppercase; letter-spacing: 0.2em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">Proova</div>
            <h1>${userData?.companyName || 'Sua Empresa'}</h1>
            ${svgData}
            <p>Escaneie e deixe seu depoimento!</p>
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (authLoading || userDataLoading || (user && !userData)) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" />
          <p className="text-muted-foreground font-medium text-gray-700">Autenticando perfil...</p>
        </div>
      </div>
    );
  }

  const collectionLink = `${baseUrl}/c/${companySlug}`;

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col font-body">
      <header className="bg-background border-b h-16 flex items-center px-4 md:px-6 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-lg md:text-xl">
          <span className="font-headline text-primary">Proova</span>
        </div>
        
        <nav className="ml-8 hidden md:flex items-center gap-6">
          <Link href="/dash" className="text-sm font-medium text-primary transition-colors">Dash</Link>
          <Link href="/widgets" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Widgets</Link>
          {userData?.isAdmin && (
            <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Administração</Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <div className="flex flex-col items-end mr-1 md:mr-2">
            <span className="text-xs md:text-sm font-semibold truncate max-w-[120px] md:max-w-none">
              {userData?.companyName || 'Minha Empresa'}
            </span>
            <span className="text-[9px] md:text-[10px] uppercase text-muted-foreground tracking-tighter md:tracking-normal">
              {userData?.isAdmin ? 'Admin' : 'Membro'}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 md:h-10 md:w-10 border border-primary/20">
                <User className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dash')} className="cursor-pointer md:hidden">
                <TrendingUp className="mr-2 h-4 w-4" />
                <span>Dash</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/widgets')} className="cursor-pointer">
                <Layout className="mr-2 h-4 w-4" />
                <span>Meus Widgets</span>
              </DropdownMenuItem>
              {userData?.isAdmin && (
                <DropdownMenuItem onClick={() => router.push('/admin')} className="cursor-pointer md:hidden">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Administração</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut(auth)} className="text-destructive focus:text-destructive cursor-pointer">
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
            <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight text-gray-900">Painel de Controle</h1>
            <p className="text-sm md:text-base text-muted-foreground text-gray-600">Gestão de prova social dinâmica</p>
          </div>
          <Link href="/widgets" className="w-full md:w-auto">
            <Button className="w-full md:w-auto shadow-lg hover:shadow-xl transition-all" size="lg">
              <Plus className="w-5 h-5 mr-2" /> Novo Widget
            </Button>
          </Link>
        </header>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 relative">
          <Card className="border-none shadow-sm group cursor-default relative overflow-visible">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Resumo</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                  {testimonialsData?.length || 0} <span className="text-lg font-medium text-muted-foreground">avaliações recebidas</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-none text-[10px] h-5 px-1.5">
                    +100%
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

          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Redirecionados Google</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">--</div>
                <Badge variant="secondary" className="text-[10px] h-5 bg-primary/10 text-primary border-none">
                  Em breve
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground text-gray-700 mt-1">Redirecionados ao Google Maps</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold font-headline tracking-tight">Compartilhar / Coletar</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-1">
            <Card className="border-none shadow-sm overflow-hidden group">
              <div className="h-1 w-full bg-primary/20 group-hover:bg-primary transition-colors" />
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900">
                  <Link2 className="w-4 h-4 text-primary" /> Link de Coleta & QR Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-gray-600 leading-relaxed">
                  Envie este link direto para seus clientes via WhatsApp ou gere o <strong>QR Code de Balcão</strong> para coletar depoimentos no seu estabelecimento físico.
                </p>
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
                      title="Copiar Link"
                    >
                      <Copy className="h-4 w-4 sm:mr-0 mr-2" />
                      <span className="sm:hidden font-bold">Copiar Link</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-10 border-primary/20 text-primary hover:bg-primary/5 flex-1 sm:flex-none gap-2 font-bold justify-center px-4"
                      onClick={() => setIsQrDialogOpen(true)}
                    >
                      <QrCode className="h-4 w-4" />
                      <span>QR de Balcão</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold font-headline tracking-tight">Últimos Depoimentos</h2>
            </div>
            
            <div className="grid gap-4">
              {testimonialsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                </div>
              ) : displayTestimonials.length > 0 ? (
                displayTestimonials.map((t: any) => (
                  <Card key={t.id} className="border-none shadow-sm overflow-hidden">
                    <CardContent className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-2 rounded-full hidden sm:block">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm md:text-base">{t.userName}</span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: t.rating || 5 }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 italic line-clamp-2 md:line-clamp-none">
                            "{t.text}"
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString('pt-BR') : 'Hoje'}
                        </div>
                        <Badge variant={t.status === 'approved' ? 'default' : 'secondary'} className="capitalize text-[10px]">
                          {t.status === 'approved' ? 'Aprovado' : 'Pendente'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-2xl bg-muted/10">
                  <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhum depoimento recebido ainda.</p>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">Compartilhe seu link de coleta acima</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold font-headline tracking-tight">Visualização ao Vivo</h2>
            </div>
            
            <Card className="border-none shadow-xl bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden relative min-h-[400px] flex flex-col items-center justify-center p-6 text-center">
              <div className="absolute top-4 left-4">
                <Layout className="w-4 h-4 text-primary/40" />
              </div>
              
              <div className="space-y-4 mb-8">
                <h3 className="text-lg font-bold font-headline">Simulação do Widget</h3>
                <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                  Assim é como seus visitantes verão os depoimentos no canto do seu site.
                </p>
              </div>

              <div className="relative w-full h-full flex items-center justify-center">
                {displayTestimonials.length > 0 ? (
                  <div 
                    key={displayTestimonials[previewIndex].id}
                    className="absolute bottom-4 right-0 left-0 animate-in slide-in-from-bottom-8 duration-500 fade-in-0"
                  >
                    <div className="bg-background rounded-2xl p-4 shadow-2xl border-2 border-primary/20 text-left max-w-[280px] mx-auto">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-primary/10 p-1.5 rounded-full">
                          <User className="w-3 h-3 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold leading-tight">{displayTestimonials[previewIndex].userName}</p>
                          <div className="flex gap-0.5">
                            {Array.from({ length: displayTestimonials[previewIndex].rating || 5 }).map((_, i) => (
                              <Star key={i} className="w-2 h-2 fill-primary text-primary" />
                            ))}
                          </div>
                        </div>
                        <Badge className="ml-auto text-[8px] h-4 px-1 bg-green-500/10 text-green-600 hover:bg-green-500/10 border-none">
                          Verificado
                        </Badge>
                      </div>
                      <p className="text-[11px] text-gray-700 italic line-clamp-2 leading-relaxed">
                        "{displayTestimonials[previewIndex].text}"
                      </p>
                      <div className="mt-2 pt-2 border-t border-muted flex items-center justify-between">
                        <span className="text-[8px] text-muted-foreground uppercase font-semibold tracking-tighter">
                          Proova Social Proof
                        </span>
                        <Zap className="w-2.5 h-2.5 text-primary animate-pulse" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/20 border-2 border-dashed rounded-2xl p-8 text-muted-foreground flex flex-col items-center gap-3">
                    <MessageSquare className="w-8 h-8 opacity-20" />
                    <p className="text-[10px] uppercase font-bold tracking-widest">Aguardando Dados</p>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-6 w-full">
                <Button variant="outline" className="w-full text-xs h-8 border-primary/20 text-primary hover:bg-primary/5" onClick={() => router.push('/widgets')}>
                  Personalizar Design
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <QrCode className="w-6 h-6 text-primary" />
              QR Code de Balcão
            </DialogTitle>
            <DialogDescription className="text-base">
              Perfeito para imprimir e deixar no seu balcão ou mesas. Seus clientes podem escanear este código para deixar um depoimento rapidamente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-6 space-y-6">
            <div className="p-6 bg-white rounded-3xl shadow-inner border-4 border-primary/20">
              <QRCodeSVG 
                id="qr-code-svg"
                value={collectionLink} 
                size={240} 
                level="H"
                includeMargin={true}
              />
            </div>
            
            <div className="flex flex-col gap-3 w-full">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 border-primary text-primary hover:bg-primary/5"
                  onClick={handlePrintQr}
                >
                  <Printer className="w-5 h-5 mr-2" /> Imprimir p/ Balcão
                </Button>
                <Button 
                  className="flex-1 h-12 shadow-lg"
                  onClick={() => {
                    const svg = document.getElementById('qr-code-svg');
                    if (!svg) return;
                    const svgData = new XMLSerializer().serializeToString(svg);
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const img = new Image();
                    img.onload = () => {
                      canvas.width = img.width;
                      canvas.height = img.height;
                      ctx?.drawImage(img, 0, 0);
                      const pngUrl = canvas.toDataURL('image/png');
                      const downloadLink = document.createElement('a');
                      downloadLink.href = pngUrl;
                      downloadLink.download = `qrcode-balcao-proova-${companySlug}.png`;
                      downloadLink.click();
                    };
                    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                    toast({ title: "Download Iniciado", description: "O arquivo PNG do QR Code está sendo baixado." });
                  }}
                >
                  <Download className="w-5 h-5 mr-2" /> Baixar PNG
                </Button>
              </div>
              <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-widest pt-2 px-4">
                Dica: Imprima em papel fotográfico para melhor durabilidade no seu balcão.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
