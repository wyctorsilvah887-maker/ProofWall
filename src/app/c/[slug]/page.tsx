
'use client';

import { useState, use, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Star, CheckCircle2, MessageSquare, Loader2, Send, Video, Search, MapPin } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit, doc, updateDoc, increment } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

export default function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const db = useFirestore();

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0); 
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string | null>(null);

  const displayCompanyName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  useEffect(() => {
    async function findCompany() {
      if (!db || !slug) return;
      
      try {
        setIsLoadingCompany(true);
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('companySlug', '==', slug), limit(1));
        const snapshot = await getDocs(q);
        
        let foundUserId = null;
        let foundUserDoc = null;

        if (!snapshot.empty) {
          foundUserId = snapshot.docs[0].id;
          foundUserDoc = snapshot.docs[0].data();
        } else {
          const slugAlt = slug.replace(/-/g, ' ');
          const qAlt = query(usersRef, where('companyName', '==', slugAlt), limit(1));
          const snapshotAlt = await getDocs(qAlt);
          if (!snapshotAlt.empty) {
            foundUserId = snapshotAlt.docs[0].id;
            foundUserDoc = snapshotAlt.docs[0].data();
          }
        }

        if (foundUserId) {
          setTargetUserId(foundUserId);
          
          if (foundUserDoc?.googleMapsUrl) {
            setGoogleMapsUrl(foundUserDoc.googleMapsUrl);
          } else {
            const widgetsRef = collection(db, 'users', foundUserId, 'widgets');
            const widgetsSnap = await getDocs(widgetsRef);
            const gWidget = widgetsSnap.docs.find(d => d.data().googleMapsUrl);
            if (gWidget) {
              setGoogleMapsUrl(gWidget.data().googleMapsUrl);
            }
          }
        }
      } catch (err) {
        console.error("Erro ao localizar empresa:", err);
      } finally {
        setIsLoadingCompany(false);
      }
    }
    
    findCompany();
  }, [db, slug]);

  const handleGoogleRedirect = async () => {
    if (!db || !targetUserId || !googleMapsUrl) return;
    
    try {
      const userRef = doc(db, 'users', targetUserId);
      await updateDoc(userRef, {
        googleRedirectCount: increment(1)
      });
    } catch (err) {
      console.error("Erro ao rastrear redirecionamento:", err);
    }

    let finalUrl = googleMapsUrl.trim();
    const utmParams = 'utm_source=proova&utm_medium=testimonial_success&utm_campaign=google_maps_boost';
    
    if (finalUrl.includes('?')) {
      finalUrl += `&${utmParams}`;
    } else {
      finalUrl += `?${utmParams}`;
    }

    window.open(finalUrl.startsWith('http') ? finalUrl : `https://${finalUrl}`, '_blank');
  };

  const handleResetForm = () => {
    setUserName('');
    setUserEmail('');
    setRating(0);
    setText('');
    setIsSubmitting(false);
    setSubmitted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        variant: "destructive",
        title: "Nota Obrigatória",
        description: "Por favor, selecione uma nota de 1 a 5 estrelas.",
      });
      return;
    }

    if (!userName.trim() || !text.trim() || !db || !targetUserId) return;

    setIsSubmitting(true);

    const testimonialData = {
      userName: userName.trim(),
      userEmail: userEmail.trim().toLowerCase(),
      rating,
      text: text.trim(),
      status: 'approved',
      createdAt: serverTimestamp(),
    };

    const collectionName = rating < 4 ? 'private_feedbacks' : 'testimonials';
    const feedbacksRef = collection(db, 'users', targetUserId, collectionName);

    addDoc(feedbacksRef, testimonialData)
      .then(async () => {
        try {
          const userRef = doc(db, 'users', targetUserId);
          await updateDoc(userRef, {
            testimonialsCount: increment(1)
          });
        } catch (e) {
          console.error("Erro ao incrementar testimonialsCount:", e);
        }

        setSubmitted(true);
        setIsSubmitting(false);
        toast({
          title: "Depoimento Enviado!",
          description: "Obrigado por compartilhar sua experiência.",
        });
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: feedbacksRef.path,
          operation: 'create',
          requestResourceData: testimonialData,
        } satisfies SecurityRuleContext);
        
        errorEmitter.emit('permission-error', permissionError);
        setIsSubmitting(false);
      });
  };

  if (isLoadingCompany) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4 font-body">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" />
          <p className="text-muted-foreground">Localizando empresa...</p>
        </div>
      </div>
    );
  }

  if (!targetUserId && !isLoadingCompany) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4 font-body">
        <Card className="w-full max-w-md text-center shadow-xl border-none bg-card text-card-foreground">
          <CardContent className="pt-10 pb-10 space-y-6">
            <Search className="w-12 h-12 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-headline">Empresa Não Encontrada</h2>
              <p className="text-muted-foreground">O link acessado é inválido ou a empresa não está cadastrada.</p>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/'}>Voltar ao Início</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4 font-body text-foreground">
        <div className="fixed top-8 right-8">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md text-center shadow-2xl border-none bg-card text-card-foreground">
          <CardContent className="pt-10 pb-10 space-y-8">
            <div className="mx-auto bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-fit">
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-headline">Obrigado!</h2>
              <p className="text-muted-foreground">Sua avaliação foi enviada com sucesso para {displayCompanyName}.</p>
            </div>

            {googleMapsUrl && rating >= 4 && (
              <div className="pt-6 border-t space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-1">
                  <p className="text-sm font-bold">Ficamos muito felizes com sua nota!</p>
                  <p className="text-xs text-muted-foreground">Você poderia nos ajudar replicando essa avaliação no nosso perfil do Google?</p>
                </div>
                <Button 
                  onClick={handleGoogleRedirect}
                  className="w-full h-14 rounded-xl gap-3 text-sm font-bold shadow-xl hover:scale-105 active:scale-95 transition-all bg-[#4285F4] hover:bg-[#357ae8]"
                >
                  <MapPin className="w-5 h-5" /> Avaliar no Google Business
                </Button>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium">Isso nos ajuda a crescer nossa visibilidade local</p>
              </div>
            )}
            
            <div className="pt-4">
              <Button variant="ghost" onClick={handleResetForm} className="text-xs text-muted-foreground">
                Enviar outro depoimento
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4 font-body text-foreground">
      <div className="fixed top-8 right-8">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold font-headline tracking-tight">{displayCompanyName}</h1>
          <p className="text-muted-foreground">Gostaríamos de ouvir sua opinião sobre nossos serviços.</p>
        </div>

        <Card className="shadow-2xl border-none overflow-hidden bg-card text-card-foreground">
          <div className="h-2 bg-primary w-full" />
          <CardHeader className="text-center pt-8">
            <CardTitle className="text-2xl font-headline flex items-center justify-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" /> Deixe seu Depoimento
            </CardTitle>
            <CardDescription>Sua experiência é fundamental para nós.</CardDescription>
          </CardHeader>
          <CardContent className="px-6 md:px-10 pb-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3 text-center">
                <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Sua Nota</label>
                <div className="flex justify-center gap-1 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isActive = star <= (hoverRating || rating);
                    const isSelected = star <= rating;
                    
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className={cn(
                          "relative transition-all duration-300 focus:outline-none p-1",
                          isActive ? "scale-110" : "scale-100 opacity-50",
                          isSelected && "drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                        )}
                      >
                        <Star 
                          className={cn(
                            "w-10 h-10 transition-all duration-300",
                            isActive ? 'fill-primary text-primary' : 'text-muted-foreground/30'
                          )} 
                        />
                        {isSelected && (
                          <span className="absolute inset-0 animate-ping rounded-full bg-primary/20 -z-10" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {rating === 0 && (
                  <p className="text-[10px] text-destructive font-bold uppercase animate-pulse">Clique em uma estrela para avaliar</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Seu Nome</label>
                  <Input 
                    placeholder="Ex: João Silva" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    className="h-11 bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">E-mail (opcional)</label>
                  <Input 
                    type="email"
                    placeholder="Ex: joao@email.com" 
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="h-11 bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sua Mensagem</label>
                <Textarea 
                  placeholder="Conte-nos o que achou da nossa empresa..."
                  className="min-h-[120px] resize-none bg-background"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                />
              </div>

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
