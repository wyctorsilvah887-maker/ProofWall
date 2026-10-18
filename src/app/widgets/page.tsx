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
  Inbox,
  Sun,
  Moon,
  Gem
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
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';

export default function WidgetsPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  
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

  const membershipLabel = useMemo(() => {
    const status = userData?.membershipStatus;
    if (status === 'enterprise') return 'Membro Enterprise';
    if (status === 'gold') return 'Membro Gold';
    if (status === 'trial') return 'Período Trial';
    return null;
  }, [userData]);

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

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col font-body text-foreground overflow-x-hidden">
      <header className="bg-background border-b h-20 md:h-24 flex items-center px-4 md:px-8 sticky top-0 z-[60] shadow-sm backdrop-blur-md bg-background/95">
        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/dash" className="flex items-center gap-2 group">
            <div className="relative w-[140px] h-[40px] md:w-[180px] md:h-[50px] transition-transform group-hover:scale-105">
              <Image src="/Logotipo%20PROOVA%20white%20mode.png" alt="Logo" fill className="object-contain dark:hidden" />
              <Image src="/Logotipo%20PROOVA%20dark%20mode.png" alt="Logo" fill className="object-contain hidden dark:block" />
            </div>
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-12 px-2 gap-2 rounded-xl hover:bg-primary/5 group transition-all active:bg-primary/10">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold truncate max-w-[80px] sm:max-w-[120px] md:max-w-[200px] transition-colors group-hover:text-primary leading-tight">
                    {userData?.companyName || 'Minha Empresa'}
                  </span>
                  {membershipLabel && (
                    <span className={cn(
                      "text-[8px] sm:text-[10px] uppercase tracking-widest font-black leading-tight",
                      userData?.membershipStatus === 'enterprise' ? "text-primary animate-pulse" : "text-muted-foreground"
                    )}>
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
              <DropdownMenuItem onClick={() => router.push('/pricing')} className="rounded-xl cursor-pointer font-bold py-2.5">
                <Gem className="mr-2 h-4 w-4 text-primary" />
                <span>Planos de Upgrade</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="mx-1" />
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
              <DropdownMenuItem onClick={() => signOut(auth)} className="rounded-xl text-destructive focus:text-destructive cursor-pointer font-bold py-2.5">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair do Sistema</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Link href="/dash">
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="space-y-0.5">
              <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">Meus Murais</h1>
              <p className="text-sm text-muted-foreground">Gerencie e publique suas provas sociais</p>
            </div>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full sm:w-auto h-12 rounded-xl shadow-lg font-bold gap-2 text-sm" size="lg">
            <Plus className="w-5 h-5" /> Novo Mural
          </Button>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Buscar mural pelo nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex h-12 w-full rounded-xl border border-input bg-background pl-11 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-sm"
          />
        </div>

        <div className="grid gap-4 md:gap-6">
          {widgetsLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">Sincronizando seus murais...</p>
            </div>
          ) : filteredWidgets.length > 0 ? (
            filteredWidgets.map((w: any) => (
              <Card key={w.id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden group rounded-2xl">
                <div className="flex flex-col p-5 md:p-6 gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-4 rounded-2xl hidden md:block group-hover:bg-primary group-hover:text-white transition-colors">
                        <Layout className="w-6 h-6 text-primary" />
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <h3 className="font-black font-headline text-lg md:text-xl truncate group-hover:text-primary transition-colors pr-8 sm:pr-0">{w.name}</h3>
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

                    <div className="absolute right-4 top-4 sm:relative sm:right-0 sm:top-0">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Button 
                      className="h-14 sm:h-12 rounded-xl text-xs font-black uppercase tracking-widest gap-2 bg-background border border-primary/20 text-primary hover:bg-primary/5 shadow-sm justify-between px-4"
                      onClick={() => router.push(`/widgets/${w.id}`)}
                    >
                      <span className="flex items-center gap-2"><Monitor className="w-4 h-4" /> Página Pública</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-30" />
                    </Button>
                    <Button 
                      className="h-14 sm:h-12 rounded-xl text-xs font-black uppercase tracking-widest gap-2 bg-background border border-primary/20 text-primary hover:bg-primary/5 shadow-sm justify-between px-4"
                      onClick={() => router.push(`/widgetconfig/${w.id}`)}
                    >
                      <span className="flex items-center gap-2"><Settings2 className="w-4 h-4" /> Mural Embutido</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-30" />
                    </Button>
                    <Button 
                      variant="secondary"
                      className="h-14 sm:h-12 rounded-xl text-xs font-black uppercase tracking-widest gap-2 bg-muted/50 hover:bg-muted shadow-sm justify-between px-4 sm:col-span-2 lg:col-span-1"
                      onClick={() => { setSelectedWidget(w); setIsDialogOpen(true); }}
                    >
                      <span className="flex items-center gap-2"><Code className="w-4 h-4" /> Obter Código</span>
                      <Copy className="w-3.5 h-3.5 opacity-30" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="py-24 text-center border-2 border-dashed rounded-3xl bg-muted/5 space-y-4">
              <Layout className="w-12 h-12 text-muted-foreground/20 mx-auto" />
              <div className="space-y-1">
                <p className="font-bold text-lg">Nenhum mural criado</p>
                <p className="text-sm text-muted-foreground">Comece criando seu primeiro mural de depoimentos.</p>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)} variant="outline" className="rounded-xl font-bold mt-4 h-12 px-8">
                Criar Agora
              </Button>
            </div>
          )}
        </div>
      </main>

      <footer className="py-12 border-t mt-auto flex flex-col items-center gap-6 bg-background/50">
        <div className="flex items-center gap-2 relative w-[140px] h-[40px] md:w-[180px] md:h-[50px]">
          <Image src="/Logotipo%20PROOVA%20white%20mode.png" alt="Logo Footer" fill className="object-contain dark:hidden" />
          <Image src="/Logotipo%20PROOVA%20dark%20mode.png" alt="Logo Footer" fill className="object-contain hidden dark:block" />
        </div>
        <div className="container px-4 md:px-6 mx-auto text-center space-y-2">
          <p className="text-xs md:text-sm text-muted-foreground font-medium">© 2026 Proova - Prova Social de Verdade.</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-30">
            Feito Pelo Grupo Synapse | Synapse Group
          </p>
        </div>
      </footer>

      {/* Dialog for Widget Code */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-3xl sm:max-w-lg border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black font-headline">Código do Mural</DialogTitle>
            <DialogDescription className="text-sm">
              Copie o código abaixo e cole no HTML do seu site para exibir o mural "{selectedWidget?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="relative bg-muted/50 rounded-xl p-5 border border-primary/20">
              <Terminal className="absolute top-5 left-5 w-4 h-4 text-primary/50" />
              <pre className="text-[11px] font-mono text-foreground break-all whitespace-pre-wrap pl-7 leading-relaxed select-all">
                {selectedWidget ? getWidgetCode(selectedWidget.id) : ''}
              </pre>
              <Button 
                size="icon" 
                variant="secondary" 
                className="absolute top-2 right-2 h-9 w-9 rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all" 
                onClick={() => copyToClipboard(getWidgetCode(selectedWidget.id))}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
              <p className="text-xs text-primary font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Dica de Instalação
              </p>
              <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                Recomendamos colar este código antes da tag final <code>&lt;/body&gt;</code> para garantir que o mural carregue sem afetar a velocidade do seu site.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full font-black h-12 rounded-xl text-sm" onClick={() => setIsDialogOpen(false)}>Entendi, fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for New Widget */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="rounded-3xl sm:max-w-md border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black font-headline">Novo Mural</DialogTitle>
            <DialogDescription className="text-sm">
              Dê um nome para identificar seu novo mural de depoimentos.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Nome do Mural</label>
              <Input 
                placeholder="Ex: Landing Page Promoção" 
                value={newWidgetName}
                onChange={(e) => setNewWidgetName(e.target.value)}
                className="h-12 rounded-xl text-sm"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateWidget()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="w-full font-black h-12 rounded-xl shadow-lg text-sm" 
              onClick={() => handleCreateWidget()}
              disabled={isCreating || !newWidgetName.trim()}
            >
              {isCreating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Plus className="mr-2 w-4 h-4" />}
              Criar Mural Agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
