'use client';

import { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Zap, 
  CheckCircle2, 
  MessageSquare,
  ArrowUpRight,
  LogOut,
  User,
  Loader2,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  Share2,
  Copy,
  Link2
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
import { useUser, useFirestore, useDoc, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { toast } from '@/hooks/use-toast';

export default function DashPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const [baseUrl, setBaseUrl] = useState('');

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

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${description} copiado para a área de transferência.`,
    });
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

  const companySlug = userData?.companyName?.toLowerCase().replace(/\s+/g, '-') || user?.uid.substring(0, 6);
  const collectionLink = `${baseUrl}/c/${companySlug}`;
  const widgetScript = `<script src="${baseUrl}/widget.js" defer></script>`;

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col font-body">
      {/* Top Navigation Header */}
      <header className="bg-background border-b h-16 flex items-center px-4 md:px-6 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-lg md:text-xl">
          <span className="font-headline text-primary">ProofWall</span>
        </div>
        
        <nav className="ml-8 hidden md:flex items-center gap-6">
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
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut(auth)} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 space-y-8 md:space-y-12 max-w-7xl mx-auto w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight text-gray-900">Painel de Controle</h1>
            <p className="text-sm md:text-base text-muted-foreground text-gray-600">Gestão de prova social dinâmica</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Button size="sm" className="flex-1 md:flex-none shadow-lg text-xs md:text-sm">Novo Widget</Button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 relative">
          <Card className="border-none shadow-sm group cursor-default relative overflow-visible">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Resumo</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div>
                <div className="text-xl md:text-2xl font-bold">Avaliações Recebidas 128</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 text-gray-700 mt-1">
                  <span className="text-green-500 font-medium">+12%</span> este mês
                </p>
              </div>
            </CardContent>
            
            {/* Seta indicativa Desktop (Direita) */}
            <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 items-center justify-center bg-background rounded-full border shadow-lg p-1.5 z-30 group-hover:scale-110 transition-transform ring-4 ring-muted/20">
              <ArrowRight className="h-4 w-4 text-primary" />
            </div>

            {/* Seta indicativa Mobile (Baixo) */}
            <div className="flex md:hidden absolute -bottom-5 left-1/2 -translate-x-1/2 items-center justify-center bg-background rounded-full border shadow-lg p-1.5 z-30 transition-transform ring-4 ring-muted/20">
              <ArrowDown className="h-4 w-4 text-primary" />
            </div>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Redirecionados Google</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85</div>
              <p className="text-xs text-muted-foreground text-gray-700 mt-1">Redirecionados ao Google Maps</p>
            </CardContent>
          </Card>
        </div>

        {/* Section: Compartilhar / Coletar */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold font-headline tracking-tight">Compartilhar / Coletar</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-sm overflow-hidden group">
              <div className="h-1 w-full bg-primary/20 group-hover:bg-primary transition-colors" />
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900">
                  <Link2 className="w-4 h-4 text-primary" /> Link de Coleta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-gray-600 leading-relaxed">
                  Envie este link direto para seus clientes via WhatsApp para coletar novos depoimentos.
                </p>
                <div className="flex gap-2">
                  <Input 
                    readOnly 
                    value={collectionLink} 
                    className="bg-muted/30 font-mono text-[10px] md:text-xs h-9 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                  />
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="shrink-0 h-9 w-9"
                    onClick={() => copyToClipboard(collectionLink, "Link de coleta")}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden group">
              <div className="h-1 w-full bg-primary/20 group-hover:bg-primary transition-colors" />
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900">
                  <Zap className="w-4 h-4 text-primary" /> Instalação no Site
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-gray-600 leading-relaxed">
                  Copie o snippet oficial da sua conta e cole no seu site para exibir o mural.
                </p>
                <div className="flex gap-2">
                  <Input 
                    readOnly 
                    value={widgetScript} 
                    className="bg-muted/30 font-mono text-[10px] md:text-xs h-9 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                  />
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="shrink-0 h-9 w-9"
                    onClick={() => copyToClipboard(widgetScript, "Código do widget")}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Area */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <Card className="border-none shadow-sm bg-primary text-primary-foreground overflow-hidden relative">
            <CardHeader>
              <CardTitle className="font-headline text-lg md:text-xl flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" /> Proteção Ativada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <p className="text-xs md:text-sm text-primary-foreground/80 leading-relaxed max-w-[90%]">
                Seu widget está rodando com segurança. Novos depoimentos passam por moderação antes da publicação.
              </p>
              <Button variant="secondary" size="sm" className="w-fit gap-2 text-xs md:text-sm">
                Revisar Regras <ArrowUpRight className="h-4 w-4" />
              </Button>
            </CardContent>
            <Zap className="absolute -bottom-6 -right-6 h-24 w-24 md:h-32 md:w-32 opacity-10 rotate-12" />
          </Card>

          <Card className="border-none shadow-sm border-2 border-dashed bg-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground/60 font-headline text-lg md:text-xl">Novidades</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6 md:py-8 text-center space-y-2">
              <MessageSquare className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground/30 mb-1" />
              <p className="text-xs md:text-sm text-muted-foreground text-gray-700 max-w-[200px] md:max-w-none">Depoimentos em vídeo 4K chegando para sua conta em breve.</p>
              <Badge variant="secondary" className="text-[10px]">Q4 2026</Badge>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
