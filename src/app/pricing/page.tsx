'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowRight, Zap, Star, Shield, HelpCircle, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function PricingPage() {
  const plans = [
    {
      name: "Standard",
      price: "R$ 47",
      period: "/mês",
      description: "Ideal para profissionais liberais e pequenos negócios começando a crescer.",
      features: [
        "Até 50 depoimentos ativos",
        "Mural de depoimentos básico",
        "Link de coleta personalizado",
        "Redirecionamento Google Maps",
        "Suporte via e-mail",
      ],
      cta: "Começar Agora",
      popular: false,
    },
    {
      name: "Gold",
      price: "R$ 97",
      period: "/mês",
      description: "O plano completo para empresas que querem dominar o mercado local.",
      features: [
        "Depoimentos ilimitados",
        "Todos os widgets (Carrossel, Popup, etc)",
        "Depoimentos em Vídeo (4K)",
        "Branding customizado (Logo/Capa)",
        "Remoção da marca Proova",
        "Suporte VIP via WhatsApp",
      ],
      cta: "Seja Gold",
      popular: true,
    }
  ];

  return (
    <div className="min-h-screen bg-background font-body text-foreground flex flex-col">
      <header className="px-4 lg:px-6 h-20 md:h-24 flex items-center justify-between border-b sticky top-0 bg-background/80 backdrop-blur-md z-[100]">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline uppercase tracking-widest text-[10px]">Voltar</span>
          </Link>
          <Link href="/" className="flex items-center font-bold text-xl tracking-tight relative w-[160px] h-[45px] md:w-[200px] md:h-[55px]">
            <Image src="/Logotipo%20PROOVA%20white%20mode.png" alt="Logo" fill className="dark:hidden object-contain" />
            <Image src="/Logotipo%20PROOVA%20dark%20mode.png" alt="Logo" fill className="hidden dark:block object-contain" />
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="font-bold">Entrar</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="font-bold shadow-lg">Começar Grátis</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-32 px-4 container mx-auto text-center space-y-6">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary border border-primary/20 backdrop-blur-sm">
            💎 Oferta especial de lançamento: 50% OFF vitalício
          </div>
          <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter max-w-3xl mx-auto leading-[1.1]">
            Escolha o plano perfeito para sua <span className="text-primary italic">Autoridade</span>.
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Invista na ferramenta que transforma a confiança dos seus clientes em lucro real.
          </p>
        </section>

        <section className="pb-32 px-4 container mx-auto">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, idx) => (
              <Card 
                key={idx} 
                className={`relative overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl flex flex-col ${plan.popular ? 'border-primary shadow-xl scale-105 z-10' : 'border-border'}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl shadow-lg">
                    Mais Escolhido
                  </div>
                )}
                <CardHeader className="p-8">
                  <CardTitle className="text-2xl font-black font-headline uppercase tracking-widest mb-4">
                    {plan.name}
                  </CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black">{plan.price}</span>
                    <span className="text-muted-foreground font-medium">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground mt-4 font-medium text-sm leading-relaxed">
                    {plan.description}
                  </p>
                </CardHeader>
                <CardContent className="p-8 pt-0 flex-1">
                  <ul className="space-y-4">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3 text-sm font-medium">
                        <div className="bg-primary/10 p-1 rounded-full text-primary">
                          <Check className="w-4 h-4" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-8 pt-0">
                  <Link href="/signup" className="w-full">
                    <Button 
                      className={`w-full h-14 text-lg font-black rounded-xl shadow-xl transition-all active:scale-95 ${plan.popular ? 'bg-primary hover:bg-primary/90' : 'bg-muted-foreground/10 text-foreground hover:bg-muted-foreground/20'}`}
                    >
                      {plan.cta} <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-24 bg-muted/30 border-y">
          <div className="container px-4 mx-auto max-w-4xl">
            <h2 className="text-3xl font-black font-headline text-center mb-16 tracking-tight">Perguntas Frequentes</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-b border-primary/10">
                <AccordionTrigger className="text-left font-bold py-6 hover:text-primary transition-colors">Posso mudar de plano a qualquer momento?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 font-medium">
                  Sim! Você pode fazer o upgrade ou downgrade do seu plano diretamente pelo seu painel administrativo. A diferença de valor será ajustada proporcionalmente na sua próxima fatura.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-b border-primary/10">
                <AccordionTrigger className="text-left font-bold py-6 hover:text-primary transition-colors">Como funciona o redirecionamento para o Google Maps?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 font-medium">
                  Ao receber uma avaliação de 4 ou 5 estrelas, o Proova exibe um botão especial incentivando o cliente a replicar esse elogio no seu perfil do Google Business, aumentando seu SEO local.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-b border-primary/10">
                <AccordionTrigger className="text-left font-bold py-6 hover:text-primary transition-colors">O que acontece se eu atingir o limite de depoimentos?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 font-medium">
                  Seus novos depoimentos continuarão sendo coletados, mas você precisará fazer o upgrade para o plano Gold para exibi-los nos murais ou gerenciar um volume maior de avaliações.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        <section className="py-24 container px-4 mx-auto">
          <div className="bg-primary text-white rounded-[3rem] p-12 text-center space-y-8 relative overflow-hidden shadow-2xl">
             <div className="relative z-10 space-y-4">
              <h2 className="text-3xl md:text-5xl font-black font-headline tracking-tighter">Ainda tem dúvidas?</h2>
              <p className="text-primary-foreground/90 font-medium text-lg max-w-xl mx-auto">
                Nossa equipe de especialistas está pronta para ajudar você a turbinar suas vendas.
              </p>
              <div className="pt-6">
                <Button variant="secondary" size="lg" className="h-16 px-10 rounded-2xl text-xl font-black shadow-2xl">
                  Falar com Especialista
                </Button>
              </div>
             </div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32" />
          </div>
        </section>
      </main>

      <footer className="py-12 border-t bg-background">
        <div className="container px-4 md:px-6 mx-auto flex flex-col justify-center items-center gap-6 text-center">
          <div className="flex items-center gap-2 relative w-[160px] h-[45px] md:w-[200px] md:h-[55px]">
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