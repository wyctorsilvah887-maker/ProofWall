'use client';

import { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  LogOut,
  User,
  Loader2,
  Star,
  Clock,
  Layout,
  TrendingUp,
  Shield,
  MessageSquareOff,
  Inbox,
  Trash2,
  Mail,
  ArrowLeft
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useUser, useFirestore, useDoc, useAuth, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, deleteDoc } from 'firebase/firestore';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { toast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

export default function PrivateInboxPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const userDocRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: userData, loading: userDataLoading } = useDoc(userDocRef);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const feedbacksQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'private_feedbacks'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: privateFeedbacks, loading: feedbacksLoading } = useCollection(feedbacksQuery);

  const handleDeleteFeedback = async (id: string) => {
    if (!db || !user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'private_feedbacks', id));
      toast({ title: "Removido", description: "O feedback foi excluído do inbox privado." });
    } catch (e) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível remover." });
    }
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
              <Image src="/maskable_icon_x512 (3).png" alt="Logo" fill className="rounded-xl shadow-sm object-cover" />
            </div>
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-12 px-2 gap-2 rounded-xl hover:bg-primary/5 group transition-all">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold truncate max-w-[120px] md:max-w-[200px] group-hover:text-primary transition-colors leading-tight">
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
              <DropdownMenuItem onClick={() => router.push('/private')} className="rounded-xl cursor-pointer font-bold py-2.5 bg-primary/5 text-primary">
                <Inbox className="mr-2 h-4 w-4" />
                <span>Inbox Privado</span>
              </DropdownMenuItem>
              {userData?.isAdmin && (
                <DropdownMenuItem onClick={() => router.push('/admin')} className="rounded-xl cursor-pointer font-bold py-2.5">
                  <Shield className="mr-2 h-4 w-4 text-primary" />
                  <span>Administração</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="mx-1" />
              <DropdownMenuItem onClick={() => signOut(auth)} className="rounded-xl text-destructive focus:text-destructive cursor-pointer font-bold py-2.5">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair do Sistema</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 space-y-8 max-w-5xl mx-auto w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dash">
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight flex items-center gap-3">
                <Inbox className="w-8 h-8 text-primary" /> Inbox Privado
              </h1>
              <p className="text-sm text-muted-foreground">Críticas e feedbacks (1-3 estrelas) recebidos em sigilo.</p>
            </div>
          </div>
          <Badge variant="outline" className="w-fit h-8 px-4 rounded-full border-primary/20 text-primary font-black uppercase tracking-widest text-[10px]">
            {privateFeedbacks?.length || 0} Mensagens
          </Badge>
        </header>

        <div className="grid gap-4">
          {feedbacksLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
            </div>
          ) : privateFeedbacks && privateFeedbacks.length > 0 ? (
            privateFeedbacks.map((f: any) => (
              <Card key={f.id} className="border-none shadow-sm overflow-hidden rounded-2xl group transition-all hover:shadow-md">
                <CardContent className="p-5 sm:p-6 flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/5 p-2.5 rounded-xl">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{f.userName}</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {f.userEmail || 'Não informado'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn("w-3.5 h-3.5", i < f.rating ? "fill-primary text-primary" : "text-muted-foreground/20")} />
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-muted/30 p-4 rounded-2xl border-l-4 border-primary/30 italic text-sm leading-relaxed">
                      "{f.text}"
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {f.createdAt?.toDate ? f.createdAt.toDate().toLocaleString('pt-BR') : 'Agora'}</span>
                    </div>
                  </div>
                  
                  <div className="flex md:flex-col items-center justify-end gap-2 shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:bg-destructive/10 rounded-xl h-10 w-10"
                      onClick={() => handleDeleteFeedback(f.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="py-32 text-center border-2 border-dashed rounded-[2.5rem] bg-muted/5 space-y-4">
              <MessageSquareOff className="w-16 h-16 text-muted-foreground/20 mx-auto" />
              <div className="space-y-1">
                <p className="font-bold text-xl">Inbox Vazio</p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">Você não possui feedbacks críticos no momento. Continue prestando um ótimo serviço!</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 border-t mt-auto">
        <div className="container px-4 md:px-6 mx-auto text-center space-y-4">
          <p className="text-xs text-muted-foreground">© 2026 Proova - Inbox Privado de Feedback.</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">
            Synapse Group Professional
          </p>
        </div>
      </footer>
    </div>
  );
}
