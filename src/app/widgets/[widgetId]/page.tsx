'use client';

import { useState, useMemo, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Star, 
  Eye,
  Settings,
  MessageSquare,
  Check,
  User,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, updateDoc, collection, query, where } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function WidgetEditPage({ params }: { params: Promise<{ widgetId: string }> }) {
  const { widgetId } = use(params);
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const widgetRef = useMemo(() => (db && user ? doc(db, 'users', user.uid, 'widgets', widgetId) : null), [db, user, widgetId]);
  const { data: widgetData, loading: widgetLoading } = useDoc(widgetRef);

  const testimonialsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'testimonials'),
      where('status', '==', 'approved')
    );
  }, [db, user]);

  const { data: approvedTestimonials, loading: testimonialsLoading } = useCollection(testimonialsQuery);

  const [widgetName, setWidgetName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    if (widgetData) {
      setWidgetName(widgetData.name || '');
      setSelectedIds(widgetData.selectedTestimonialIds || []);
    }
  }, [widgetData]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  // Filtra os depoimentos aprovados que foram selecionados para este widget
  const selectedTestimonials = useMemo(() => {
    if (!approvedTestimonials) return [];
    return approvedTestimonials.filter((t: any) => selectedIds.includes(t.id));
  }, [approvedTestimonials, selectedIds]);

  // Efeito para alternar depoimentos no Preview
  useEffect(() => {
    if (selectedTestimonials.length > 1) {
      const interval = setInterval(() => {
        setPreviewIndex((prev) => (prev + 1) % selectedTestimonials.length);
      }, 4000);
      return () => clearInterval(interval);
    } else {
      setPreviewIndex(0);
    }
  }, [selectedTestimonials]);

  const handleSave = async () => {
    if (!widgetRef || !widgetName.trim()) return;

    setIsSaving(true);
    const updates = {
      name: widgetName.trim(),
      selectedTestimonialIds: selectedIds,
    };

    updateDoc(widgetRef, updates)
      .then(() => {
        setIsSaving(false);
        toast({
          title: "Widget Atualizado",
          description: "As alterações do seu mural foram salvas.",
        });
      })
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: widgetRef.path,
          operation: 'update',
          requestResourceData: updates,
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsSaving(false);
      });
  };

  const toggleTestimonial = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (authLoading || widgetLoading || testimonialsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  if (!widgetData) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <h2 className="text-xl font-bold">Widget não encontrado</h2>
        <Link href="/widgets">
          <Button>Voltar para a lista</Button>
        </Link>
      </div>
    );
  }

  const currentPreview = selectedTestimonials[previewIndex];

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col font-body pb-20">
      <header className="bg-background border-b h-16 flex items-center px-6 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/widgets">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold font-headline tracking-tight">{widgetName || 'Configurar Mural'}</h1>
            <p className="text-xs text-muted-foreground">Editor de Prova Social</p>
          </div>
        </div>

        <div className="ml-auto">
          <Button onClick={handleSave} disabled={isSaving} className="shadow-lg">
            {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Alterações
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 grid gap-8 lg:grid-cols-3 max-w-7xl">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" /> Configurações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Widget</Label>
                <Input 
                  value={widgetName}
                  onChange={(e) => setWidgetName(e.target.value)}
                  placeholder="Ex: Mural da Home Page"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-primary/5 border border-primary/10 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" /> Visualização Dinâmica
              </CardTitle>
              <CardDescription>
                Simulação real dos {selectedIds.length} depoimentos selecionados.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-10 min-h-[220px] items-center">
              {currentPreview ? (
                <div 
                  key={currentPreview.id}
                  className="bg-background rounded-2xl p-4 shadow-2xl border-2 border-primary/20 text-left w-full max-w-[280px] animate-in fade-in zoom-in-95 duration-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-primary/10 p-1.5 rounded-full">
                      <User className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold leading-tight">{currentPreview.userName}</p>
                      <div className="flex gap-0.5">
                        {Array.from({ length: currentPreview.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-2 h-2 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                    <Badge className="ml-auto text-[8px] h-4 px-1 bg-green-500/10 text-green-600 hover:bg-green-500/10 border-none">
                      Verificado
                    </Badge>
                  </div>
                  <p className="text-[11px] text-gray-700 italic line-clamp-2 leading-relaxed">
                    "{currentPreview.text}"
                  </p>
                  <div className="mt-2 pt-2 border-t border-muted flex items-center justify-between">
                    <span className="text-[8px] text-muted-foreground uppercase font-semibold tracking-tighter">
                      Proova Social Proof
                    </span>
                    <Zap className="w-2.5 h-2.5 text-primary animate-pulse" />
                  </div>
                </div>
              ) : (
                <div className="bg-muted/20 border-2 border-dashed rounded-2xl p-8 text-muted-foreground flex flex-col items-center gap-3 text-center w-full max-w-[280px]">
                  <MessageSquare className="w-8 h-8 opacity-20" />
                  <p className="text-[10px] uppercase font-bold tracking-widest leading-tight">
                    Selecione depoimentos para ver a prévia
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold font-headline">Selecionar Depoimentos</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedIds.length} selecionado(s)
            </p>
          </div>

          {!approvedTestimonials || approvedTestimonials.length === 0 ? (
            <Card className="border-2 border-dashed bg-transparent">
              <CardContent className="py-20 text-center space-y-4">
                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                <div className="space-y-1">
                  <p className="font-bold text-muted-foreground">Nenhum depoimento encontrado</p>
                  <p className="text-sm text-muted-foreground">Compartilhe seu link de coleta para receber os primeiros feedbacks.</p>
                </div>
                <Link href="/dash">
                  <Button variant="outline">Ir para Dash</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {approvedTestimonials.map((t: any) => (
                <div 
                  key={t.id}
                  onClick={() => toggleTestimonial(t.id)}
                  className={cn(
                    "relative group cursor-pointer transition-all duration-200 rounded-xl border-2 p-4 md:p-6 bg-card hover:border-primary/50",
                    selectedIds.includes(t.id) ? "border-primary bg-primary/5" : "border-transparent shadow-sm"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors shrink-0",
                      selectedIds.includes(t.id) ? "bg-primary border-primary" : "border-muted-foreground/30"
                    )}>
                      {selectedIds.includes(t.id) && <Check className="w-4 h-4 text-white" />}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{t.userName}</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: t.rating || 5 }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                          {t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString('pt-BR') : 'Recente'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 italic leading-relaxed">
                        "{t.text}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
