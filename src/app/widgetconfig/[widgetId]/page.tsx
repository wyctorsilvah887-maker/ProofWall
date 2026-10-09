
'use client';

import { useState, useMemo, useEffect, use } from 'react';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  doc, 
} from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Star, User, Loader2, MessageSquare, ShieldCheck, Zap, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type LayoutType = 'mural' | 'carousel' | 'grid' | 'popup';

const TestimonialCard = ({ t, isPopup = false, index = 0, themeColor }: { t: any, isPopup?: boolean, index?: number, themeColor: string }) => (
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

export default function WidgetPublicMural({ params }: { params: Promise<{ widgetId: string }> }) {
  const { widgetId } = use(params);
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();

  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muralIndex, setMuralIndex] = useState(0);

  useEffect(() => {
    if (user) setTargetUserId(user.uid);
  }, [user]);

  const widgetRef = useMemo(() => (db && targetUserId ? doc(db, 'users', targetUserId, 'widgets', widgetId) : null), [db, targetUserId, widgetId]);
  const { data: widgetData, loading: widgetLoading } = useDoc(widgetRef);

  const testimonialsQuery = useMemo(() => {
    if (!db || !targetUserId) return null;
    return query(
      collection(db, 'users', targetUserId, 'testimonials'),
      where('status', '==', 'approved')
    );
  }, [db, targetUserId]);

  const { data: allTestimonials, loading: testimonialsLoading } = useCollection(testimonialsQuery);

  const filteredTestimonials = useMemo(() => {
    if (!widgetData || !allTestimonials?.length) return [];
    const selectedIds = widgetData.selectedTestimonialIds || [];
    return allTestimonials.filter(t => selectedIds.includes(t.id));
  }, [widgetData, allTestimonials]);

  const layout = widgetData?.layout || 'mural';
  const themeColor = widgetData?.themeColor || '#f97316';

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

  if (authLoading || widgetLoading || testimonialsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 font-body pb-20 relative overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b z-[150] flex items-center px-4 justify-between">
        <Link href="/widgets">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
          </Button>
        </Link>
        <div className="text-sm font-bold truncate max-w-[200px]">{widgetData?.name}</div>
        <Badge className="bg-primary/10 text-primary border-none text-[10px]">Página Pública</Badge>
      </nav>

      <main className="max-w-7xl mx-auto px-4 mt-24">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-3xl md:text-5xl font-black font-headline tracking-tighter">
            Visualização do <span style={{ color: themeColor }}>Mural</span>
          </h1>
          <p className="text-muted-foreground">Exibição real de como o mural aparece em seu site.</p>
        </div>

        {filteredTestimonials.length === 0 ? (
          <div className="text-center py-20 bg-background rounded-2xl border-4 border-dashed border-muted px-4">
            <MessageSquare className="w-16 h-16 text-muted-foreground/10 mx-auto mb-6" />
            <p className="text-muted-foreground font-bold uppercase tracking-widest">Nenhum depoimento selecionado.</p>
            <Link href={`/widgets/${widgetId}`} className="mt-4 block">
              <Button variant="outline">Ir para o Editor</Button>
            </Link>
          </div>
        ) : (
          <div className="w-full">
            {layout === 'mural' && (
              <div key={muralIndex} className="columns-1 sm:columns-2 lg:columns-3 gap-6 max-w-6xl mx-auto">
                {visibleMuralTestimonials.map((t, i) => (
                  <TestimonialCard key={t.id + muralIndex + i} t={t} index={i} themeColor={themeColor} />
                ))}
              </div>
            )}
            {layout === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTestimonials.map((t, i) => (
                  <TestimonialCard key={t.id} t={t} index={i} themeColor={themeColor} />
                ))}
              </div>
            )}
            {layout === 'carousel' && (
              <div className="flex flex-col items-center gap-8 py-8">
                <div className="relative w-full max-w-3xl flex items-center justify-center">
                  <div className="w-full min-w-0" key={filteredTestimonials[currentIndex].id}>
                    <TestimonialCard t={filteredTestimonials[currentIndex]} index={0} themeColor={themeColor} />
                  </div>
                </div>
                <div className="flex gap-2">
                  {filteredTestimonials.map((_, i) => (
                    <button key={i} onClick={() => setCurrentIndex(i)} className={cn("h-2 rounded-full transition-all duration-700", i === currentIndex ? "w-12" : "w-2 bg-gray-300")} style={{ backgroundColor: i === currentIndex ? themeColor : undefined }} />
                  ))}
                </div>
              </div>
            )}
            {layout === 'popup' && (
              <div className="flex flex-col items-center justify-center min-h-[400px] py-12 relative">
                <div key={filteredTestimonials[currentIndex].id} className="w-full max-w-md animate-in slide-in-from-bottom-12 duration-700 shadow-2xl">
                  <TestimonialCard t={filteredTestimonials[currentIndex]} isPopup index={0} themeColor={themeColor} />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-20 py-10 text-center opacity-50 text-[10px] uppercase tracking-widest font-bold">
        © Proova Social Proof
      </footer>
    </div>
  );
}
