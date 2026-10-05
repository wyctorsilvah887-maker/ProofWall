
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { UserPlus, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { toast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const db = useFirestore();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !db) return;

    setIsSubmitting(true);
    const usersRef = collection(db, "users");
    const userData = {
      username: username.trim(),
      password: password.trim(), // Nota: Em produção, senhas nunca devem ser salvas em texto puro.
      createdAt: serverTimestamp(),
    };

    // Mutação não bloqueante otimista
    addDoc(usersRef, userData)
      .then(() => {
        toast({
          title: "Bem-vindo à ProofWall!",
          description: "Sua conta de acesso antecipado foi criada com sucesso.",
        });
        router.push('/');
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: usersRef.path,
          operation: 'create',
          requestResourceData: userData,
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar para o início
      </Link>

      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="bg-primary text-primary-foreground p-3 rounded-2xl shadow-lg mb-4">
            <Star className="w-8 h-8 fill-current" />
          </div>
          <h1 className="text-3xl font-bold font-headline tracking-tighter">Crie sua conta VIP</h1>
          <p className="text-muted-foreground">Defina suas credenciais para garantir seu lugar.</p>
        </div>

        <Card className="border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Informações de Acesso</CardTitle>
            <CardDescription>Não solicitamos e-mail, apenas um nome único.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Nome de Usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Criando..." : "Confirmar Acesso"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground px-8">
          Ao clicar em confirmar, você concorda com nossos termos de uso e política de privacidade para o beta fechado.
        </p>
      </div>
    </div>
  );
}
