
'use client';

import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Users, 
  Zap, 
  CheckCircle2, 
  MessageSquare,
  ArrowUpRight,
  LogOut,
  User,
  Loader2,
  Lock,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { 
  Bar, 
  BarChart, 
  XAxis, 
  YAxis, 
  CartesianGrid
} from 'recharts';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore, useCollection, useDoc, useAuth } from '@/firebase';
import { collection, query, where, limit, doc } from 'firebase/firestore';
import Link from 'next/link';
import { signOut } from 'firebase/auth';

const chartData = [
  { name: 'Seg', leads: 4 },
  { name: 'Ter', leads: 7 },
  { name: 'Qua', leads: 5 },
  { name: 'Qui', leads: 12 },
  { name: 'Sex', leads: 8 },
  { name: 'Sáb', leads: 15 },
  { name: 'Dom', leads: 10 },
];

const chartConfig = {
  leads: {
    label: 'Novos Leads',
    color: 'hsl(var(--primary))',
  },
};

export default function DashPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const userDocRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: userData, loading: userDataLoading } = useDoc(userDocRef);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const leadsQuery = useMemo(() => {
    if (!db || !user || !userData?.isAdmin) return null;
    return query(
      collection(db, 'users'),
      where('isAdmin', '==', false),
      limit(5)
    );
  }, [db, user, userData]);

  const { data: recentLeads, loading: leadsLoading } = useCollection(leadsQuery);

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
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 md:h-10 md:w-10" onClick={() => signOut(auth)}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">Painel de Controle</h1>
            <p className="text-sm md:text-base text-muted-foreground text-gray-700">Bem-vindo de volta ao seu painel</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/" className="flex-1 md:flex-none">
              <Button variant="outline" size="sm" className="w-full gap-2 text-xs md:text-sm">
                <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Ver Site</span><span className="sm:hidden">Site</span>
              </Button>
            </Link>
            <Button size="sm" className="flex-1 md:flex-none shadow-lg text-xs md:text-sm">Novo Widget</Button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 relative">
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
            {/* Seta indicativa externa apontando para o próximo card - Visível a partir de md */}
            <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 items-center justify-center bg-background rounded-full border shadow-lg p-1.5 z-30 group-hover:scale-110 transition-transform ring-4 ring-muted/20">
              <ArrowRight className="h-4 w-4 text-primary" />
            </div>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Widgets Ativos</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground text-gray-700 mt-1">Em produção</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.9/5</div>
              <p className="text-xs text-muted-foreground text-gray-700 mt-1">Baseado em depoimentos</p>
            </CardContent>
          </Card>
        </div>

        {/* Middle Section: Chart and Recent Leads */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
          <Card className="lg:col-span-4 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline text-lg md:text-xl">Crescimento de Leads</CardTitle>
              <CardDescription className="text-xs md:text-sm text-gray-700">Inscritos nos últimos 7 dias.</CardDescription>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              <ChartContainer config={chartConfig} className="h-[250px] md:h-[300px] w-full">
                <BarChart data={chartData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="leads" 
                    fill="var(--color-leads)" 
                    radius={[4, 4, 0, 0]} 
                    barSize={20}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="font-headline text-lg md:text-xl">Leads Recentes</CardTitle>
                <CardDescription className="text-xs text-gray-700">
                  {userData?.isAdmin ? 'Últimos inscritos.' : 'Visualização restrita.'}
                </CardDescription>
              </div>
              {userData?.isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">Ver todos</Button>
                </Link>
              )}
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-4">
                {!userData?.isAdmin ? (
                  <div className="py-12 text-center space-y-3">
                    <Lock className="h-8 w-8 text-muted-foreground mx-auto opacity-20" />
                    <p className="text-xs text-muted-foreground text-gray-700">Restrito para administradores.</p>
                  </div>
                ) : leadsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                        <div className="space-y-1 flex-1">
                          <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                          <div className="h-2 w-3/4 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentLeads && recentLeads.length > 0 ? (
                  recentLeads.map((lead: any) => (
                    <div key={lead.id} className="flex items-center justify-between group gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-primary/5 flex items-center justify-center text-primary border border-primary/10 shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 overflow-hidden">
                          <p className="text-xs md:text-sm font-medium truncate">{lead.name}</p>
                          <p className="text-[10px] md:text-xs text-muted-foreground truncate">{lead.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[8px] md:text-[10px] uppercase font-bold shrink-0 group-hover:text-primary transition-colors">
                        Novo
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-muted-foreground text-gray-700 text-sm">
                    Nenhum lead encontrado.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
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
                Seu widget está rodando com segurança. Novos depoimentos passam por moderação automática.
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
              <p className="text-xs md:text-sm text-muted-foreground text-gray-700 max-w-[200px] md:max-w-none">Depoimentos em vídeo chegando para sua conta em breve.</p>
              <Badge variant="secondary" className="text-[10px]">Q4 2026</Badge>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
