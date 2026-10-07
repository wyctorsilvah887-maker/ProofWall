
'use client';

import { useState, use } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Star, CheckCircle2, MessageSquare, Loader2, Send, Video } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import Link from 'next/link';

export default function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const db = useFirestore();

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const companyName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !text.trim() || !db) return;

    setIsSubmitting(true);

    const testimonialData = {
      userName: userName.trim(),
      userEmail: userEmail.trim().toLowerCase(),
      rating,
      text: text.trim(),
      status: 'pending',
      companySlug: slug,
      createdAt: serverTimestamp(),
    };

    const testimonialsRef = collection(db, 'testimonials');

    addDoc(testimonialsRef, testimonialData)
      .then(() => {
        setSubmitted(true);
        toast({
          title: "Depoimento Enviado!",
          description: "Obrigado por compartilhar sua experiência.",
        });
      })
      .catch(async (err) => {
        // Criamos o erro contextual para depuração facilitada no overlay do Next.js (apenas dev)
        const permissionError = new FirestorePermissionError({
          path: testimonialsRef.path,
          operation: 'create',
          requestResourceData: testimonialData,
        } satisfies SecurityRuleContext);
        
        errorEmitter.emit('permission-error', permissionError);
        setIsSubmitting(false);
      });
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4 font-body">
        <Card className="w-full max-w-md text-center shadow-2xl border-none">
          <CardContent className="pt-10 pb-10 space-y-6">
            <div className="mx-auto bg-green-100 p-4 rounded-full w-fit">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-headline">Obrigado!</h2>
              <p className="text-muted-foreground">Sua avaliação foi enviada com sucesso para a <strong>{companyName}</strong>.</p>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Conhecer o ProofWall</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4 font-body">
      <div className="w-full max-w-xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold font-headline tracking-tight">{companyName}</h1>
          <p className="text-muted-foreground">Gostaríamos de ouvir sua opinião sobre nossos serviços.</p>
        </div>

        <Card className="shadow-2xl border-none overflow-hidden">
          <div className="h-2 bg-primary w-full" />
          <CardHeader className="text-center pt-8">
            <CardTitle className="text-2xl font-headline flex items-center justify-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" /> Deixe seu Depoimento
            </CardTitle>
            <CardDescription>Sua experiência é fundamental para nós.</CardDescription>
          </CardHeader>
          <CardContent className="px-6 md:px-10 pb-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Star Rating */}
              <div className="space-y-3 text-center">
                <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Sua Nota</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star 
                        className={`w-10 h-10 ${star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Seu Nome</label>
                  <Input 
                    placeholder="Ex: João Silva" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    className="h-11 border-muted-foreground/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">E-mail (opcional)</label>
                  <Input 
                    type="email"
                    placeholder="Ex: joao@email.com" 
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="h-11 border-muted-foreground/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Feedback Text */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sua Mensagem</label>
                <Textarea 
                  placeholder="Conte-nos o que achou da nossa empresa..."
                  className="min-h-[120px] resize-none border-muted-foreground/20 focus:border-primary"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                />
              </div>

              {/* Video Option Placeholder */}
              <div className="p-4 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 text-center space-y-2 cursor-pointer hover:bg-primary/10 transition-colors group">
                <Video className="w-6 h-6 text-primary mx-auto group-hover:scale-110 transition-transform" />
                <p className="text-xs font-semibold text-primary">Gravar Depoimento em Vídeo</p>
                <p className="text-[10px] text-muted-foreground">(Funcionalidade VIP - Em breve)</p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-bold shadow-xl transition-all hover:translate-y-[-2px] active:translate-y-0"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><Loader2 className="animate-spin mr-2" /> Enviando...</>
                ) : (
                  <><Send className="mr-2 w-5 h-5" /> Enviar Agora</>
                )}
              </Button>

              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
                🔒 Seus dados estão protegidos
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
