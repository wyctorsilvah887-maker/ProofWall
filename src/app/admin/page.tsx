
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Shield, LogOut, Users, Mail, Calendar, Lock } from 'lucide-react';
import { useAuth, useFirestore, useUser, useCollection } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, query, orderBy } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

export default function AdminPage() {
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  
  const [accessCode, setAccessCode] = useState('');
  const [isCodeCorrect, setIsCodeCorrect] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminRegistering, setIsAdminRegistering] = useState(true);

  // Consulta de leads
  const leadsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'emails'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: leads, loading: leadsLoading } = useCollection(leadsQuery);

  const handleAccessCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode === '2006') {
      setIsCodeCorrect(true);
      toast({ title: "Acesso Permitido", description: "Por favor, autentique-se como administrador." });
    } else {
      toast({ variant: "destructive", title: "Código Incorreto", description: "O código de acesso fornecido é inválido." });
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isAdminRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "Conta Criada", description: "Administrador registrado com sucesso." });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Bem-vindo", description: "Login administrativo realizado." });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro de Autenticação", description: error.message });
    }
  };

  if (authLoading) return <div className="flex h-screen items-center justify-center">Carregando...</div>;

  // Passo 1: Barreira de Código (2006)
  if (!isCodeCorrect && !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-primary">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline">Acesso Restrito</CardTitle>
            <CardDescription>Insira o código de segurança para continuar.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAccessCodeSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Código de Acesso"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="text-center text-2xl tracking-[1em]"
                required
              />
              <Button type="submit" className="w-full h-12 text-lg">Confirmar</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Passo 2: Login ou Cadastro de Admin
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline">
              {isAdminRegistering ? 'Criar Conta Admin' : 'Login Administrativo'}
            </CardTitle>
            <CardDescription>
              {isAdminRegistering 
                ? 'Configure suas credenciais de administrador.' 
                : 'Entre com seus dados cadastrados.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {isAdminRegistering ? 'Registrar Admin' : 'Entrar'}
              </Button>
              <Button 
                variant="link" 
                className="w-full text-xs" 
                onClick={() => setIsAdminRegistering(!isAdminRegistering)}
              >
                {isAdminRegistering ? 'Já tem uma conta? Faça login' : 'Precisa criar uma conta? Registre-se'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Passo 3: Dashboard de Leads
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b h-16 flex items-center px-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Shield className="w-6 h-6 text-primary" />
          <span className="font-headline">ProofWall Admin</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline-block">{user.email}</span>
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
              <div className="text-2xl font-bold">{leads?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Novos acessos antecipados</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
              <Mail className="w-5 h-5" /> Lista de Inscritos
            </CardTitle>
            <CardDescription>Visualize todos os e-mails que solicitaram acesso antecipado.</CardDescription>
          </CardHeader>
          <CardContent>
            {leadsLoading ? (
              <div className="py-10 text-center">Carregando leads...</div>
            ) : leads && leads.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>E-mail Corporativo</TableHead>
                    <TableHead>Data de Inscrição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead: any) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.email}</TableCell>
                      <TableCell className="text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleString('pt-BR') : 'Recentemente'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-20 text-center border-2 border-dashed rounded-lg bg-background">
                <Mail className="w-12 h-12 mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground">Nenhum lead capturado até o momento.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
