'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mail, User, Building2, Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useFirestore, useAuth } from "@/firebase";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function SignupPage() {
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim() || !email.trim() || !password.trim() || !db) return;

    setIsSubmitting(true);
    
    try {
      // 1. Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Criar perfil no Firestore
      const userData = {
        name: name.trim(),
        companyName: company.trim(),
        email: email.trim().toLowerCase(),
        isAdmin: false,
        createdAt: serverTimestamp(),
      };

      setDoc(doc(db, "users", user.uid), userData)
        .then(() => {
          toast({
            title: "Conta Criada!",
            description: "Bem-vindo ao ProofWall. Sua conta foi configurada com sucesso.",
          });
          router.push('/dash');
        })
        .catch(async (err) => {
          const permissionError = new FirestorePermissionError({
            path: `users/${user.uid}`,
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4 py-12 relative">
      <Link href="/" className="fixed top-8 left-8 hidden sm:flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar para o início
      </Link>

      <div className="w-full max-w-lg space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold font-headline tracking-tighter">Crie sua Conta</h1>
            <p className="text-gray-700 text-lg">Comece a converter elogios em vendas hoje mesmo.</p>
          </div>
        </div>

        <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="h-2 bg-primary w-full" />
          <CardHeader className="pt-8 text-center">
            <CardTitle className="text-2xl font-headline">Dados da Sua Conta</CardTitle>
            <CardDescription>Comece a transformar a satisfação de seus clientes em prova social.</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Seu Nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11 pl-10 bg-muted/20 border-muted-foreground/10 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Sua Empresa"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="h-11 pl-10 bg-muted/20 border-muted-foreground/10 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Seu Melhor E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 pl-10 bg-muted/20 border-muted-foreground/10 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Sua Senha (mín. 6 caracteres)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pl-10 bg-muted/20 border-muted-foreground/10 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-bold shadow-2xl hover:translate-y-[-2px] active:translate-y-[0px] transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><Loader2 className="animate-spin mr-2 h-5 w-5" /> Criando Conta...</>
                ) : "Confirmar Cadastro"}
              </Button>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-700">
                  Já tem uma conta?{' '}
                  <Link href="/login" className="text-primary font-bold hover:underline">
                    Fazer Login
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-[10px] text-center text-gray-500 uppercase tracking-[0.2em]">
          🔒 Conexão segura e criptografada
        </p>
      </div>
    </div>
  );
}
