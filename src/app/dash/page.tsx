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
  LayoutDashboard,
  Settings,
  LogOut,
  User,
  Loader2
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
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';

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

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const leadsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users'),
      where('isAdmin', '==', false),
      limit(5)
    );
  }, [db, user]);

  const { data: recentLeads, loading: leadsLoading } = useCollection(leadsQuery);

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Autenticando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card h-screen sticky top-0">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Zap className="w-6 h-6 text-primary" />
            <span className="font-headline">ProofWall</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dash">
            <Button variant="secondary" className="w-full justify-start gap-3">
              <LayoutDashboard className="w-4 h-4" /> Dash
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Users className="w-4 h-4" /> Gerenciar Leads
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start gap-3 opacity-50 cursor-not-allowed">
            <MessageSquare className="w-4 h-4" /> Widgets
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 opacity-50 cursor-not-allowed">
            <Settings className="w-4 h-4" /> Configurações
          </Button>
        </nav>
        <div className="p-4 border-t space-y-4">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Membro</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => signOut(auth)}>
            <LogOut className="w-4 h-4" /> Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 space-y-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Dash Geral</h1>
            <p className="text-muted-foreground">Bem-vindo ao seu painel, {user?.email}.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/signup">
              <Button variant="outline" size="sm">Ver Página de Cadastro</Button>
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
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="text-green-500 font-medium">+12%</span> em relação ao mês anterior
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
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="text-green-500 font-medium">+2.1%</span> nas últimas 24h
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
              <p className="text-xs text-muted-foreground">Em produção</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.9/5</div>
              <p className="text-xs text-muted-foreground">Baseado em 84 depoimentos</p>
            </CardContent>
          </Card>
        </div>

        {/* Middle Section: Chart and Recent Leads */}
        <div className="grid gap-6 md:grid-cols-7">
          <Card className="md:col-span-4 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline">Crescimento de Leads</CardTitle>
              <CardDescription>Número de novos inscritos nos últimos 7 dias.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={chartData}>
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
                <CardDescription>Últimos inscritos na lista VIP.</CardDescription>
              </div>
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="h-8 px-2">Ver todos</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leadsLoading ? (
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
                  <div className="py-10 text-center text-muted-foreground">
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
              <p className="text-sm text-muted-foreground">O módulo de depoimentos em vídeo está sendo preparado para sua conta VIP.</p>
              <Badge variant="secondary">Q4 2026</Badge>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
