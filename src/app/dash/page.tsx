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
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  MessageSquare,
  ArrowUpRight,
  Shield,
  LogOut,
  User,
  Loader2,
  Lock,
  ArrowLeft
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
      <header className="bg-background border-b h-16 flex items-center px-6 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-xl">
          <span className="font-headline hidden sm:inline">ProofWall</span>
        </div>
        
        <nav className="ml-8 hidden md:flex items-center gap-6">
          {userData?.isAdmin && (
            <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Administração</Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-sm font-semibold">{userData?.name || 'Usuário'}</span>
            <span className="text-[10px] uppercase text-muted-foreground">{userData?.isAdmin ? 'Admin' : 'Membro'}</span>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => signOut(auth)}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Painel de Controle</h1>
            <p className="text-muted-foreground text-gray-700">Bem-vindo de volta ao seu dashboard.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Ver Site
              </Button>
            </Link>
            <Button size="sm" className="shadow-lg">Criar Novo Widget</Button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">128</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 text-gray-700">
                <span className="text-green-500 font-medium">+12%</span>
              </p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24.8%</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 text-gray-700">
                <span className="text-green-500 font-medium">+2.1%</span>
              </p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Widgets Ativos</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground text-gray-700">Em produção</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.9/5</div>
              <p className="text-xs text-muted-foreground text-gray-700">Baseado em depoimentos</p>
            </CardContent>
          </Card>
        </div>

        {/* Middle Section: Chart and Recent Leads */}
        <div className="grid gap-6 md:grid-cols-7">
          <Card className="md:col-span-4 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline">Crescimento de Leads</CardTitle>
              <CardDescription className="text-gray-700">Número de novos inscritos nos últimos 7 dias.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                < BarChart data={chartData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="leads" 
                    fill="var(--color-leads)" 
                    radius={[4, 4, 0, 0]} 
                    barSize={30}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="md:col-span-3 border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-headline">Leads Recentes</CardTitle>
                <CardDescription className="text-gray-700">
                  {userData?.isAdmin ? 'Últimos inscritos na lista.' : 'Visualização restrita.'}
                </CardDescription>
              </div>
              {userData?.isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="h-8 px-2">Ver todos</Button>
                </Link>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!userData?.isAdmin ? (
                  <div className="py-10 text-center space-y-3">
                    <Lock className="h-8 w-8 text-muted-foreground mx-auto opacity-20" />
                    <p className="text-sm text-muted-foreground text-gray-700">Somente administradores podem ver a lista de leads.</p>
                  </div>
                ) : leadsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                        <div className="space-y-1">
                          <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                          <div className="h-2 w-32 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentLeads && recentLeads.length > 0 ? (
                  recentLeads.map((lead: any) => (
                    <div key={lead.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{lead.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-gray-400 group-hover:text-primary transition-colors">
                        Novo
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-muted-foreground text-gray-700">
                    Nenhum lead encontrado.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Area */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-none shadow-sm bg-primary text-primary-foreground overflow-hidden relative">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Shield className="h-5 w-5" /> Proteção Social Ativada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-primary-foreground/80 leading-relaxed">
                Seu widget está rodando com segurança. Todos os novos depoimentos passam por nossa camada de moderação automática.
              </p>
              <Button variant="secondary" className="w-fit gap-2">
                Revisar Regras <ArrowUpRight className="h-4 w-4" />
              </Button>
            </CardContent>
            <Zap className="absolute -bottom-6 -right-6 h-32 w-32 opacity-10 rotate-12" />
          </Card>

          <Card className="border-none shadow-sm border-2 border-dashed bg-transparent">
            <CardHeader>
              <CardTitle className="text-muted-foreground/60 font-headline">Funcionalidade em Breve</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center space-y-2">
              <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground text-gray-700">O módulo de depoimentos em vídeo está sendo preparado para sua conta VIP.</p>
              <Badge variant="secondary">Q4 2026</Badge>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}