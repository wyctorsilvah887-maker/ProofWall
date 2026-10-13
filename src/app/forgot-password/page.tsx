
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Mail, ArrowLeft, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { toast } from '@/hooks/use-toast';
import { sendResetPasswordEmail } from '@/app/actions/auth-actions';

export default function ForgotPasswordPage() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);

    try {
      // 1. Usamos o Firebase para processar a lógica de reset (envio padrão)
      // Nota: O Firebase envia o e-mail automaticamente. 
      // Se quisermos usar a API do Resend EXCLUSIVAMENTE, teríamos que usar o Admin SDK
      // para gerar o link (Action Link). Como usamos o Client SDK, o Firebase cuida do disparo.
      // Demonstramos aqui o chamado à nossa Server Action Resend como um "log" ou fluxo customizado.
      
      await sendPasswordResetEmail(auth, email);
      
      // 2. Chamada demonstrativa da nossa API Resend (simulando um fluxo de notificação customizado)
      // Em um cenário real com Resend, você geraria o link via Admin SDK no servidor.
      await sendResetPasswordEmail(email, `${window.location.origin}/login`);

      setIsSent(true);
      toast({
        title: "E-mail Enviado",
        description: "Verifique sua caixa de entrada para redefinir a senha.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível processar sua solicitação. Verifique o e-mail informado.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Link href="/login" className="fixed top-8 left-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar ao Login
      </Link>

      <Card className="w-full max-w-md shadow-2xl border-none">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline font-bold">Recuperar Senha</CardTitle>
          <CardDescription>
            {isSent 
              ? "Instruções enviadas com sucesso." 
              : "Insira seu e-mail para receber as instruções de redefinição."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSent ? (
            <div className="space-y-6 text-center py-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 animate-in zoom-in" />
              </div>
              <p className="text-sm text-muted-foreground">
                Enviamos um link para <strong>{email}</strong>. Se não encontrar, verifique a pasta de spam.
              </p>
              <Button asChild className="w-full h-12">
                <Link href="/login">Ir para Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetRequest} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Seu e-mail cadastrado"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
                {isLoading ? 'Processando...' : 'Enviar Link de Recuperação'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
