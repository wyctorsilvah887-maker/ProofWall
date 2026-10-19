'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mail, User, Building2, Lock, Loader2, Eye, EyeOff, MapPin, Globe, Check, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useFirestore, useAuth, useUser } from "@/firebase";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const db = useFirestore();
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessType, setBusinessType] = useState<'local' | 'digital' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dash');
    }
  }, [user, authLoading, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessType) {
      toast({
        variant: "destructive",
        title: "Perfil Necessário",
        description: "Selecione se seu negócio é Local ou Digital para continuar.",
      });
      return;
    }

    if (!name.trim() || !company.trim() || !email.trim() || !password.trim() || !db) return;

    setIsSubmitting(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      // Geração de slug limpo (sem acentos)
      const slug = company.trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      const userData = {
        name: name.trim(),
        companyName: company.trim(),
        companySlug: slug,
        email: email.trim().toLowerCase(),
        businessType: businessType,
        isAdmin: false,
        membershipStatus: 'base',
        testimonialsCount: 0,
        googleRedirectCount: 0,
        createdAt: serverTimestamp(),
      };

      setDoc(doc(db, "users", newUser.uid), userData)
        .then(() => {
          toast({
            title: "Conta Criada!",
            description: "Bem-vindo ao Proova. Sua conta foi configurada com sucesso.",
          });
          router.push('/dash');
        })
        .catch(async (err) => {
          const permissionError = new FirestorePermissionError({
            path: `users/${newUser.uid}`,
            operation: 'create',
            requestResourceData: userData,
          });
          errorEmitter.emit('permission-error', permissionError);
          setIsSubmitting(false);
        });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no Cadastro",
        description: error.message || "Não foi possível criar sua conta agora.",
      });
      setIsSubmitting(false);
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
      <Link href="/" className="fixed top-8 left-8 hidden sm:flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Início
      </Link>

      <div className="w-full max-w-xl space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <h1 className="text-4xl font-black font-headline tracking-tighter">Crie sua Conta</h1>
          <p className="text-muted-foreground text-lg font-medium">A primeira máquina de prova social inteligente.</p>
        </div>

        <Card className="border-none shadow-2xl overflow-hidden bg-card">
          <div className="h-2 bg-primary w-full" />
          <CardHeader className="pt-8 text-center space-y-1">
            <CardTitle className="text-2xl font-black font-headline">Configuração do Perfil</CardTitle>
            <CardDescription>Escolha o tipo de negócio para otimizarmos seu painel.</CardDescription>
          </CardHeader>
          <CardContent className="px-6 sm:px-10 pb-10">
            <form onSubmit={handleSignup} className="space-y-8">
              
              {/* Business Type Selector */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setBusinessType('local')}
                  className={cn(
                    "relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all gap-3 group",
                    businessType === 'local' 
                      ? "border-primary bg-primary/5 shadow-inner" 
                      : "border-muted-foreground/10 hover:border-primary/30"
                  )}
                >
                  {businessType === 'local' && (
                    <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-0.5 animate-in zoom-in">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  <div className={cn(
                    "p-3 rounded-xl transition-colors",
                    businessType === 'local' ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                  )}>
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black uppercase tracking-tight">Negócio Local</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Lojas, Clínicas, Balcão</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setBusinessType('digital')}
                  className={cn(
                    "relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all gap-3 group",
                    businessType === 'digital' 
                      ? "border-primary bg-primary/5 shadow-inner" 
                      : "border-muted-foreground/10 hover:border-primary/30"
                  )}
                >
                  {businessType === 'digital' && (
                    <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-0.5 animate-in zoom-in">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  <div className={cn(
                    "p-3 rounded-xl transition-colors",
                    businessType === 'digital' ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                  )}>
                    <Globe className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black uppercase tracking-tight">Digital / SaaS</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Landing Pages, Apps</p>
                  </div>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Seu Nome</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/50" />
                      <Input
                        placeholder="Ex: Pedro Silva"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-11 pl-10 bg-muted/20 border-transparent focus:ring-primary/20 font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nome da Empresa</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/50" />
                      <Input
                        placeholder="Ex: Tech Soluções"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="h-11 pl-10 bg-muted/20 border-transparent focus:ring-primary/20 font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">E-mail de Acesso</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/50" />
                    <Input
                      type="email"
                      placeholder="seu@melhoremail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 pl-10 bg-muted/20 border-transparent focus:ring-primary/20 font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Senha Segura</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/50" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pl-10 pr-10 bg-muted/20 border-transparent focus:ring-primary/20 font-medium"
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
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><Loader2 className="animate-spin h-5 w-5" /> Criando Painel...</>
                ) : (
                  <>Começar Agora <CheckCircle2 className="w-5 h-5" /></>
                )}
              </Button>

              <div className="text-center pt-4 border-t">
                <p className="text-sm text-muted-foreground font-medium">
                  Já possui uma conta?{' '}
                  <Link href="/login" className="text-primary font-black hover:underline tracking-tight">
                    Fazer Login
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <div className="flex flex-col items-center gap-4 opacity-40">
           <p className="text-[10px] text-center uppercase tracking-[0.3em] font-black">
             🔒 Conexão Segura Synapse Group
           </p>
        </div>
      </div>
    </div>
  );
}
