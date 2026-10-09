'use client';

import { useState, useMemo, useEffect, use } from 'react';
import { useFirestore } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  limit, 
  doc, 
  onSnapshot
} from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Star, User, Loader2, MessageSquare, ShieldCheck, Zap, ArrowRight, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import Image from 'next/image';

export default function PublicPage({ params }: { params: Promise<{ slug: string, widgetId: string }> }) {
  const { slug, widgetId } = use(params);
  const db = useFirestore();

  const [isLoading, setIsLoading] = useState(true);
  const [companyData, setCompanyData] = useState<any>(null);
  const [widgetData, setWidgetData] = useState<any>(null);
  const [allTestimonials, setAllTestimonials] = useState<any[]>([]);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muralIndex, setMuralIndex] = useState(0);

  useEffect(() => {
    if (!db || !slug) return;

    const userRef = doc(db, 'users', slug);
    const unsubUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setTargetUserId(slug);
        setCompanyData(docSnap.data());
      } else {
        const q = query(collection(db, 'users'), where('companySlug', '==', slug), limit(1));
        getDocs(q).then(snapshot => {
          if (!snapshot.empty) {
            setTargetUserId(snapshot.docs[0].id);
            setCompanyData(snapshot.docs[0].data());
          } else {
            setIsLoading(false);
          }
        }).catch(() => setIsLoading(false));
      }
    }, (error) => {
      console.error("Erro ao carregar usuário:", error);
      setIsLoading(false);
    });

    return () => unsubUser();
  }, [db, slug]);

  useEffect(() => {
    if (!db || !targetUserId || !widgetId) return;

    const widgetRef = doc(db, 'users', targetUserId, 'widgets', widgetId);
    const unsubWidget = onSnapshot(widgetRef, (docSnap) => {
      if (docSnap.exists()) {
        setWidgetData(docSnap.data());
      } else {
        setWidgetData(null);
      }
      setIsLoading(false);
    }, async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: widgetRef.path,
        operation: 'get',
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
      setIsLoading(false);
    });

    const testimonialsRef = collection(db, 'users', targetUserId, 'testimonials');
    const tQuery = query(testimonialsRef, where('status', '==', 'approved'));
    const unsubTestimonials = onSnapshot(tQuery, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllTestimonials(docs);
    }, async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: testimonialsRef.path,
        operation: 'list',
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
      setIsLoading(false);
    });

    return () => {
      unsubWidget();
      unsubTestimonials();
    };
  }, [db, targetUserId, widgetId]);

  const filteredTestimonials = useMemo(() => {
    if (!widgetData || !allTestimonials.length) return [];
    const selectedIds = widgetData.selectedTestimonialIds || [];
    return allTestimonials.filter(t => selectedIds.includes(t.id));
  }, [widgetData, allTestimonials]);

  const layout = widgetData?.layout || 'mural';
  const themeColor = widgetData?.themeColor || '#f97316';
  const coverImageUrl = widgetData?.coverImageUrl || '';
  const whatsappEnabled = widgetData?.whatsappEnabled || false;
  const whatsappNumber = widgetData?.whatsappNumber || '';

  useEffect(() => {
    if ((layout === 'carousel' || layout === 'popup') && filteredTestimonials.length > 1) {
      const intervalId = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % filteredTestimonials.length);
      }, 3000); 
      return () => clearInterval(intervalId);
    }
    
    if (layout === 'mural' && filteredTestimonials.length > 0) {
      const intervalId = setInterval(() => {
        setMuralIndex(prev => (prev + 1) % filteredTestimonials.length);
      }, 6000);
      return () => clearInterval(intervalId);
    }
  }, [layout, filteredTestimonials]);

  const visibleMuralTestimonials = useMemo(() => {
    if (layout !== 'mural' || filteredTestimonials.length === 0) return [];
    
    const slice = [];
    const countToShow = Math.min(4, filteredTestimonials.length);
    for (let i = 0; i < countToShow; i++) {
      const idx = (muralIndex + i) % filteredTestimonials.length;
      slice.push(filteredTestimonials[idx]);
    }
    return slice;
  }, [filteredTestimonials, muralIndex, layout]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4 font-body">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando prova social...</p>
        </div>
      </div>
    );
  }

  if (!companyData || !widgetData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4 font-body">
        <Card className="w-full max-w-md text-center shadow-xl border-none">
          <CardContent className="pt-10 pb-10 space-y-6">
            <div className="mx-auto bg-muted p-4 rounded-full w-fit">
              <MessageSquare className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-headline">Mural não encontrado</h2>
              <p className="text-muted-foreground">O link acessado é inválido ou as permissões de acesso foram negadas.</p>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/'}>Voltar ao Início</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const TestimonialCard = ({ t, isPopup = false, index = 0 }: { t: any, isPopup?: boolean, index?: number }) => (
    <Card 
      className={cn(
        "break-inside-avoid border-none shadow-lg transition-all duration-700 bg-background group mb-6",
        "hover:-translate-y-2 hover:shadow-2xl hover:ring-2",
        isPopup ? "max-w-full sm:max-w-md border-l-4" : "border-t-4",
        "animate-in fade-in zoom-in-95 slide-in-from-right-12"
      )} 
      style={{ 
        borderTopColor: !isPopup ? themeColor : 'transparent',
        borderLeftColor: isPopup ? themeColor : 'transparent',
        borderTopWidth: !isPopup ? '4px' : '0',
        borderLeftWidth: isPopup ? '4px' : '0',
        borderStyle: 'solid',
        animationDelay: `${index * 150}ms`,
        animationFillMode: 'both',
        boxShadow: `0 10px 30px -15px ${themeColor}40`,
        // @ts-ignore
        "--tw-ring-color": `${themeColor}20`
      }}
    >
      <CardContent className="p-4 md:p-6 space-y-4">
        <div className="flex flex-col space-y-3">
          <div className="flex items-start justify-between w-full gap-2">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-primary/5 p-1 rounded-full shrink-0" style={{ backgroundColor: `${themeColor}10` }}>
                  <User className="w-3.5 h-3.5" style={{ color: themeColor }} />
                </div>
                <p className="font-bold text-sm text-gray-900 leading-tight truncate">{t.userName}</p>
              </div>
              <div className="flex gap-0.5 pl-7">
                {Array.from({ length: t.rating || 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 transition-transform group-hover:scale-110" style={{ color: themeColor, fill: themeColor }} />
                ))}
              </div>
            </div>
            <Badge variant="outline" className="text-[8px] md:text-[9px] bg-green-50 text-green-600 border-green-200 px-1.5 md:px-2 shrink-0 whitespace-nowrap h-fit">
              <ShieldCheck className="w-3 h-3 mr-1" /> Verificado
            </Badge>
          </div>

          <blockquote className="text-sm md:text-base text-gray-700 leading-relaxed italic group-hover:text-gray-900 transition-colors pt-1 overflow-hidden break-words">
            "{t.text}"
          </blockquote>

          <div className="pt-3 border-t border-muted/50 mt-2 flex items-center justify-between">
            <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
              {t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString('pt-BR') : 'Cliente Recente'}
            </p>
            <Zap className="w-3 h-3 text-primary/30 animate-pulse" style={{ color: themeColor }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-muted/10 font-body pb-12 md:pb-20 relative overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 h-16 md:h-20 bg-background/80 backdrop-blur-md border-b z-[150] flex items-center px-4 md:px-8 justify-between transition-all">
        <div className="flex items-center gap-2">
           <Image src="/maskable_icon_x512 (3).png" alt="Logo" width={64} height={64} className="rounded-2xl shadow-sm" />
        </div>
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-xs md:text-sm font-bold text-muted-foreground hover:text-primary uppercase tracking-widest">Início</Button>
        </Link>
      </nav>

      <header className={cn(
        "bg-background border-b shadow-sm relative overflow-hidden text-center transition-all pt-20 md:pt-24",
        coverImageUrl ? "pb-12 md:pb-20" : "py-12 md:py-24 px-4"
      )}>
        {coverImageUrl && (
          <div className="w-full h-48 md:h-80 relative mb-8 md:mb-12">
            <img src={coverImageUrl} className="w-full h-full object-cover" alt="Capa da Empresa" />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>
        )}

        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Zap className="w-24 h-24 md:w-48 md:h-48" style={{ color: themeColor }} />
        </div>
        
        <div className="max-w-5xl mx-auto space-y-4 md:space-y-8 relative z-10 px-4 flex flex-col items-center">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none px-6 md:px-8 py-1.5 md:py-2 text-[9px] md:text-xs uppercase tracking-[0.3em] font-black" style={{ backgroundColor: `${themeColor}20`, color: themeColor }}>
            Social Proof
          </Badge>
          <h1 className="text-3xl sm:text-5xl md:text-8xl font-black font-headline tracking-tighter text-gray-900 leading-[1] md:leading-[0.85]">
            O que dizem sobre <br className="hidden sm:block"/> <span className="underline decoration-4 md:decoration-8 underline-offset-8" style={{ textDecorationColor: `${themeColor}40` }}>{companyData?.companyName}</span>
          </h1>
          <p className="text-base md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium px-4 leading-relaxed">
            {widgetData?.name} — Experiências reais de clientes satisfeitos que confiam em nosso trabalho.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 md:mt-20 overflow-hidden">
        {filteredTestimonials.length === 0 ? (
          <div className="text-center py-20 md:py-40 bg-background rounded-2xl md:rounded-[3rem] border-2 md:border-4 border-dashed border-muted px-4 shadow-inner">
            <MessageSquare className="w-16 h-16 md:w-24 md:h-24 text-muted-foreground/10 mx-auto mb-6 md:mb-8" />
            <p className="text-muted-foreground text-base md:text-xl font-bold uppercase tracking-widest">Aguardando novos depoimentos...</p>
          </div>
        ) : (
          <div className="w-full">
            {layout === 'mural' && (
              <div 
                key={muralIndex}
                className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-10 max-w-6xl mx-auto px-1"
              >
                {visibleMuralTestimonials.map((t, i) => (
                  <TestimonialCard key={t.id + muralIndex + i} t={t} index={i} />
                ))}
              </div>
            )}

            {layout === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-10">
                {filteredTestimonials.map((t, i) => (
                  <TestimonialCard key={t.id} t={t} index={i} />
                ))}
              </div>
            )}

            {layout === 'carousel' && (
              <div className="flex flex-col items-center gap-8 md:gap-16 py-8 md:py-20 overflow-hidden px-1">
                <div className="relative w-full max-w-3xl flex items-center justify-center">
                  <div className="w-full min-w-0" key={filteredTestimonials[currentIndex].id}>
                    <TestimonialCard t={filteredTestimonials[currentIndex]} index={0} />
                  </div>
                </div>
                <div className="flex gap-3 md:gap-4">
                  {filteredTestimonials.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentIndex(i)}
                      className={cn(
                        "h-2 md:h-2.5 rounded-full transition-all duration-700",
                        i === currentIndex ? "w-8 md:w-16" : "w-2 md:w-2.5 bg-gray-300 hover:bg-gray-400"
                      )}
                      style={{ backgroundColor: i === currentIndex ? themeColor : undefined }}
                    />
                  ))}
                </div>
              </div>
            )}

            {layout === 'popup' && (
              <div className="flex flex-col items-center justify-center min-h-[400px] md:min-h-[600px] py-12 md:py-24 relative px-4 overflow-hidden">
                <div 
                  key={filteredTestimonials[currentIndex].id}
                  className="w-full max-w-md animate-in slide-in-from-bottom-12 fade-in zoom-in duration-700 ease-out shadow-2xl"
                >
                  <TestimonialCard t={filteredTestimonials[currentIndex]} isPopup index={0} />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {whatsappEnabled && whatsappNumber && (
        <a 
          href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-8 right-8 z-[200] bg-green-500 text-white p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all animate-in zoom-in fade-in duration-700"
          title="Falar no WhatsApp"
        >
          <MessageCircle className="w-10 h-10 fill-current" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white animate-bounce">1</span>
        </a>
      )}

      <footer className="mt-20 md:mt-40 py-16 md:py-32 border-t bg-background text-center px-4 overflow-hidden shadow-inner">
        <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
          <div className="flex flex-col items-center gap-6 md:gap-10">
            <Link 
              href={`/c/${companyData?.companySlug || slug}`}
              className="inline-flex items-center gap-3 md:gap-4 px-10 md:px-14 py-4 md:py-6 rounded-full text-primary-foreground text-sm md:text-xl font-black hover:scale-105 transition-all shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]"
              style={{ backgroundColor: themeColor }}
            >
              Deixar meu feedback <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
