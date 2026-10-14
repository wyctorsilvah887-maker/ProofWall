
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
  onSnapshot,
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
import { ThemeToggle } from '@/components/theme-toggle';

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
  const secondaryColor = widgetData?.secondaryColor || '#ffffff';
  const whatsappEnabled = widgetData?.whatsappEnabled || false;
  const whatsappNumber = widgetData?.whatsappNumber || '';
  const externalSiteUrl = widgetData?.externalSiteUrl || '';
  const logoUrl = widgetData?.logoUrl || '';
  const coverImageUrl = widgetData?.coverImageUrl || '';
  const coverHeight = widgetData?.coverImageHeight || 45;

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
    const countToShow = Math.min(8, filteredTestimonials.length);
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
              <p className="text-muted-foreground">O link acessado é inválido.</p>
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
          "bg-card rounded-xl p-4 sm:p-6 space-y-3 transition-all duration-700 shadow-sm overflow-hidden text-left",
          isPopup ? "border-l-4" : "border-t-4",
          !noAnim && "animate-in fade-in zoom-in-95 slide-in-from-bottom-4"
        )}
        style={{ 
          borderTopColor: !isPopup ? themeColor : 'transparent',
          borderLeftColor: isPopup ? themeColor : 'transparent',
          borderTopWidth: !isPopup ? '4px' : '0',
          borderLeftWidth: iPopup ? '4px' : '0',
          borderStyle: 'solid',
          animationDelay: noAnim ? '0ms' : `${index * 100}ms`,
          animationFillMode: 'both',
          backgroundColor: secondaryColor ? `${secondaryColor}08` : undefined
        }}
      >
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full shrink-0" style={{ backgroundColor: secondaryColor ? `${secondaryColor}15` : `${themeColor}10` }}>
              <User className="w-3.5 h-3.5" style={{ color: themeColor }} />
            </div>
            <span className="font-bold text-xs sm:text-sm text-foreground leading-tight truncate">{t.userName}</span>
          </div>
          
          <div className="flex gap-0.5">
            {Array.from({ length: t.rating || 5 }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-current" style={{ color: themeColor }} />
            ))}
          </div>

          <p className="text-foreground/80 italic text-xs sm:text-sm leading-relaxed">
            "{t.text}"
          </p>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background font-body flex flex-col relative overflow-x-hidden">
      <nav className="h-16 border-b flex items-center px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">PROOVA APP</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-[9px] font-bold uppercase tracking-widest">Início</Button>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex flex-col">
        {coverImageUrl && (
          <div 
            className="w-full relative shrink-0 overflow-hidden transition-all duration-700"
            style={{ height: `${coverHeight}vh` }}
          >
            <img 
              src={coverImageUrl} 
              className="w-full h-full object-cover transition-transform duration-1000" 
              alt="Capa" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
          </div>
        )}

        <div className="w-full max-w-full mx-auto flex-1 flex flex-col">
          <header className="px-6 py-12 sm:py-24 text-center space-y-8">
            <div className="space-y-6">
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-[1.05] text-foreground max-w-5xl mx-auto">
                O que dizem sobre <span style={{ color: themeColor }}>{companyData?.companyName}</span>
              </h1>
              <p className="text-muted-foreground font-medium text-xs sm:text-sm lg:text-xl max-w-3xl mx-auto leading-relaxed px-4">
                Experiências reais de clientes que confiam em nosso trabalho.
              </p>

              <div className="flex justify-center pt-8">
                {logoUrl && (
                  <div className="w-32 h-32 relative">
                    <img src={logoUrl} className="w-full h-full object-cover rounded-[2.5rem] shadow-2xl border-4 border-background" alt="Logo Empresa" />
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="px-6 pb-20 space-y-12 flex-1 w-full max-w-[1400px] mx-auto">
            {filteredTestimonials.length === 0 ? (
              <div className="text-center py-20 opacity-20 flex flex-col items-center gap-4">
                <MessageSquare className="w-12 h-12" />
                <p className="text-[10px] font-black uppercase tracking-widest">Aguardando depoimentos</p>
              </div>
            ) : (
              <div className="w-full">
                {layout === 'mural' && (
                  <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
                    {visibleMuralTestimonials.map((t, i) => (
                      <div key={t.id + muralIndex + i} className="break-inside-avoid mb-6">
                        <TestimonialCard t={t} index={i} />
                      </div>
                    ))}
                  </div>
                )}

                {layout === 'grid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTestimonials.map((t, i) => (
                      <TestimonialCard key={t.id} t={t} index={i} />
                    ))}
                  </div>
                )}

                {layout === 'carousel' && (
                  <div className="w-full max-w-4xl mx-auto py-12 px-4">
                    <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
                      <CarouselContent>
                        {filteredTestimonials.map((t, i) => (
                          <CarouselItem key={t.id} className="p-4 md:basis-1/2">
                            <TestimonialCard t={t} noAnim index={i} />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                  </div>
                )}

                {layout === 'popup' && (
                  <div className="flex justify-center py-12 px-4" key={filteredTestimonials[currentIndex]?.id}>
                    <div className="w-full max-w-3xl">
                      <TestimonialCard t={filteredTestimonials[currentIndex]} index={0} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>

          <footer className="mt-auto px-6 py-20 text-center space-y-12 border-t bg-muted/5">
            {externalSiteUrl && (
              <a 
                href={externalSiteUrl.startsWith('http') ? externalSiteUrl : `https://${externalSiteUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-12 py-6 rounded-full text-white text-[14px] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all"
                style={{ backgroundColor: themeColor }}
              >
                Visitar Site Oficial <Globe className="w-5 h-5" />
              </a>
            )}
            <div className="space-y-4">
              <Link href="/signup" className="block text-[11px] font-black text-primary hover:underline uppercase tracking-widest">
                Quer faturar mais? Crie seu Proova
              </Link>
              <div className="flex flex-col items-center gap-2">
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold opacity-40">
                  © Proova — Prova Social de Verdade
                </p>
                <p className="text-[8px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-30">
                  Powered by Synapse Group
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {whatsappEnabled && whatsappNumber && (
        <a 
          href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-8 right-8 z-[100] bg-green-500 text-white p-6 rounded-full shadow-[0_15px_45px_rgba(34,197,94,0.5)] hover:scale-110 active:scale-95 transition-all"
        >
          <MessageCircle className="w-8 h-8 fill-current" />
          <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full border-2 border-white animate-pulse" />
        </a>
      )}
    </div>
  );
}
