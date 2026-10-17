
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Plus, 
  Layout, 
  Loader2, 
  Settings2, 
  Code, 
  Trash2, 
  ArrowLeft,
  User,
  LogOut,
  Shield,
  Copy,
  Terminal,
  CheckCircle2,
  Monitor,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Search,
  Inbox
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useUser, useFirestore, useCollection, useAuth, useDoc } from '@/firebase';
import { collection, setDoc, serverTimestamp, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export default function WidgetsPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  
  const [newWidgetName, setNewWidgetName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  const userDocRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: userData, loading: userDataLoading } = useDoc(userDocRef);

  const widgetsQuery = useMemo(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'widgets');
  }, [db, user]);

  const { data: widgetsList, loading: widgetsLoading } = useCollection(widgetsQuery);

  const filteredWidgets = useMemo(() => {
    if (!widgetsList) return [];
    if (!searchTerm.trim()) return widgetsList;
    return widgetsList.filter((w: any) => 
      w.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [widgetsList, searchTerm]);

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

  const handleCreateWidget = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newWidgetName.trim() || !db || !user) return;

    setIsCreating(true);
    
    let slug = newWidgetName.trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    try {
      const widgetRef = doc(db, 'users', user.uid, 'widgets', slug);
      
      const docSnap = await getDoc(widgetRef);
      if (docSnap.exists()) {
        slug = `${slug}-${Math.random().toString(36).substring(2, 5)}`;
      }

      const finalWidgetRef = doc(db, 'users', user.uid, 'widgets', slug);

      const widgetData = {
        name: newWidgetName.trim(),
        selectedTestimonialIds: [],
        createdAt: serverTimestamp(),
        layout: 'mural',
        themeColor: '#f97316',
        whatsappEnabled: false,
        whatsappNumber: '',
        externalSiteUrl: '',
        coverImageUrl: '',
      };

      await setDoc(finalWidgetRef, widgetData);
      
      setNewWidgetName('');
      setIsCreating(false);
      setIsCreateDialogOpen(false);
      toast({
        title: "Mural Criado!",
        description: "Configurando o novo link amigável...",
      });
      router.push(`/widgetconfig/${slug}`);
      
    } catch (error: any) {
      console.error("Erro ao criar widget:", error);
      toast({
        variant: "destructive",
        title: "Erro na criação",
        description: "Não foi possível criar o mural agora."
      });
      setIsCreating(false);
    }
  };

  const handleDeleteWidget = async (widgetId: string) => {
    if (!db || !user) return;
    const widgetRef = doc(db, 'users', user.uid, 'widgets', widgetId);
    deleteDoc(widgetRef).then(() => {
      toast({ title: "Widget Removido", description: "O widget foi excluído com sucesso." });
    });
  };

  const copyToClipboard = (text: string, description: string = "Código de instalação") => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${description} copiado para a área de transferência.`,
    });
  };

  const getWidgetCode = (widgetId: string) => {
    return `<script src="${baseUrl}/widget.js?id=${widgetId}&user=${user?.uid}" defer></script>`;
  };

  if (authLoading || userDataLoading || (user && !userData)) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" />
      </div>
    );
  }

  const membershipLabel = userData?.membershipStatus === 'gold' 
    ? 'Membro Gold' 
    : userData?.membershipStatus === 'standard' 
      ? 'Membro Standard' 
      : null;

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col font-body text-foreground">
      <header className="bg-background border-b h-16 md:h-20 flex items-center px-4 md:px-8 sticky top-0 z-[60] shadow-sm backdrop-blur-md bg-background/95">
        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/dash" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 md:w-12 md:h-12 transition-transform group-hover:scale-105">
              <Image src="/Logotipo%20PROOVA%20white%20mode.png" alt="Logo" fill className="rounded-xl shadow-sm object-cover dark:hidden" />
              <Image src="/Logotipo%20PROOVA%20dark%20mode.png" alt="Logo" fill className="rounded-xl shadow-sm object-cover hidden dark:block" />
            </div>
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-12 px-2 gap-2 rounded-xl hover:bg-primary/5 group transition-all active:bg-primary/10">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold truncate max-w-[120px] md:max-w-[200px] transition-colors group-hover:text-primary leading-tight">
                    {userData?.companyName || 'Minha Empresa'}
                  </span>
                  {membershipLabel && (
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black leading-tight">
                      {membershipLabel}
                    </span>
                  )}
                </div>
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary group-hover:text-white transition-colors">
                  <User className="w-4 h-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background border-border shadow-xl rounded-2xl p-2">
              <DropdownMenuLabel className="px-3 py-2">
                <p className="text-xs font-headline font-black uppercase tracking-[0.2em] text-muted-foreground">Minha Conta</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="mx-1" />
              <DropdownMenuItem onClick={() => router.push('/dash')} className="rounded-xl cursor-pointer font-bold py-2.5">
                <TrendingUp className="mr-2 h-4 w-4 text-primary" />
                <span>Dash</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/widgets')} className="rounded-xl cursor-pointer font-bold py-2.5">
                <Layout className="mr-2 h-4 w-4 text-primary" />
                <span>Meus Widgets</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/private')} className="rounded-xl cursor-pointer font-bold py-2.5">
                <Inbox className="mr-2 h-4 w-4 text-primary" />
                <span>Inbox Privado</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="mx-1" />
              <DropdownMenuItem onClick={() => signOut(auth)} className="rounded-xl text-destructive focus:text-destructive cursor-pointer font-bold py-2.5">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair do Sistema</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dash" className="hidden sm:block">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="space-y-0.5">
              <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">Meus Murais</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">Gerencie e publique suas provas sociais</p>
            </div>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full sm:w-auto h-12 rounded-xl shadow-lg font-bold gap-2" size="lg">
            <Plus className="w-5 h-5" /> Novo Mural
          </Button>
        </div>

        {/* Sistema de Busca */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="text"
            placeholder="Buscar mural pelo nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-background border-muted-foreground/10 focus-visible:ring-primary/20"
          />
        </div>

        <div className="grid gap-4 md:gap-6">
          {widgetsLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Sincronizando seus murais...</p>
            </div>
          ) : filteredWidgets.length > 0 ? (
            filteredWidgets.map((w: any) => (
              <Card key={w.id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden group rounded-2xl">
                <div className="flex flex-col p-5 md:p-6 gap-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-4 rounded-2xl hidden sm:block">
                        <Layout className="w-6 h-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-black font-headline text-lg md:text-xl truncate group-hover:text-primary transition-colors">{w.name}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-[9px] h-5 bg-primary/5 text-primary border-none px-2 font-black">
                            {w.selectedTestimonialIds?.length || 0} AVALIAÇÕES
                          </Badge>
                          <Badge variant="outline" className="text-[9px] h-5 uppercase tracking-widest font-black px-2 opacity-60">
                            {w.layout || 'Mural'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive h-10 w-10 hover:bg-destructive/10 rounded-xl"
                        onClick={() => handleDeleteWidget(w.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
                    <Button 
                      className="h-12 rounded-xl text-xs font-black uppercase tracking-widest gap-2 bg-background border border-primary/20 text-primary hover:bg-primary/5 shadow-sm"
                      onClick={() => router.push(`/widgets/${w.id}`)}
                    >
                      <Monitor className="w-4 h-4" /> Página Pública
                      <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-30" />
                    </Button>
                    <Button 
                      className="h-12 rounded-xl text-xs font-black uppercase tracking-widest gap-2 bg-background border border-primary/20 text-primary hover:bg-primary/5 shadow-sm"
                      onClick={() => router.push(`/widgetconfig/${w.id}`)}
                    >
                      <Settings2 className="w-4 h-4" /> Mural Embutido
                      <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-30" />
                    </Button>
                    <Button 
                      variant="secondary"
                      className="h-12 rounded-xl text-xs font-black uppercase tracking-widest gap-2 bg-muted/50 hover:bg-muted shadow-sm"
                      onClick={() => { setSelectedWidget(w); setIsDialogOpen(true); }}
                    >
                      <Code className="w-4 h-4" /> Obter Código
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="py-24 text-center border-2 border-dashed rounded-3xl bg-muted/5 space-y-4">
              {searchTerm ? (
                <>
                  <Search className="w-12 h-12 text-muted-foreground/20 mx-auto" />
                  <div className="space-y-1">
                    <p className="font-bold text-lg">Nenhum mural encontrado</p>
                    <p className="text-sm text-muted-foreground">Não encontramos resultados para "{searchTerm}".</p>
                  </div>
                  <Button onClick={() => setSearchTerm('')} variant="link" className="font-bold text-primary">
                    Limpar busca
                  </Button>
                </>
              ) : (
                <>
                  <Layout className="w-12 h-12 text-muted-foreground/20 mx-auto" />
                  <div className="space-y-1">
                    <p className="font-bold text-lg">Nenhum mural criado</p>
                    <p className="text-sm text-muted-foreground">Comece criando seu primeiro mural de depoimentos.</p>
                  </div>
                  <Button onClick={() => setIsCreateDialogOpen(true)} variant="outline" className="rounded-xl font-bold">
                    Criar Agora
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 border-t mt-auto">
        <div className="container px-4 md:px-6 mx-auto flex flex-col justify-center items-center gap-4 text-center">
          <p className="text-xs md:text-sm text-muted-foreground">© 2026 Proova - Prova Social de Verdade.</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">
            Feito Pelo Grupo Synapse | Synapse Group
          </p>
        </div>
      </footer>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-sm rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pt-12 pb-4 shrink-0 bg-background text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-xl font-black font-headline">Novo Mural</DialogTitle>
            <DialogDescription className="text-xs">
              Dê um nome identificador para seu mural.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateWidget} className="p-8 pt-0 space-y-6">
            <div className="space-y-2">
              <Input 
                placeholder="Ex: Site Principal" 
                value={newWidgetName} 
                onChange={(e) => setNewWidgetName(e.target.value)} 
                required 
                autoFocus 
                className="h-12 rounded-xl border-primary/20 focus-visible:ring-primary/20 text-sm"
              />
            </div>
            <Button type="submit" disabled={isCreating} className="w-full h-12 rounded-xl shadow-xl font-black text-xs uppercase tracking-widest">
              {isCreating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Criar e Configurar
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pt-12 pb-4 shrink-0 bg-background text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
              <Terminal className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-xl font-black font-headline">Instalação</DialogTitle>
            <DialogDescription className="text-xs">
              Cole este código antes da tag final <code>&lt;/body&gt;</code> do seu site.
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 pt-0 space-y-6">
            <div className="relative bg-muted/30 rounded-2xl p-4 border border-primary/10 group">
              <pre className="text-[10px] font-mono text-foreground break-all whitespace-pre-wrap leading-relaxed">
                {selectedWidget ? getWidgetCode(selectedWidget.id) : ''}
              </pre>
              <Button 
                size="icon" 
                variant="secondary" 
                className="absolute top-2 right-2 h-8 w-8 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" 
                onClick={() => selectedWidget && copyToClipboard(getWidgetCode(selectedWidget.id))}
              >
                <Copy className="h-3.5 h-3.5" />
              </Button>
            </div>
            <Button onClick={() => setIsDialogOpen(false)} className="w-full h-12 rounded-xl font-black text-xs uppercase tracking-widest">
              Concluído
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
