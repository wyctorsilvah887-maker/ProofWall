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
  ArrowRight,
  ArrowDown,
  Share2,
  Copy,
  Link2,
  Star,
  Clock
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
import { useUser, useFirestore, useDoc, useAuth, useCollection } from '@/firebase';
import { doc, collection, query, limit } from 'firebase/firestore';
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
      })
      .slice(0, 5);
  }, [testimonialsData]);

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

  const collectionLink = `${baseUrl}/c/${companySlug}`;
  const widgetScript = `<script src="${baseUrl}/widget.js" defer></script>`;

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col font-body">
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

      <main className="flex-1 p-4 md:p-8 space-y-8 md:space-y-12 max-w-7xl mx-auto w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight text-gray-900">Painel de Controle</h1>
            <p className="text-sm md:text-base text-muted-foreground text-gray-600">Gestão de prova social dinâmica</p>
          </div>
        </header>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 relative">
          <Card className="border-none shadow-sm group cursor-default relative overflow-visible">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Resumo</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div>
                <div className="text-xl md:text-2xl font-bold">Avaliações Recebidas {testimonialsData?.length || 0}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 text-gray-700 mt-1">
                  Total de depoimentos coletados
                </p>
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
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground text-gray-700 mt-1">Redirecionados ao Google Maps</p>
            </CardContent>
          </Card>
        </div>

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
            ) : sortedTestimonials.length > 0 ? (
              sortedTestimonials.map((t: any) => (
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
      </main>
    </div>
  );
}