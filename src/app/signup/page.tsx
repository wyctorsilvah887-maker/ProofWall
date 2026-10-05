'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Star, ArrowLeft, Mail, User } from "lucide-react";
import Link from "next/link";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function SignupPage() {
  const db = useFirestore();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !db) return;

    setIsSubmitting(true);
    
    const userData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      isAdmin: false,
      createdAt: serverTimestamp(),
    };

    addDoc(collection(db, "users"), userData)
      .then(() => {
        toast({
          title: "Inscrição Realizada!",
          description: "Você entrou para a lista VIP com sucesso.",
        });
        router.push('/');
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: "users",
          operation: 'create',
          requestResourceData: userData,
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4 py-16 sm:py-24 relative">
      <Link href="/" className="fixed top-6 left-4 sm:top-8 sm:left-8 flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors bg-background/50 backdrop-blur-sm p-2 rounded-full sm:bg-transparent sm:p-0 z-50">
        <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Voltar para o início</span>
      </Link>

      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-primary text-primary-foreground p-3 rounded-2xl shadow-lg">
            <Star className="w-8 h-8 fill-current" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold font-headline tracking-tighter">Garanta seu lugar</h1>
            <p className="text-gray-700 text-sm md:text-base">Preencha seus dados para entrar na lista VIP do ProofWall.</p>
          </div>
        </div>

        <Card className="border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Dados de Contato</CardTitle>
            <CardDescription>Sem senhas, apenas seu nome e e-mail.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-700" />
                  <Input
                    placeholder="Seu Nome Completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 pl-10 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-700" />
                  <Input
                    type="email"
                    placeholder="Seu Melhor E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-10 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-semibold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Confirmar Acesso VIP"}
              </Button>
              <p className="text-[10px] text-center text-gray-500 uppercase tracking-widest mt-4">
                🔒 Acesso exclusivo para os primeiros 50
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

