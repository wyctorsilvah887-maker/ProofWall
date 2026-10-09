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
import { Star, User, Loader2, MessageSquare, Zap, MessageCircle, Globe, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import Image from 'next/image';
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

    // Tenta carregar por ID ou por Slug
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
      setIsLoading(false);
    });

    const testimonialsRef = collection(db, 'users', targetUserId, 'testimonials');
    const tQuery = query(testimonialsRef, where('status', '==', 'approved'));
    const unsubTestimonials = onSnapshot(tQuery, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllTestimonials(docs);
    }, async (serverError) => {
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
              <p className="text-muted-foreground">O link acessado é inválido ou não possui depoimentos selecionados.</p>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/'}>Voltar ao Início</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const TestimonialCard = ({ t, isPopup = false, index = 0, noAnim = false }: { t: any, isPopup?: boolean, index?: number, noAnim?: boolean }) => {
    const slideSide = (index + muralIndex) % 2 === 0 ? 'left' : 'right';
    const slideClass = layout === 'mural' 
      ? (slideSide === 'left' ? "slide-in-from-left-full" : "slide-in-from-right-full") 
      : (isPopup ? "slide-in-from-bottom-full" : "slide-in-from-bottom-8");

    return (
      <Card 
        className={cn(
          "break-inside-avoid border-none shadow-lg transition-all duration-700 bg-background group",
          !noAnim && "hover:shadow-2xl",
          isPopup ? "max-w-full border-l-4" : "border-t-4",
          !noAnim && "animate-in fade-in zoom-in-95 duration-1000 ease-out",
          !noAnim && slideClass,
          layout === 'mural' ? "mb-6" : ""
        )} 
        style={{ 
          borderTopColor: !isPopup ? themeColor : 'transparent',
          borderLeftColor: isPopup ? themeColor : 'transparent',
          borderTopWidth: !isPopup ? '4px' : '0',
          borderLeftWidth: isPopup ? '4px' : '0',
          borderStyle: 'solid',
          animationDelay: isPopup || noAnim ? '0ms' : `${index * 150}ms`,
          animationFillMode: 'both',
          boxShadow: `0 10px 30px -15px ${themeColor}40`,
        }}
      >
        <CardContent className={cn("p-4 md:p-6 space-y-4")}>
          <div className="flex flex-col space-y-3">
            <div className="flex items-start justify-between w-full gap-2">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-primary/5 p-1 rounded-full shrink-0" style={{ backgroundColor: `${themeColor}10` }}>
                    <User className="w-3.5 h-3.5" style={{ color: themeColor }} />
                  </div>
                  <p className="font-bold text-xs text-gray-900 leading-tight truncate">{t.userName}</p>
                </div>
                <div className="flex gap-0.5 pl-7">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 transition-transform group-hover:scale-110" style={{ color: themeColor, fill: themeColor }} />
                  ))}
                </div>
              </div>
            </div>

            <blockquote className="text-sm text-gray-700 leading-relaxed italic group-hover:text-gray-900 transition-colors pt-1 overflow-hidden break-words">
              "{t.text}"
            </blockquote>

            <div className="pt-3 border-t border-muted/50 mt-2 flex items-center justify-between">
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">
                {t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString('pt-BR') : 'Cliente Recente'}
              </p>
              <Zap className="w-3 h-3 text-primary/30 animate-pulse" style={{ color: themeColor }} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-muted/20 font-body flex items-center justify-center p-0 md:p-6 overflow-x-hidden">
      {/* Container Principal Estilo Device/App */}
      <div className="w-full max-w-2xl bg-background md:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] md:ring-1 md:ring-primary/5 flex flex-col min-h-screen md:min-h-[850px] overflow-hidden relative">
        
        {/* Header/Nav Interno */}
        <nav className="h-16 border-b flex items-center px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md z-20">
          <div className="flex items-center gap-2">
            <Image src="/maskable_icon_x512 (3).png" alt="Logo" width={40} height={40} className="rounded-xl" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">VIP Social Proof</span>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest">Início</Button>
          </Link>
        </nav>

        {/* Conteúdo da Página VIP */}
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-20">
          {/* Capa */}
          {coverImageUrl ? (
            <div className="h-48 w-full relative shrink-0">
              <img src={coverImageUrl} className="w-full h-full object-cover" alt="Capa" />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            </div>
          ) : (
            <div className="h-40 w-full bg-muted/30 flex flex-col items-center justify-center text-muted-foreground/20 shrink-0">
              <Zap className="w-16 h-16" style={{ color: `${themeColor}20` }} />
            </div>
          )}

          {/* Cabeçalho da Empresa */}
          <header className="px-6 py-8 text-center space-y-4">
            <Badge variant="outline" className="text-[8px] uppercase tracking-[0.2em] font-black py-1 px-4 border-primary/20 text-primary" style={{ borderColor: `${themeColor}40`, color: themeColor }}>
              Aprovado por Clientes
            </Badge>
            <h1 className="text-4xl font-black tracking-tighter leading-tight text-gray-900" style={{ color: themeColor }}>
              {companyData?.companyName}
            </h1>
            <p className="text-muted-foreground font-medium text-lg max-w-md mx-auto">
              {widgetData?.name}
            </p>
          </header>

          {/* Testemunhos */}
          <main className="px-6 space-y-8 flex-1">
            {filteredTestimonials.length === 0 ? (
              <div className="text-center py-20 opacity-20 flex flex-col items-center gap-4">
                <MessageSquare className="w-12 h-12" />
                <p className="text-[10px] font-black uppercase tracking-widest">Aguardando novos depoimentos</p>
              </div>
            ) : (
              <div className="w-full">
                {layout === 'mural' && (
                  <div key={muralIndex} className="columns-1 sm:columns-2 gap-4 transition-all duration-700">
                    {visibleMuralTestimonials.map((t, i) => (
                      <div key={t.id + muralIndex + i} className="break-inside-avoid">
                        <TestimonialCard t={t} index={i} />
                      </div>
                    ))}
                  </div>
                )}

                {layout === 'grid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div className="flex justify-center py-10" key={filteredTestimonials[currentIndex]?.id}>
                    <TestimonialCard t={filteredTestimonials[currentIndex]} isPopup index={0} />
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Rodapé / Link Externo */}
          <footer className="mt-auto px-6 py-12 text-center space-y-6">
            {externalSiteUrl && (
              <a 
                href={externalSiteUrl.startsWith('http') ? externalSiteUrl : `https://${externalSiteUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white text-sm font-black shadow-xl hover:scale-105 transition-all"
                style={{ backgroundColor: themeColor }}
              >
                Visitar Site Oficial <Globe className="w-4 h-4" />
              </a>
            )}
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold opacity-30">
              © Proova Social Proof VIP
            </p>
          </footer>
        </div>

        {/* WhatsApp Flutuante Interno */}
        {whatsappEnabled && whatsappNumber && (
          <a 
            href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="absolute bottom-6 right-6 z-30 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
          >
            <MessageCircle className="w-6 h-6 fill-current" />
            <span className="absolute -top-1 -right-1 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-white animate-pulse" />
          </a>
        )}
      </div>
    </div>
  );
}
