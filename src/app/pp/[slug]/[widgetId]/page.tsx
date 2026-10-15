
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
import { Card } from '@/components/ui/card';
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
    }, () => setIsLoading(false));

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
    }, () => setIsLoading(false));

    const testimonialsRef = collection(db, 'users', targetUserId, 'testimonials');
    const tQuery = query(testimonialsRef, where('status', '==', 'approved'));
    const unsubTestimonials = onSnapshot(tQuery, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllTestimonials(docs);
    }, () => setIsLoading(false));

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

  useEffect(() => {
    if (layout === 'mural' && filteredTestimonials.length > 0) {
      const interval = setInterval(() => setMuralIndex(prev => (prev + 1) % filteredTestimonials.length), 6000);
      return () => clearInterval(interval);
    }
  }, [layout, filteredTestimonials]);

  useEffect(() => {
    if (!api || layout !== 'carousel') return;
    const interval = setInterval(() => api.scrollNext(), 5000);
    return () => clearInterval(interval);
  }, [api, layout]);

  const visibleMuralTestimonials = useMemo(() => {
    if (layout !== 'mural' || filteredTestimonials.length === 0) return [];
    const slice = [];
    const count = Math.min(8, filteredTestimonials.length);
    for (let i = 0; i < count; i++) {
      const idx = (muralIndex + i) % filteredTestimonials.length;
      slice.push(filteredTestimonials[idx]);
    }
    return slice;
  }, [filteredTestimonials, muralIndex, layout]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4 font-body">
        <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" />
      </div>
    );
  }

  const hasValidCover = coverImageUrl && coverImageUrl.startsWith('http');
  const hasValidLogo = logoUrl && logoUrl.startsWith('http');

  const TestimonialCard = ({ t, index = 0 }: { t: any, index?: number }) => {
    const side = (index + muralIndex) % 2 === 0 ? 'left' : 'right';
    return (
      <Card 
        key={`${t.id}-${muralIndex}`}
        className={cn(
          "bg-card rounded-xl p-6 border-t-4 shadow-sm animate-in duration-700 ease-out fill-both",
          side === 'left' ? "slide-in-from-left-full fade-in" : "slide-in-from-right-full fade-in"
        )}
        style={{ 
          borderTopColor: themeColor,
          backgroundColor: secondaryColor ? `${secondaryColor}08` : undefined
        }}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/5 p-2 rounded-full" style={{ backgroundColor: secondaryColor ? `${secondaryColor}15` : `${themeColor}15` }}>
              <User className="w-4 h-4" style={{ color: themeColor }} />
            </div>
            <span className="font-bold text-sm text-foreground">{t.userName}</span>
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: t.rating || 5 }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-current" style={{ color: themeColor }} />
            ))}
          </div>
          <p className="text-foreground/80 italic text-sm leading-relaxed">"{t.text}"</p>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background font-body flex flex-col relative overflow-x-hidden">
      <nav className="h-16 border-b flex items-center px-6 justify-between bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">PROOVA</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/"><Button variant="ghost" size="sm" className="text-[9px] font-bold uppercase tracking-widest">Início</Button></Link>
        </div>
      </nav>

      <div className="flex-1 flex flex-col">
        {hasValidCover && (
          <div className="w-full relative h-[45vh] overflow-hidden">
            <img src={coverImageUrl} className="w-full h-full object-cover" alt="Capa" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
        )}

        <div className="w-full max-w-full mx-auto flex-1 flex flex-col">
          <header className={cn("px-6 text-center space-y-12", hasValidCover ? "py-12 sm:py-24" : "py-24 sm:py-32")}>
            <div className="space-y-10">
              {hasValidLogo && (
                <div className="flex justify-center">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 relative">
                    <img src={logoUrl} className="w-full h-full object-cover rounded-[2.5rem] shadow-2xl border-4 border-background" alt="Logo" />
                  </div>
                </div>
              )}
              <h1 className="text-4xl sm:text-7xl font-black tracking-tighter text-foreground leading-[1.05] max-w-5xl mx-auto">
                O que dizem sobre <span style={{ color: themeColor }}>{companyData?.companyName}</span>
              </h1>
            </div>
          </header>

          <main className="px-6 pb-20 space-y-12 flex-1 w-full max-w-[1400px] mx-auto">
            {filteredTestimonials.length === 0 ? (
              <div className="text-center py-20 opacity-20 flex flex-col items-center gap-4">
                <MessageSquare className="w-12 h-12" />
                <p className="text-[9px] font-black uppercase">Aguardando depoimentos</p>
              </div>
            ) : (
              <div className="w-full">
                {layout === 'mural' && (
                  <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
                    {visibleMuralTestimonials.map((t, i) => (
                      <div key={`${t.id}-${muralIndex}-${i}`} className="break-inside-avoid mb-6">
                        <TestimonialCard t={t} index={i} />
                      </div>
                    ))}
                  </div>
                )}
                {layout === 'grid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTestimonials.map((t, i) => <TestimonialCard key={t.id} t={t} index={i} />)}
                  </div>
                )}
                {layout === 'carousel' && (
                  <Carousel setApi={setApi} opts={{ loop: true }} className="w-full max-w-4xl mx-auto">
                    <CarouselContent>
                      {filteredTestimonials.map((t, i) => (
                        <CarouselItem key={t.id} className="p-4 md:basis-1/2">
                          <TestimonialCard t={t} index={i} />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                )}
              </div>
            )}
          </main>

          <footer className="mt-auto px-6 py-20 text-center space-y-12 border-t bg-muted/5">
            {externalSiteUrl && (
              <a href={externalSiteUrl.startsWith('http') ? externalSiteUrl : `https://${externalSiteUrl}`} target="_blank" className="inline-flex items-center gap-3 px-12 py-6 rounded-full text-white text-[14px] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all" style={{ backgroundColor: themeColor }}>
                Visitar Site Oficial <Globe className="w-5 h-5" />
              </a>
            )}
            <div className="flex flex-col items-center gap-2 opacity-30">
              <p className="text-[9px] font-bold">PROOVA — Prova Social de Verdade</p>
            </div>
          </footer>
        </div>
      </div>

      {whatsappEnabled && whatsappNumber && (
        <a href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`} target="_blank" className="fixed bottom-8 right-8 z-[100] bg-green-500 text-white p-6 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all">
          <MessageCircle className="w-8 h-8 fill-current" />
        </a>
      )}
    </div>
  );
}
