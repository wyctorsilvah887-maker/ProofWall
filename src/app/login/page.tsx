
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2, Mail, Lock, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LoginPage() {
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dash');
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      toast({ 
        title: "Bem-vindo de volta!", 
        description: "Login realizado com sucesso." 
      });
      router.push('/dash');
    } catch (error: any) {
      console.error(error);
      toast({ 
        variant: "destructive", 
        title: "Erro de Acesso", 
        description: "Credenciais inválidas. Verifique seu e-mail e senha." 
      });
      setIsLoading(false);
    }
  };

  if (authLoading || user) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4 py-12 relative font-body text-foreground">
      {/* Navigation & Theme */}
      <Link href="/" className="fixed top-8 left-8 hidden sm:flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Início
      </Link>

      <div className="fixed top-8 right-8">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black font-headline tracking-tighter">Login</h1>
          <p className="text-muted-foreground font-medium">Acesse sua máquina de prova social inteligente.</p>
        </div>

        <Card className="w-full shadow-2xl border-none overflow-hidden bg-card">
          {/* Top Accent Line */}
          <div className="h-2 bg-primary w-full" />
          
          <CardHeader className="text-center space-y-4 pt-8">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit ring-8 ring-primary/5">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black font-headline tracking-tight">Bem-vindo de Volta</CardTitle>
              <CardDescription className="text-sm font-medium">
                Insira suas credenciais para gerenciar sua autoridade digital.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">E-mail de Acesso</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 bg-muted/20 border-transparent focus:ring-primary/20 font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Senha</label>
                    <Link href="/forgot-password" size="sm" className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity">
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha secreta"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 bg-muted/20 border-transparent focus:ring-primary/20 font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all rounded-2xl gap-2" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="animate-spin h-5 w-5" /> Autenticando...</>
                ) : (
                  <>Entrar no Painel <CheckCircle2 className="w-5 h-5" /></>
                )}
              </Button>
              
              <div className="text-center pt-6 border-t">
                <p className="text-sm text-muted-foreground font-medium">
                  Ainda não tem conta?{' '}
                  <Link href="/signup" className="text-primary font-black hover:underline tracking-tight">
                    Cadastre-se Grátis
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <div className="flex flex-col items-center gap-4 opacity-40">
           <p className="text-[10px] text-center uppercase tracking-[0.3em] font-black">
             🔒 Autenticação Segura Synapse Group
           </p>
        </div>
      </div>
    </div>
  );
}
