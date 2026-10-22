'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck, Scale, FileText } from 'lucide-react';
import Image from 'next/image';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-muted/30 font-body text-foreground pb-20">
      <header className="bg-background border-b h-20 md:h-28 flex items-center px-4 md:px-8 sticky top-0 z-[60] shadow-sm">
        <Link href="/" className="flex items-center group -ml-2 md:-ml-4">
          <div className="relative w-[200px] h-[65px] md:w-[320px] md:h-[105px]">
            <Image src="/Logotipo%20PROOVA%20white%20mode%201.png" alt="Logo" fill className="object-contain dark:hidden" priority />
            <Image src="/Logotipo%20PROOVA%20dark%20mode%201.png" alt="Logo" fill className="object-contain hidden dark:block" priority />
          </div>
        </Link>
        <div className="ml-auto">
          <Link href="/">
            <Button variant="ghost" className="text-xs font-bold uppercase tracking-widest gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Button>
          </Link>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-6 py-12 space-y-12">
        <div className="text-center space-y-4">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit text-primary">
            <Scale className="w-10 h-10" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black font-headline tracking-tight">Termos de Uso e Serviço</h1>
          <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px]">Última Atualização: 20 de Maio de 2026</p>
        </div>

        <div className="bg-card border rounded-[2rem] p-8 md:p-12 shadow-xl space-y-8 text-sm md:text-base leading-relaxed text-muted-foreground italic">
          <section className="space-y-4">
            <h2 className="text-xl font-bold font-headline text-foreground not-italic">1. Aceitação dos Termos</h2>
            <p>Ao acessar ou utilizar a plataforma Proova ("Serviço"), operada pelo Synapse Group ("Nós"), você concorda em cumprir e estar legalmente vinculado aos presentes Termos de Uso. Se você não concorda com qualquer parte destes termos, não deverá utilizar nossos serviços.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-headline text-foreground not-italic">2. Objeto do Serviço</h2>
            <p>O Proova é uma ferramenta de SaaS (Software as a Service) voltada para a gestão de prova social, coleta de depoimentos e otimização de reputação digital. O serviço atua como um intermediador tecnológico entre o Contratante (Empresa/Usuário) e o Consumidor Final.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-headline text-foreground not-italic">3. Escudo de Proteção de Reputação Digital</h2>
            <p className="bg-primary/5 p-6 rounded-2xl border border-primary/20 text-foreground font-medium">
              <strong>Cláusula de Transparência Anti-Gating:</strong> A plataforma implementa o sistema de "Escudo de Reputação Digital", que consiste em oferecer ao Usuário Final (cliente do contratante) a escolha soberana e espontânea do destino de sua manifestação. O Proova não exclui, oculta ou apaga depoimentos negativos. Em vez disso, disponibiliza um canal de "Inbox Privado" para resolução interna de conflitos, garantindo que o direito de escolha seja do consumidor. 
              <br /><br />
              O Contratante reconhece que qualquer tentativa de coagir o consumidor ou manipular o sistema para fins fraudulentos resultará no banimento imediato da conta, sem direito a reembolso.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-headline text-foreground not-italic">4. Responsabilidade sobre Conteúdo</h2>
            <p>O Proova não se responsabiliza pelo conteúdo gerado por terceiros. O Contratante é o único responsável pela moderação de seus murais e pela veracidade das informações exibidas em seus domínios ou widgets. O uso de depoimentos falsos ou comprados viola diretrizes do Google e de outros motores de busca, sendo de inteira responsabilidade do Contratante qualquer penalidade sofrida.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-headline text-foreground not-italic">5. Limitação de Responsabilidade</h2>
            <p>Em nenhum caso o Synapse Group, seus diretores ou funcionários serão responsáveis por danos indiretos, incidentais ou consequentes resultantes de: (i) uso ou incapacidade de usar o serviço; (ii) acesso não autorizado aos seus dados; (iii) declarações ou condutas de terceiros no serviço.</p>
          </section>

          <section className="space-y-4 border-t pt-8">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-bold">Foro de Eleição</h3>
            </div>
            <p>Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca da sede do Synapse Group para dirimir quaisquer controvérsias oriundas deste contrato.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
