
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Loader2, Rocket, ArrowRight, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const [isUpdating, setIsUpdating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processUpgrade() {
      // Se ainda estiver carregando a autenticação, esperamos.
      if (authLoading) return;

      // Se o usuário não estiver logado ao retornar (ex: limpou cache ou trocou de browser)
      if (!user) {
        setIsUpdating(false);
        setError("Identificamos seu pagamento, mas você precisa estar logado para ativar seu plano.");
        return;
      }

      const plan = searchParams.get('plan') || 'gold'; 
      
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          membershipStatus: plan.toLowerCase()
        });
        
        toast({
          title: "Upgrade Concluído!",
          description: `Sua conta agora é ${plan.toUpperCase()}.`,
        });
        
        setIsUpdating(false);
      } catch (err: any) {
        console.error("Erro ao atualizar plano:", err);
        setError("Não conseguimos atualizar seu plano automaticamente. Entre em contato com o suporte.");
        setIsUpdating(false);
      }
    }

    processUpgrade();
  }, [user, authLoading, db, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 font-body">
      <Card className="w-full max-w-md shadow-2xl border-none overflow-hidden">
        <div className="h-2 bg-primary w-full" />
        <CardContent className="pt-12 pb-10 text-center space-y-8">
          {isUpdating ? (
            <>
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black font-headline">Processando seu Acesso</h2>
                <p className="text-muted-foreground">Estamos liberando suas ferramentas agora...</p>
              </div>
            </>
          ) : error ? (
            <>
              <div className="mx-auto bg-destructive/10 p-4 rounded-full w-fit">
                <ShieldAlert className="w-12 h-12 text-destructive" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black font-headline">Ação Necessária</h2>
                <p className="text-sm text-muted-foreground px-4">{error}</p>
              </div>
              <div className="flex flex-col gap-3">
                <Button onClick={() => router.push('/login')} className="w-full h-12 font-bold">Fazer Login para Ativar</Button>
                <Button variant="ghost" onClick={() => router.push('/dash')} className="w-full h-10 text-xs">Ir para o Dashboard</Button>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-fit">
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black font-headline">Assinatura Ativada!</h2>
                <p className="text-muted-foreground">Obrigado pela confiança. Sua conta foi atualizada com sucesso.</p>
              </div>
              <Button onClick={() => router.push('/dash')} className="w-full h-14 text-lg font-black shadow-xl gap-2 transition-all hover:scale-105">
                Acessar Painel VIP <ArrowRight className="w-5 h-5" />
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
