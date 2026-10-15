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
  Clock,
  Copy,
  Terminal,
  CheckCircle2,
  Globe,
  Monitor,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
    <div className="min-h-screen bg-muted/20 flex flex-col font-body">
      <header className="bg-background border-b h-20 flex items-center px-4 md:px-6 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-background/95">
        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/dash" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 md:w-12 md:h-12 transition-transform group-hover:scale-105">
              <Image src="/maskable_icon_x512 (3).png" alt="Logo" fill className="rounded-xl shadow-sm object-cover" />
            </div>
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-12 px-2 gap-2 rounded-xl hover:bg-primary/5 group transition-all active:bg-primary/10">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] md:text-xs font-bold truncate max-w-[100px] md:max-w-[150px] transition-colors group-hover:text-primary leading-tight">
                    {userData?.companyName || 'Minha Empresa'}
                  </span>
                  {membershipLabel && (
                    <span className="text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-widest font-black leading-tight">
                      {membershipLabel}
                    </span>
                  )}
                </div>
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary group-hover:text-white transition-colors">
                  <User className="w-4 h-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => router.push('/dash')} className="rounded-xl cursor-pointer font-bold py-2.5">
                <TrendingUp className="mr-2 h-4 w-4 text-primary" />
                <span>Dash</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/widgets')} className="rounded-xl cursor-pointer font-bold py-2.5">
                <Layout className="mr-2 h-4 w-4 text-primary" />
                <span>Meus Widgets</span>
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

      <main className="flex-1 p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dash"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
            <h1 className="text-2xl font-bold font-headline tracking-tight">Gerenciamento de Murais</h1>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="shadow-lg"><Plus className="w-4 h-4 mr-2" /> Novo Mural</Button>
        </div>

        <div className="grid gap-6">
          {widgetsList?.map((w: any) => (
            <Card key={w.id} className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between p-6 gap-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-4 rounded-2xl"><Layout className="w-8 h-8 text-primary" /></div>
                  <div>
                    <h3 className="font-bold text-xl">{w.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-[9px] h-4">{w.selectedTestimonialIds?.length || 0} Depoimentos</Badge>
                      <Badge variant="outline" className="text-[9px] h-4 uppercase">{w.layout}</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center bg-muted/30 p-1 rounded-lg gap-1">
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-bold gap-2 text-primary" onClick={() => router.push(`/widgets/${w.id}`)}>
                      <Monitor className="w-3.5 h-3.5" /> Página Pública
                    </Button>
                    <div className="w-[1px] h-4 bg-border mx-1" />
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-bold gap-2" onClick={() => router.push(`/widgetconfig/${w.id}`)}>
                      <Settings2 className="w-3.5 h-3.5" /> Mural Embutido
                    </Button>
                  </div>
                  <Button variant="secondary" size="sm" className="font-bold h-9" onClick={() => { setSelectedWidget(w); setIsDialogOpen(true); }}>
                    <Code className="w-4 h-4 mr-2" /> Código
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive h-9 w-9" onClick={() => handleDeleteWidget(w.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Criar Novo Mural</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateWidget} className="space-y-4 py-4">
            <Input placeholder="Nome do Mural (ex: Site Principal)" value={newWidgetName} onChange={(e) => setNewWidgetName(e.target.value)} required autoFocus />
            <DialogFooter><Button type="submit" disabled={isCreating} className="w-full">{isCreating ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2" />} Criar e Configurar</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Terminal className="w-5 h-5 text-primary" /> Código de Instalação</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <p className="text-sm text-muted-foreground">Copie o código abaixo e cole antes da tag <code>&lt;/body&gt;</code> do seu site para exibir este mural.</p>
            <div className="relative bg-muted/50 rounded-lg p-4 border border-primary/20">
              <pre className="text-[10px] font-mono text-foreground break-all whitespace-pre-wrap">{selectedWidget ? getWidgetCode(selectedWidget.id) : ''}</pre>
              <Button size="icon" variant="secondary" className="absolute top-2 right-2 h-8 w-8 shadow-sm" onClick={() => selectedWidget && copyToClipboard(getWidgetCode(selectedWidget.id))}><Copy className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="flex justify-end"><Button onClick={() => setIsDialogOpen(false)}>Concluído</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
