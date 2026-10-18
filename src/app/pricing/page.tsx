
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Check, 
  ArrowRight, 
  Zap, 
  Star, 
  Shield as ShieldIcon, 
  ArrowLeft, 
  Clock, 
  User, 
  LogOut, 
  TrendingUp, 
  Layout, 
  Inbox, 
  Gem, 
  Sun, 
  Moon,
  Loader2
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useUser, useAuth, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useTheme } from 'next-themes';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export default function PricingPage() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const userDocRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: userData } = useDoc(userDocRef);

  const membershipLabel = useMemo(() => {
    const status = userData?.membershipStatus;
    if (status === 'enterprise') return 'Membro Enterprise';
    if (status === 'gold') return 'Membro Gold';
    if (status === 'trial') return 'Período Trial';
    return null;
  }, [userData]);

  // Geramos os links dinâmicos passando o UID do usuário para a Cakto
  const checkoutLinks = useMemo(() => {
    const uidParam = user ? `&ext_id=${user.uid}` : '';
    return {
      gold: `https://pay.cakto.com.br/8c7bbit_1215637${uidParam}`,
      enterprise: `https://pay.cakto.com.br/yhtkwz4_1215645${uidParam}`
    };
  }, [user]);

  const plans = [
    {
      name: "Trial",
      price: "Grátis",
      period: "/14 dias",
      description: "Experimente o poder da prova social sem compromisso por duas semanas.",
      features: [
        "Acesso total por 14 dias",
        "Coleta ilimitada de depoimentos",
        "1 Mural de depoimentos ativo",
        "Redirecionamento Google Maps",
        "Uso único por conta",
      ],
      cta: "Começar Teste Grátis",
      checkoutUrl: "/signup",
      popular: false,
      highlight: false,
    },
    {
      name: "Gold",
      price: "R$ 49,90",
      period: "/mês",
      description: "Ideal para profissionais liberais e pequenos negócios em crescimento.",
      features: [
        "Até 50 depoimentos ativos",
        "Mural de depoimentos avançado",
        "Link de coleta personalizado",
        "Redirecionamento Google Maps",
        "Suporte prioritário",
      ],
      cta: "Assinar Gold",
      checkoutUrl: checkoutLinks.gold,
      popular: false,
      highlight: false,
    },
    {
      name: "Enterprise",
      price: "R$ 97",
      period: "/mês",
      description: "O plano completo para empresas que buscam domínio total do mercado.",
      features: [
        "Depoimentos ilimitados",
        "Todos os widgets liberados",
        "Depoimentos em Vídeo (4K)",
        "Branding 100% customizado",
        "Remoção da marca Proova",
        "Acesso ao ADS",
        "Suporte VIP via WhatsApp",
      ],
      cta: "Seja Enterprise",
      checkoutUrl: checkoutLinks.enterprise,
      popular: true,
      highlight: true,
    }
  ];

  return (
    <div className="min-h-screen bg-background font-body text-foreground flex flex-col">
      <header className="px-4 lg:px-6 h-20 md:h-24 flex items-center justify-between border-b sticky top-0 bg-background/95 backdrop-blur-md z-[100]">
        <div className="flex items-center gap-2 sm:gap-6">
          <Link href="/" className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden xs:inline uppercase tracking-widest text-[10px]">Voltar</span>
          </Link>
          <Link href="/" className="flex items-center font-bold text-xl tracking-tight relative w-[140px] h-[40px] sm:w-[180px] sm:h-[50px] md:w-[220px] md:h-[60px]">
            <Image src="/Logotipo%20PROOVA%20white%20mode.png" alt="Logo" fill className="dark:hidden object-contain" />
            <Image src="/Logotipo%20PROOVA%20dark%20mode.png" alt="Logo" fill className="hidden dark:block object-contain" />
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          
          {!authLoading && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 md:h-12 px-2 gap-2 rounded-xl hover:bg-primary/5 group transition-all active:bg-primary/10">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs font-bold truncate max-w-[120px] transition-colors group-hover:text-primary leading-tight">
                      {userData?.companyName || 'Minha Empresa'}
                    </span>
                    {membershipLabel && (
                      <span className={cn(
                        "text-[10px] uppercase tracking-widest font-black leading-tight",
                        userData?.membershipStatus === 'enterprise' ? "text-primary animate-pulse" : "text-muted-foreground"
                      )}>
                        {membershipLabel}
                      </span>
                    )}
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary group-hover:text-white transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background border-border shadow-xl rounded-2xl p-2">
                <DropdownMenuLabel className="px-3 py-2">
                  <p className="text-xs font-headline font-black uppercase tracking-[0.2em] text-muted-foreground">Minha Conta</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="mx-1" />
                <DropdownMenuItem onClick={() => router.push('/dash')} className="rounded-xl cursor-pointer font-bold py-2.5">
                  <TrendingUp className="mr-2 h-4 w-4 text-primary" />
                  <span>Dash</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/widgets')} className="rounded-xl cursor-pointer font-bold py-2.5">
                  <Layout className="mr-2 h-4 w-4 text-primary" />
                  <span>Meus Widgets</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/private')} className="rounded-xl cursor-pointer font-bold py-2.5">
                  <Inbox className="mr-2 h-4 w-4 text-primary" />
                  <span>Inbox Privado</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/pricing')} className="rounded-xl cursor-pointer font-bold py-2.5 bg-primary/5 text-primary">
                  <Gem className="mr-2 h-4 w-4" />
                  <span>Planos de Upgrade</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="mx-1" />
                <DropdownMenuItem 
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className="rounded-xl cursor-pointer font-bold py-2.5"
                >
                  {theme === 'light' ? (
                    <Moon className="mr-2 h-4 w-4 text-primary" />
                  ) : (
                    <Sun className="mr-2 h-4 w-4 text-primary" />
                  )}
                  <span>Alternar Tema</span>
                </DropdownMenuItem>

                {userData?.isAdmin && (
                  <DropdownMenuItem onClick={() => router.push('/admin')} className="rounded-xl cursor-pointer font-bold py-2.5">
                    <ShieldIcon className="mr-2 h-4 w-4 text-primary" />
                    <span>Administração</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="mx-1" />
                <DropdownMenuItem onClick={() => signOut(auth)} className="rounded-xl text-destructive focus:text-destructive cursor-pointer font-bold py-2.5">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair do Sistema</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {authLoading && (
            <div className="w-9 h-9 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        <section className="py-12 md:py-24 px-4 container mx-auto text-center space-y-6">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-[10px] sm:text-xs font-bold text-primary border border-primary/20 backdrop-blur-sm">
            💎 Oferta especial: 50% OFF vitalício nos planos pagos
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black font-headline tracking-tighter max-w-4xl mx-auto leading-[1.1]">
            Escolha o plano perfeito para sua <span className="text-primary italic">Autoridade</span>.
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Transforme a confiança dos seus clientes em lucro real. Comece grátis ou escolha um plano profissional.
          </p>
        </section>

        <section className="pb-24 px-4 container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
            {plans.map((plan, idx) => (
              <Card 
                key={idx} 
                className={`relative overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl flex flex-col h-full ${plan.highlight ? 'border-primary shadow-xl md:scale-105 z-10' : 'border-border bg-card/50'}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl shadow-lg z-20">
                    Mais Escolhido
                  </div>
                )}
                <CardHeader className="p-6 sm:p-8 shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-xl sm:text-2xl font-black font-headline uppercase tracking-widest">
                      {plan.name}
                    </CardTitle>
                    {plan.name === "Trial" && <Clock className="w-5 h-5 text-muted-foreground" />}
                    {plan.name === "Gold" && <Star className="w-5 h-5 text-primary" />}
                    {plan.name === "Enterprise" && <Zap className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black">{plan.price}</span>
                    <span className="text-muted-foreground font-medium text-sm">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground mt-4 font-medium text-xs sm:text-sm leading-relaxed">
                    {plan.description}
                  </p>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 pt-0 flex-1">
                  <ul className="space-y-3 sm:space-y-4">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 text-xs sm:text-sm font-medium">
                        <div className="bg-primary/10 p-1 rounded-full text-primary shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5 sm:w-4 h-4" />
                        </div>
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-6 sm:p-8 pt-6 shrink-0 mt-auto">
                  <Link href={plan.checkoutUrl} className="w-full" target={plan.checkoutUrl.startsWith('http') ? "_blank" : "_self"}>
                    <Button 
                      className={`w-full h-14 sm:h-16 text-base sm:text-lg font-black rounded-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                        plan.highlight 
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      <span className="truncate">{plan.cta}</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-16 bg-muted/30 border-y">
          <div className="container px-4 mx-auto max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-black font-headline text-center mb-12 tracking-tight">Perguntas Frequentes</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-trial" className="border-b border-primary/10">
                <AccordionTrigger className="text-left font-bold py-5 hover:text-primary transition-colors text-sm sm:text-base">Como funciona o plano Trial de 14 dias?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 font-medium text-xs sm:text-sm">
                  O plano Trial é gratuito e serve para você conhecer a ferramenta. Ele dá acesso a todas as funcionalidades de coleta e redirecionamento. Após os 14 dias, seus depoimentos continuam salvos, mas você precisará escolher um dos planos profissionais (Gold ou Enterprise) para continuar exibindo seus murais.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-1" className="border-b border-primary/10">
                <AccordionTrigger className="text-left font-bold py-5 hover:text-primary transition-colors text-sm sm:text-base">Posso mudar de plano a qualquer momento?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 font-medium text-xs sm:text-sm">
                  Sim! Você pode fazer o upgrade ou downgrade do seu plano diretamente pelo seu painel administrativo. A diferença de valor será ajustada proporcionalmente na sua próxima fatura.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-b border-primary/10">
                <AccordionTrigger className="text-left font-bold py-5 hover:text-primary transition-colors text-sm sm:text-base">Como funciona o redirecionamento para o Google Maps?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 font-medium text-xs sm:text-sm">
                  Ao receber uma avaliação de 4 ou 5 estrelas, o Proova exibe um botão especial incentivando o cliente a replicar esse elogio no seu perfil do Google Business, aumentando seu SEO local.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        <section className="py-16 container px-4 mx-auto">
          <div className="bg-primary text-primary-foreground rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 text-center space-y-8 relative overflow-hidden shadow-2xl">
             <div className="relative z-10 space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black font-headline tracking-tighter">Ainda tem dúvidas?</h2>
              <p className="text-primary-foreground/90 font-medium text-base sm:text-lg max-w-xl mx-auto">
                Nossa equipe de especialistas está pronta para ajudar você a turbinar suas vendas através da prova social.
              </p>
              <div className="pt-4 sm:pt-6">
                <Button variant="secondary" size="lg" className="h-14 sm:h-16 px-8 sm:px-10 rounded-2xl text-lg sm:text-xl font-black shadow-2xl w-full sm:w-auto">
                  Falar com Especialista
                </Button>
              </div>
             </div>
             <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24 sm:-mr-32 sm:-mt-32" />
             <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-black/10 rounded-full blur-3xl -ml-24 -mb-24 sm:-ml-32 sm:-mb-32" />
          </div>
        </section>
      </main>

      <footer className="py-12 border-t bg-background">
        <div className="container px-4 md:px-6 mx-auto flex flex-col justify-center items-center gap-6 text-center">
          <div className="flex items-center gap-2 relative w-[180px] h-[50px] md:w-[240px] md:h-[70px]">
             <Image src="/Logotipo%20PROOVA%20white%20mode.png" alt="Logo Footer" fill className="dark:hidden object-contain" />
             <Image src="/Logotipo%20PROOVA%20dark%20mode.png" alt="Logo Footer" fill className="hidden dark:block object-contain" />
          </div>
          <div className="space-y-2">
            <p className="text-xs md:text-sm text-muted-foreground font-bold italic">"Onde a confiança vira conversão."</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-40">
              © 2026 BY SYNAPSE GROUP | SYNP GROUP TECHNOLOGY
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
