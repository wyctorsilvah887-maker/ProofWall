
'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Shield, LogOut, Users, UserCheck, Calendar, Lock, Mail, User, BadgeCheck, Loader2, Building2, Eye, EyeOff, Sun, Moon, Gem, TrendingUp, CreditCard, AlertCircle } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth, useFirestore, useUser, useCollection, useDoc } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, query, doc, setDoc, serverTimestamp, where, orderBy, limit } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const { theme, setTheme } = useTheme();
  
  const userDocRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: userData, loading: userDataLoading } = useDoc(userDocRef);
  
  const [isAdminVerified, setIsAdminVerified] = useState(false);

  useEffect(() => {
    if (userData?.isAdmin === true) {
      const timer = setTimeout(() => setIsAdminVerified(true), 500);
      return () => clearTimeout(timer);
    } else {
      setIsAdminVerified(false);
    }
  }, [userData]);

  const [accessCode, setAccessCode] = useState('');
  const [isCodeCorrect, setIsCodeCorrect] = useState(false);
  
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminRegistering, setIsAdminRegistering] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const leadsQuery = useMemo(() => {
    if (!db || !user || !isAdminVerified) return null;
    return query(
      collection(db, 'users'), 
      where('isAdmin', '==', false)
    );
  }, [db, user, isAdminVerified]);

  const { data: leadsList, loading: leadsLoading } = useCollection(leadsQuery);

  const paymentEventsQuery = useMemo(() => {
    if (!db || !user || !isAdminVerified) return null;
    return query(
      collection(db, 'payment_events'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }, [db, user, isAdminVerified]);

  const { data: paymentEvents, loading: eventsLoading } = useCollection(paymentEventsQuery);

  const sortedLeads = useMemo(() => {
    if (!leadsList) return [];
    return [...leadsList].sort((a: any, b: any) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [leadsList]);

  const handleAccessCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode === '2006') {
      setIsCodeCorrect(true);
      toast({ title: "Acesso Permitido", description: "Por favor, autentique-se." });
    } else {
      toast({ variant: "destructive", title: "Código Incorreto", description: "O código de acesso fornecido é inválido." });
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    try {
      if (isAdminRegistering) {
        if (!name.trim()) throw new Error("O nome é obrigatório.");
        if (!companyName.trim()) throw new Error("O nome da empresa é obrigatório.");
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        
        const slug = companyName.trim().toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');

        const adminData = {
          name: name.trim(),
          companyName: companyName.trim(),
          companySlug: slug,
          email: email.trim().toLowerCase(),
          isAdmin: true,
          testimonialsCount: 0,
          googleRedirectCount: 0,
          createdAt: serverTimestamp(),
        };

        await setDoc(doc(db, 'users', newUser.uid), adminData);
        toast({ title: "Conta Admin Criada", description: "Configurando seu acesso..." });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Bem-vindo", description: "Login administrativo realizado." });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro de Autenticação", description: error.message });
      setIsAuthLoading(false);
    }
  };

  if (authLoading || (user && userDataLoading)) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Sincronizando privilégios...</p>
        </div>
      </div>
    );
  }

  if (!isCodeCorrect && !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-primary">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline">Área Restrita</CardTitle>
            <CardDescription>Insira o código mestre para gerenciar os leads.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAccessCodeSubmit} className="space-y-4">
              <input
                type="password"
                placeholder="Código"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="text-center text-2xl tracking-[0.5em] w-full border rounded-md p-2 h-12 bg-background text-foreground"
                required
              />
              <Button type="submit" className="w-full h-12 text-lg">Desbloquear</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline">
              {isAdminRegistering ? 'Criar Admin' : 'Login Admin'}
            </CardTitle>
            <CardDescription>
              {isAdminRegistering ? 'Cadastre seu perfil administrativo.' : 'Acesse o painel de controle.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {isAdminRegistering && (
                <>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Nome Completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Nome da Empresa"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="E-mail admin"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button type="submit" className="w-full" disabled={isAuthLoading}>
                {isAuthLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                {isAdminRegistering ? 'Registrar' : 'Entrar'}
              </Button>
              <Button 
                type="button"
                variant="link" 
                className="w-full text-xs" 
                onClick={() => setIsAdminRegistering(!isAdminRegistering)}
              >
                {isAdminRegistering ? 'Já tem conta? Login' : 'Novo admin? Registrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userDataLoading && userData && !userData.isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md shadow-xl text-center">
          <CardHeader>
            <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>Sua conta não possui privilégios administrativos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => signOut(auth)} className="w-full">Sair e tentar outra conta</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 font-body text-foreground">
      <header className="bg-background border-b h-20 md:h-24 flex items-center px-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-xl relative w-[140px] h-[40px] md:w-[180px] md:h-[50px]">
          <Image src="/Logotipo%20PROOVA%20white%20mode.png" alt="Logo" fill className="rounded-2xl shadow-sm dark:hidden object-contain" />
          <Image src="/Logotipo%20PROOVA%20dark%20mode.png" alt="Logo" fill className="rounded-2xl shadow-sm hidden dark:block object-contain" />
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Badge variant="secondary" className="hidden sm:flex items-center gap-1.5">
            <BadgeCheck className="w-3 h-3" /> Administrador
          </Badge>
          <span className="text-sm text-muted-foreground hidden sm:inline-block">
            <span className="font-bold text-foreground">{userData?.companyName || user.email}</span>
          </span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 border border-primary/20">
                <User className="w-5 h-5 text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background border-border shadow-xl rounded-2xl p-2">
              <DropdownMenuLabel className="px-3 py-2">Opções de Admin</DropdownMenuLabel>
              <DropdownMenuSeparator className="mx-1" />
              
              <DropdownMenuItem onClick={() => router.push('/dash')} className="rounded-xl cursor-pointer font-bold py-2.5">
                <TrendingUp className="mr-2 h-4 w-4 text-primary" />
                <span>Painel de App</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => router.push('/pricing')} className="rounded-xl cursor-pointer font-bold py-2.5">
                <Gem className="mr-2 h-4 w-4 text-primary" />
                <span>Planos de Upgrade</span>
              </DropdownMenuItem>

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

              <DropdownMenuSeparator className="mx-1" />
              <DropdownMenuItem onClick={() => signOut(auth)} className="text-destructive focus:text-destructive rounded-xl cursor-pointer font-bold py-2.5">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="container mx-auto p-6 space-y-8">
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadsList?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Inscrições capturadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Eventos Webhook</CardTitle>
              <CreditCard className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentEvents?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Alertas de pagamento</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="leads" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="leads" className="gap-2"><Users className="w-4 h-4" /> Usuários e Leads</TabsTrigger>
            <TabsTrigger value="payments" className="gap-2"><CreditCard className="w-4 h-4" /> Auditoria de Pagamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="leads">
            <Card className="shadow-lg border-none">
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                  <UserCheck className="w-5 h-5" /> Gestão de Usuários
                </CardTitle>
                <CardDescription>Visualize e gerencie o status de cada lead.</CardDescription>
              </CardHeader>
              <CardContent>
                {leadsLoading ? (
                  <div className="py-20 text-center">
                    <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Carregando leads...</p>
                  </div>
                ) : leadsList && leadsList.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome / Empresa</TableHead>
                        <TableHead>E-mail / UID</TableHead>
                        <TableHead>Plano Atual</TableHead>
                        <TableHead>Registro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedLeads.map((usr: any) => (
                        <TableRow key={usr.id}>
                          <TableCell className="font-bold">
                            <div className="flex flex-col">
                              <span>{usr.name}</span>
                              <span className="text-[10px] text-muted-foreground font-normal uppercase tracking-widest">{usr.companyName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col text-xs">
                              <span className="font-medium text-primary">{usr.email}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">{usr.id}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={usr.membershipStatus === 'enterprise' ? 'default' : 'secondary'} className="uppercase text-[9px] font-black">
                              {usr.membershipStatus || 'Lead'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {usr.createdAt?.toDate ? usr.createdAt.toDate().toLocaleString('pt-BR') : 'Recentemente'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-20 text-center border-2 border-dashed rounded-lg bg-background">
                    <p className="text-muted-foreground">Nenhum lead registrado ainda.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card className="shadow-lg border-none">
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" /> Alertas de Webhook (Cakto)
                </CardTitle>
                <CardDescription>Logs em tempo real para controle de assinaturas e cancelamentos.</CardDescription>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="py-20 text-center">
                    <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Sincronizando eventos...</p>
                  </div>
                ) : paymentEvents && paymentEvents.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Evento / Status</TableHead>
                        <TableHead>E-mail / UID Vinculado</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Data do Evento</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentEvents.map((evt: any) => (
                        <TableRow key={evt.id} className={cn(evt.status === 'canceled' ? "bg-destructive/5" : "")}>
                          <TableCell>
                            <div className="flex flex-col">
                              <Badge variant={evt.status === 'approved' ? 'default' : (evt.status === 'canceled' ? 'destructive' : 'outline')} className="w-fit uppercase text-[9px] font-black">
                                {evt.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col text-xs">
                              <span className="font-medium">{evt.customerEmail}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">UID: {evt.externalId}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-bold">{evt.productName}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {evt.createdAt?.toDate ? evt.createdAt.toDate().toLocaleString('pt-BR') : 'Agora'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-20 text-center border-2 border-dashed rounded-lg bg-background">
                    <p className="text-muted-foreground">Nenhum evento de pagamento recebido ainda.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="py-8 border-t flex flex-col items-center gap-4 mt-12 bg-background/50">
        <div className="flex items-center gap-2 relative w-[48px] h-[48px] md:w-[56px] md:h-[56px]">
          <Image src="/Logotipo%20PROOVA%20white%20mode.png" alt="Logo Footer" fill className="rounded-xl dark:hidden object-contain" />
          <Image src="/Logotipo%20PROOVA%20dark%20mode.png" alt="Logo Footer" fill className="rounded-xl hidden dark:block" />
        </div>
        <div className="container px-4 md:px-6 mx-auto flex flex-col justify-center items-center gap-4 text-center">
          <p className="text-xs md:text-sm text-muted-foreground">© 2026 Proova - Administração Segura.</p>
        </div>
      </footer>
    </div>
  );
}
