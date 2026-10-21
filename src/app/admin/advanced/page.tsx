'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  Shield, LogOut, ArrowLeft, Loader2, Megaphone, Plus, Trash2, 
  CheckCircle2, AlertCircle, Info, Bell, Save
} from 'lucide-react';
import { useAuth, useFirestore, useUser, useCollection, useDoc } from '@/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, doc, setDoc, serverTimestamp, deleteDoc, addDoc, orderBy } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function AdvancedAdminPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const { theme, setTheme } = useTheme();
  
  const userDocRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: userData, loading: userDataLoading } = useDoc(userDocRef);

  // Announcement state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const announcementsQuery = useMemo(() => {
    if (!db || !user || userData?.isAdmin !== true) return null;
    return query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
  }, [db, user, userData]);

  const { data: announcements, loading: announcementsLoading } = useCollection(announcementsQuery);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim() || !db) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'announcements'), {
        title: title.trim(),
        message: message.trim(),
        type,
        isActive,
        createdAt: serverTimestamp(),
      });
      setTitle('');
      setMessage('');
      setType('info');
      setIsActive(true);
      toast({ title: "Aviso Criado", description: "O aviso foi publicado com sucesso." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'announcements', id));
      toast({ title: "Aviso Removido" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao remover" });
    }
  };

  if (authLoading || userDataLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto" />
      </div>
    );
  }

  if (!userData?.isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md text-center shadow-xl">
          <CardHeader>
            <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>Esta área é reservada para administradores.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dash')} className="w-full">Voltar ao Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 font-body text-foreground flex flex-col">
      <header className="bg-background border-b h-20 md:h-28 flex items-center px-4 md:px-8 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="relative w-[160px] h-[55px] md:w-[260px] md:h-[80px]">
            <Image src="/Logotipo%20PROOVA%20white%20mode%201.png" alt="Logo" fill className="dark:hidden object-contain" priority />
            <Image src="/Logotipo%20PROOVA%20dark%20mode%201.png" alt="Logo" fill className="hidden dark:block object-contain" priority />
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Badge variant="secondary" className="hidden sm:flex items-center gap-1.5 h-7">
            <Shield className="w-3 h-3" /> Root Admin
          </Badge>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 space-y-8 flex-1 max-w-5xl">
        <header className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">Gestão de Avisos</h1>
          <p className="text-muted-foreground text-sm">Crie notificações globais para todos os usuários da plataforma.</p>
        </header>

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
              <div className="h-2 bg-primary w-full" />
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" /> Novo Comunicado
                </CardTitle>
                <CardDescription className="text-xs">O aviso aparecerá no topo do Dashboard dos usuários.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Título do Aviso</Label>
                    <Input 
                      placeholder="Ex: Atualização do Sistema" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mensagem</Label>
                    <Textarea 
                      placeholder="Descreva o que os usuários precisam saber..." 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      className="min-h-[100px] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tipo / Estilo</Label>
                      <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Informativo (Azul)</SelectItem>
                          <SelectItem value="warning">Alerta (Laranja)</SelectItem>
                          <SelectItem value="success">Sucesso (Verde)</SelectItem>
                          <SelectItem value="destructive">Urgente (Vermelho)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 flex flex-col justify-end">
                      <div className="flex items-center justify-between p-3 border rounded-xl h-11 bg-muted/20">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ativo?</Label>
                        <Switch checked={isActive} onCheckedChange={setIsActive} />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 rounded-xl font-bold gap-2" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : <Megaphone className="w-4 h-4" />}
                    Publicar Aviso Agora
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md rounded-2xl bg-primary/5">
              <CardContent className="p-6 flex gap-4 items-start">
                <Bell className="w-6 h-6 text-primary shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">Preview Visual</p>
                  <div className={cn(
                    "p-3 rounded-lg border-l-4 text-xs font-medium",
                    type === 'info' && "bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-300",
                    type === 'warning' && "bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-300",
                    type === 'success' && "bg-green-500/10 border-green-500 text-green-700 dark:text-green-300",
                    type === 'destructive' && "bg-red-500/10 border-red-500 text-red-700 dark:text-red-300"
                  )}>
                    <p className="font-bold mb-1">{title || 'Título do Exemplo'}</p>
                    <p className="opacity-80">{message || 'Sua mensagem aparecerá aqui para os usuários...'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
              <Bell className="w-4 h-4" /> Avisos Existentes
            </h2>
            
            <div className="space-y-4">
              {announcementsLoading ? (
                <div className="py-20 text-center">
                  <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto" />
                </div>
              ) : announcements && announcements.length > 0 ? (
                announcements.map((ann: any) => (
                  <Card key={ann.id} className={cn(
                    "border-none shadow-sm overflow-hidden rounded-2xl group transition-all hover:shadow-md",
                    !ann.isActive && "opacity-50 grayscale"
                  )}>
                    <CardContent className="p-4 md:p-6 flex items-start gap-4">
                      <div className={cn(
                        "w-1 h-full absolute left-0 top-0",
                        ann.type === 'info' && "bg-blue-500",
                        ann.type === 'warning' && "bg-orange-500",
                        ann.type === 'success' && "bg-green-500",
                        ann.type === 'destructive' && "bg-red-500"
                      )} />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm">{ann.title}</h3>
                          <div className="flex items-center gap-2">
                            {!ann.isActive && <Badge variant="outline" className="text-[8px] h-4 font-black uppercase">Inativo</Badge>}
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {ann.createdAt?.toDate?.().toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{ann.message}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:bg-destructive/10 rounded-xl h-8 w-8"
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="py-20 text-center border-2 border-dashed rounded-[2.5rem] bg-muted/5">
                  <p className="text-muted-foreground text-sm">Nenhum aviso configurado.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t mt-auto text-center">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">© 2026 Proova - Root Terminal</p>
      </footer>
    </div>
  );
}
