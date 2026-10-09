
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
  Globe
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
import { collection, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
    const widgetData = {
      name: newWidgetName.trim(),
      selectedTestimonialIds: [],
      createdAt: serverTimestamp(),
      layout: 'mural',
      themeColor: '#f97316',
      whatsappEnabled: false,
    };

    const widgetsRef = collection(db, 'users', user.uid, 'widgets');

    addDoc(widgetsRef, widgetData)
      .then((docRef) => {
        setNewWidgetName('');
        setIsCreating(false);
        setIsCreateDialogOpen(false);
        toast({
          title: "Widget Criado!",
          description: "Redirecionando para as configurações...",
        });
        router.push(`/widgetconfig/${docRef.id}`);
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: widgetsRef.path,
          operation: 'create',
          requestResourceData: widgetData,
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsCreating(false);
      });
  };

  const handleDeleteWidget = async (widgetId: string) => {
    if (!db || !user) return;
    const widgetRef = doc(db, 'users', user.uid, 'widgets', widgetId);
    
    deleteDoc(widgetRef)
      .then(() => {
        toast({ title: "Widget Removido", description: "O widget foi excluído com sucesso." });
      })
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: widgetRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
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
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Carregando seus widgets...</p>
        </div>
      </div>
    );
  }

  if (!widgetsLoading && (!widgetsList || widgetsList.length === 0)) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-none overflow-hidden">
          <div className="h-2 bg-primary w-full" />
          <CardHeader className="text-center pt-8">
            <Layout className="w-12 h-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-headline">Crie seu Primeiro Widget</CardTitle>
            <CardDescription>Dê um nome ao seu mural de prova social para começar.</CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleCreateWidget} className="space-y-4">
              <Input 
                placeholder="Ex: Mural da Home, Widget de Vendas..."
                value={newWidgetName}
                onChange={(e) => setNewWidgetName(e.target.value)}
                required
                className="h-12 text-lg"
              />
              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-bold"
                disabled={isCreating}
              >
                {isCreating ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2" />}
                Criar Widget e Acessar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col font-body">
      <header className="bg-background border-b h-20 flex items-center px-4 md:px-6 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-lg md:text-xl">
          <Image src="/maskable_icon_x512 (3).png" alt="Logo" width={56} height={56} className="rounded-2xl shadow-sm" />
        </div>
        
        <nav className="ml-8 hidden md:flex items-center gap-6">
          <Link href="/dash" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Dash</Link>
          <Link href="/widgets" className="text-sm font-medium text-primary transition-colors">Widgets</Link>
          {userData?.isAdmin && (
            <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Administração</Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 md:h-10 md:w-10 border border-primary/20">
                <User className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dash')} className="cursor-pointer">
                <Layout className="mr-2 h-4 w-4" />
                <span>Dash</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut(auth)} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dash">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold font-headline tracking-tight">Meus Widgets</h1>
              <p className="text-sm text-muted-foreground">Gerencie a exibição da sua prova social.</p>
            </div>
          </div>
          
          <Button onClick={() => setIsCreateDialogOpen(true)} className="shadow-md">
            <Plus className="w-4 h-4 mr-2" /> Novo Widget
          </Button>
        </div>

        <div className="grid gap-6">
          {widgetsLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto" />
            </div>
          ) : (
            widgetsList?.map((w: any) => (
              <Card key={w.id} className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between p-6 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-4 rounded-2xl">
                      <Layout className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">{w.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {w.createdAt?.toDate ? w.createdAt.toDate().toLocaleDateString('pt-BR') : 'Agora'}
                        </p>
                        <Badge variant="secondary" className="text-[9px] h-4">
                          {w.selectedTestimonialIds?.length || 0} Depoimentos
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 border-t lg:border-t-0 pt-4 lg:pt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 lg:flex-none border-primary/20 text-primary hover:bg-primary/5 font-bold"
                      onClick={() => router.push(`/widgets/${w.id}`)}
                    >
                      <Globe className="w-4 h-4 mr-2" /> Página Pública
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="flex-1 lg:flex-none font-bold"
                      onClick={() => {
                        setSelectedWidget(w);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Code className="w-4 h-4 mr-2" /> Código
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1 lg:flex-none font-bold"
                      onClick={() => router.push(`/widgetconfig/${w.id}`)}
                    >
                      <Settings2 className="w-4 h-4 mr-2" /> Configurar
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteWidget(w.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-8 text-center space-y-4">
          <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg">Precisa de ajuda com o Design?</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Nossa equipe pode ajudar você a customizar o widget para que ele combine perfeitamente com a identidade visual do seu site.
            </p>
          </div>
          <Button variant="link" className="text-primary font-bold">Falar com Suporte VIP</Button>
        </div>
      </main>

      {/* Dialog para Criar Widget */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Widget</DialogTitle>
            <DialogDescription>
              Dê um nome para identificar este mural de depoimentos.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateWidget} className="space-y-4 py-4">
            <Input 
              placeholder="Ex: Mural da Home"
              value={newWidgetName}
              onChange={(e) => setNewWidgetName(e.target.value)}
              required
              autoFocus
            />
            <DialogFooter>
              <Button type="submit" disabled={isCreating} className="w-full sm:w-auto">
                {isCreating ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2" />}
                Criar Widget
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary" />
              Código de Instalação
            </DialogTitle>
            <DialogDescription>
              Copie o snippet abaixo e cole antes da tag <code className="bg-muted px-1.5 py-0.5 rounded text-xs">&lt;/body&gt;</code> do seu site.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative bg-muted/50 rounded-lg p-4 border border-primary/20">
                <pre className="text-[10px] md:text-xs font-mono text-gray-800 break-all whitespace-pre-wrap">
                  {selectedWidget ? getWidgetCode(selectedWidget.id) : ''}
                </pre>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="absolute top-2 right-2 h-8 w-8 shadow-sm"
                  onClick={() => selectedWidget && copyToClipboard(getWidgetCode(selectedWidget.id))}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> O que este código faz?
              </h4>
              <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
                <li>Carrega dinamicamente seus depoimentos aprovados.</li>
                <li>Exibe o mural flutuante no canto inferior do seu site.</li>
                <li>Otimizado para não afetar a velocidade de carregamento.</li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => setIsDialogOpen(false)}>Concluído</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
