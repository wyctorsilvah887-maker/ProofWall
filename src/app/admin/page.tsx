
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Shield, LogOut, Users, UserCheck, Calendar, Lock, Mail, User, BadgeCheck } from 'lucide-react';
import { useAuth, useFirestore, useUser, useCollection } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, query, orderBy, doc, setDoc, serverTimestamp, where } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Badge } from '@/components/ui/badge';

export default function AdminPage() {
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  
  const [accessCode, setAccessCode] = useState('');
  const [isCodeCorrect, setIsCodeCorrect] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminRegistering, setIsAdminRegistering] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Filtramos para mostrar apenas os leads (isAdmin == false) na tabela principal
  const leadsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users'), 
      where('isAdmin', '==', false),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: leadsList, loading: leadsLoading } = useCollection(leadsQuery);

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
        if (!name.trim()) throw new Error("O nome é obrigatório para o registro.");
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;

        const adminData = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          isAdmin: true,
          createdAt: serverTimestamp(),
        };

        // Salva os dados do admin na coleção 'users' com isAdmin = true
        setDoc(doc(db, 'users', newUser.uid), adminData)
          .catch(async (err) => {
            const permissionError = new FirestorePermissionError({
              path: `users/${newUser.uid}`,
              operation: 'create',
              requestResourceData: adminData,
            });
            errorEmitter.emit('permission-error', permissionError);
          });

        toast({ title: "Conta Admin Criada", description: "Bem-vindo ao ProofWall." });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Bem-vindo", description: "Login administrativo realizado." });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro de Autenticação", description: error.message });
    } finally {
      setIsAuthLoading(false);
    }
  };

  if (authLoading) return <div className="flex h-screen items-center justify-center">Carregando sistema...</div>;

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
                <Input
                  type="text"
                  placeholder="Nome Completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              )}
              <Input
                type="email"
                placeholder="E-mail admin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={isAuthLoading}>
                {isAuthLoading ? 'Processando...' : (isAdminRegistering ? 'Registrar' : 'Entrar')}
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
            <span className="font-bold text-foreground">{user.email}</span>
          </span>
          <Button variant="ghost" size="sm" onClick={() => signOut(auth)}>
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
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
              <p className="text-xs text-muted-foreground">Novos cadastros interessados</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
              <UserCheck className="w-5 h-5" /> Lista de Inscritos VIP
            </CardTitle>
            <CardDescription>Gerencie a lista de contatos capturados na ProofWall.</CardDescription>
          </CardHeader>
          <CardContent>
            {leadsLoading ? (
              <div className="py-10 text-center">Carregando dados...</div>
            ) : leadsList && leadsList.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Data de Registro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leadsList.map((usr: any) => (
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
                          {usr.createdAt?.toDate ? usr.createdAt.toDate().toLocaleString('pt-BR') : 'Agora'}
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
