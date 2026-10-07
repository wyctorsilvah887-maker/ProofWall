'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Shield, LogOut, Users, UserCheck, Calendar, Lock, Mail, User, BadgeCheck, Loader2, Building2 } from 'lucide-react';
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
import { collection, query, doc, setDoc, serverTimestamp, where } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function AdminPage() {
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  
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
        
        const slug = companyName.trim().toLowerCase().replace(/\s+/g, '-');

        const adminData = {
          name: name.trim(),
          companyName: companyName.trim(),
          companySlug: slug,
          email: email.trim().toLowerCase(),
          isAdmin: true,
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
              <Input
                type="password"
                placeholder="Código"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="text-center text-2xl tracking-[0.5em]"
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
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
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
    <div className="min-h-screen bg-muted/30 font-body">
      <header className="bg-background border-b h-16 flex items-center px-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Shield className="w-6 h-6 text-primary" />
          <span className="font-headline">ProofWall Panel</span>
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
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut(auth)} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="container mx-auto p-6 space-y-8">
        <div className="grid gap-6 md:grid-cols-3">
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
        </div>

        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
              <UserCheck className="w-5 h-5" /> Lista de Inscritos VIP
            </CardTitle>
            <CardDescription>Visualização em tempo real dos novos leads.</CardDescription>
          </CardHeader>
          <CardContent>
            {leadsLoading ? (
              <div className="py-20 text-center">
                <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando leads...</p>
              </div>
            ) : sortedLeads.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Data de Registro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedLeads.map((usr: any) => (
                    <TableRow key={usr.id}>
                      <TableCell className="font-bold flex items-center gap-2">
                        <User className="w-4 h-4 text-primary/60" />
                        {usr.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-primary">
                          <Mail className="w-4 h-4 text-primary/60" />
                          {usr.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          {usr.createdAt?.toDate ? usr.createdAt.toDate().toLocaleString('pt-BR') : 'Recentemente'}
                        </div>
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
      </main>
    </div>
  );
}