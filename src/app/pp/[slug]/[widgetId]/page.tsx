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
import { Star, User, Loader2, MessageSquare, MessageCircle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

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
  const [api, setApi] = useState<CarouselApi>();

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
    }, () => {
      setIsLoading(false);
    });

    const testimonialsRef = collection(db, 'users', targetUserId, 'testimonials');
    const tQuery = query(testimonialsRef, where('status', '==', 'approved'));
    const unsubTestimonials = onSnapshot(tQuery, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllTestimonials(docs);
    }, () => {
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
  const whatsappEnabled = widgetData?.whatsappEnabled || false;
  const whatsappNumber = widgetData?.whatsappNumber || '';
  const externalSiteUrl = widgetData?.externalSiteUrl || '';

  useEffect(() => {
    if (layout === 'popup' && filteredTestimonials.length > 1) {
      const intervalId = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % filteredTestimonials.length);
      }, 5000); 
      return () => clearInterval(intervalId);
    }
    
    if (layout === 'mural' && filteredTestimonials.length > 0) {
      const intervalId = setInterval(() => {
        setMuralIndex(prev => (prev + 1) % filteredTestimonials.length);
      }, 6000);
      return () => clearInterval(intervalId);
    }
  }, [layout, filteredTestimonials]);

  useEffect(() => {
    if (!api || layout !== 'carousel') return;
    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [api, layout]);

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
              <h2 className="text-2xl font-bold font-headline text-gray-900">Mural não encontrado</h2>
              <p className="text-muted-foreground">O link acessado é inválido ou as permissões de acesso foram negadas.</p>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/'}>Voltar ao Início</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const TestimonialCard = ({ t, index = 0, noAnim = false }: { t: any, index?: number, noAnim?: boolean }) => {
    const isPopup = layout === 'popup';
    return (
      <Card 
        className={cn(
          "bg-white rounded-xl p-3 sm:p-5 space-y-2 transition-all duration-700 shadow-sm overflow-hidden border-0",
          isPopup ? "border-l-4" : "border-t-4",
          !noAnim && "animate-in fade-in zoom-in-95 slide-in-from-bottom-4"
        )}
        style={{ 
          borderTopColor: !isPopup ? themeColor : 'transparent',
          borderLeftColor: isPopup ? themeColor : 'transparent',
          borderTopWidth: !isPopup ? '4px' : '0',
          borderLeftWidth: isPopup ? '4px' : '0',
          borderStyle: 'solid',
          animationDelay: noAnim ? '0ms' : `${index * 100}ms`,
          animationFillMode: 'both',
        }}
      >
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="bg-primary/5 p-1 rounded-full shrink-0" style={{ backgroundColor: `${themeColor}10` }}>
              <User className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: themeColor }} />
            </div>
            <span className="font-bold text-[10px] sm:text-sm text-gray-900 leading-tight truncate">{t.userName}</span>
          </div>
          
          <div className="flex gap-0.5">
            {Array.from({ length: t.rating || 5 }).map((_, i) => (
              <Star key={i} className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-current" style={{ color: themeColor }} />
            ))}
          </div>

          <p className="text-gray-700 italic text-[10px] sm:text-sm leading-relaxed">
            "{t.text}"
          </p>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-body flex items-center justify-center p-0 md:p-8">
      <div className="w-full max-w-2xl bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col min-h-screen md:min-h-[90vh] overflow-hidden relative border border-gray-100 mx-auto">
        
        <nav className="h-16 border-b flex items-center px-6 justify-between shrink-0 bg-white/50 backdrop-blur-md z-20">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">SOCIAL PROOF</span>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-[9px] font-bold uppercase tracking-widest">Início</Button>
          </Link>
        </nav>

        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-24">
          <header className="px-6 py-10 sm:py-16 text-center space-y-4">
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tighter leading-tight text-gray-900">
                O que dizem sobre <br /> <span style={{ color: themeColor }}>{companyData?.companyName}</span>
              </h1>
              <p className="text-muted-foreground font-medium text-[11px] sm:text-sm max-w-md mx-auto leading-relaxed">
                {widgetData?.name} — Experiências reais de clientes satisfeitos que confiam em nosso trabalho.
              </p>
            </div>
          </header>

          <main className="px-6 space-y-6 flex-1">
            {filteredTestimonials.length === 0 ? (
              <div className="text-center py-20 opacity-20 flex flex-col items-center gap-4">
                <MessageSquare className="w-10 h-10" />
                <p className="text-[9px] font-black uppercase tracking-widest">Aguardando novos depoimentos</p>
              </div>
            ) : (
              <div className="w-full space-y-4">
                {layout === 'mural' && (
                  <div key={muralIndex} className="columns-1 sm:columns-2 gap-3 sm:gap-4 transition-all duration-700">
                    {visibleMuralTestimonials.map((t, i) => (
                      <div key={t.id + muralIndex + i} className="break-inside-avoid mb-3">
                        <TestimonialCard t={t} index={i} />
                      </div>
                    ))}
                  </div>
                )}

                {layout === 'grid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {filteredTestimonials.map((t, i) => (
                      <TestimonialCard key={t.id} t={t} index={i} />
                    ))}
                  </div>
                )}

                {layout === 'carousel' && (
                  <div className="w-full max-w-sm mx-auto py-4">
                    <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
                      <CarouselContent>
                        {filteredTestimonials.map((t, i) => (
                          <CarouselItem key={t.id} className="p-2">
                            <TestimonialCard t={t} noAnim index={i} />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                    <div className="flex justify-center gap-2 mt-6">
                      {filteredTestimonials.map((_, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-700 bg-gray-300",
                            api?.selectedScrollSnap() === i ? "w-6" : "w-1.5"
                          )}
                          style={{ backgroundColor: api?.selectedScrollSnap() === i ? themeColor : undefined }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {layout === 'popup' && (
                  <div className="flex justify-center py-4" key={filteredTestimonials[currentIndex]?.id}>
                    <TestimonialCard t={filteredTestimonials[currentIndex]} index={0} />
                  </div>
                )}
              </div>
            )}
          </main>

          <footer className="mt-auto px-6 py-10 text-center space-y-6">
            {externalSiteUrl && (
              <a 
                href={externalSiteUrl.startsWith('http') ? externalSiteUrl : `https://${externalSiteUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white text-[11px] font-black shadow-xl hover:scale-105 transition-all"
                style={{ backgroundColor: themeColor }}
              >
                Visitar Site Oficial <Globe className="w-4 h-4" />
              </a>
            )}
            <p className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold opacity-30">
              © Proova Social Proof
            </p>
          </footer>
        </div>

        {whatsappEnabled && whatsappNumber && (
          <a 
            href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-[100] bg-green-500 text-white p-4 rounded-full shadow-[0_10px_40px_rgba(34,197,94,0.4)] hover:scale-110 active:scale-95 transition-all animate-in zoom-in slide-in-from-bottom-10 duration-700"
          >
            <MessageCircle className="w-6 h-6 fill-current" />
            <span className="absolute -top-1 -right-1 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-white animate-pulse" />
          </a>
        )}
      </div>
    </div>
  );
}
