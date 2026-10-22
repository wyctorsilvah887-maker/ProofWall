'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck, Scale, Gavel, FileWarning } from 'lucide-react';
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

      <main className="container max-w-5xl mx-auto px-6 py-12 space-y-12">
        <div className="text-center space-y-4">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit text-primary">
            <Scale className="w-10 h-10" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black font-headline tracking-tight">Termos e Condições de Uso</h1>
          <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px]">Versão 2.4 - Revisão Jurídica de 20 de Maio de 2026</p>
        </div>

        <div className="bg-card border rounded-[2rem] p-8 md:p-12 shadow-xl space-y-10 text-sm md:text-base leading-relaxed text-muted-foreground">
          
          <section className="space-y-4">
            <h2 className="text-xl font-bold font-headline text-foreground flex items-center gap-2 italic">
              <Gavel className="w-5 h-5 text-primary not-italic" /> 1. Preâmbulo e Aceitação Instrumental
            </h2>
            <p>O presente instrumento regula o acesso e a utilização da plataforma tecnológica denominada <strong>PROOVA</strong>, operada e de propriedade intelectual da <strong>SYNAPSE GROUP TECHNOLOGY</strong> (doravante "Contratada"). Ao clicar em "Aceito" ou utilizar qualquer funcionalidade do serviço, o <strong>CONTRATANTE</strong> (Pessoa Física ou Jurídica que adere ao plano) anui, de forma irrevogável e irretratável, com a integralidade das cláusulas aqui dispostas.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-headline text-foreground flex items-center gap-2 italic">
              <ShieldCheck className="w-5 h-5 text-primary not-italic" /> 2. Objeto e Natureza do Serviço
            </h2>
            <p>A Contratada disponibiliza ao Contratante uma licença de uso de software em modalidade SaaS (Software as a Service), consistindo em ferramentas de intermediação de prova social e gestão de reputação digital. O PROOVA atua estritamente como provedor de infraestrutura lógica, não detendo ingerência direta sobre o teor das manifestações de terceiros.</p>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-bold font-headline text-foreground flex items-center gap-2 italic">
              <FileWarning className="w-5 h-5 text-primary not-italic" /> 3. Cláusula de Resguardo: Escudo de Reputação Digital
            </h2>
            <div className="bg-primary/5 p-6 md:p-8 rounded-3xl border border-primary/20 space-y-4">
              <p className="text-foreground font-bold uppercase text-xs tracking-widest">Parágrafo Único: Da Natureza Anti-Gating</p>
              <p className="text-foreground/90 font-medium italic">
                A Contratada implementa tecnologia de "Roteamento Soberano de Feedback". Este mecanismo visa garantir que o Usuário Final (consumidor) possua a autonomia plena para decidir o destino de sua manifestação. 
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm">
                <li><strong>Escolha Eletiva:</strong> O sistema oferece ao consumidor a opção de tornar sua crítica pública (via Google Maps ou Widget) ou privada (via Inbox de Conciliação).</li>
                <li><strong>Vedação à Supressão:</strong> O Contratante declara ciência de que o sistema não exclui feedbacks negativos, mas sim os canaliza para uma via de resolução extrajudicial privada, em estrito respeito à liberdade de expressão e diretrizes do FTC e órgãos de proteção ao consumidor.</li>
                <li><strong>Isenção de Má-Fé:</strong> A Contratada não se responsabiliza por eventuais interpretações de "Review Gating" feitas por terceiros, visto que o software apenas processa a escolha espontânea e informada do consumidor final.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-headline text-foreground italic">4. Responsabilidade Civil e Penal</h2>
            <p>O Contratante é o único e exclusivo responsável jurídico pelo conteúdo exibido em seus domínios através das ferramentas do PROOVA. É expressamente vedado:</p>
            <ul className="list-decimal pl-5 space-y-2 opacity-80">
              <li>A inserção de depoimentos simulados, fraudulentos ou remunerados (fake reviews);</li>
              <li>A utilização de dados de terceiros sem a devida autorização legal;</li>
              <li>A prática de atos que visem ludibriar algoritmos de motores de busca (Google, Bing, etc).</li>
            </ul>
            <p className="font-bold text-foreground opacity-90">A detecção de qualquer prática abusiva ensejará a resilição unilateral imediata do contrato, sem prejuízo das perdas e danos cabíveis.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-headline text-foreground italic">5. Limitação de Responsabilidade da Contratada</h2>
            <p>Inobstante qualquer disposição em contrário, a Contratada não será responsabilizada por:</p>
            <ul className="list-disc pl-5 space-y-2 opacity-80">
              <li>Lucros cessantes, perda de chance ou danos imateriais decorrentes de feedbacks negativos;</li>
              <li>Interrupções técnicas inerentes à infraestrutura de internet;</li>
              <li>Punições aplicadas por plataformas terceiras (Google Business, Vercel, etc) ao perfil do Contratante.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-headline text-foreground italic">6. Propriedade Intelectual</h2>
            <p>A estrutura lógica, o código-fonte, os logotipos e as metodologias do PROOVA são ativos intangíveis de propriedade exclusiva do <strong>SYNAPSE GROUP</strong>. Qualquer tentativa de engenharia reversa, cópia ou distribuição não autorizada de scripts será objeto de medidas judiciais na esfera cível e criminal.</p>
          </section>

          <section className="space-y-4 border-t pt-8">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-bold font-headline">7. Eleição de Foro</h3>
            </div>
            <p>Para dirimir quaisquer controvérsias oriundas do presente instrumento, as partes elegem o foro da comarca da sede da Contratada, com exclusão de qualquer outro, por mais privilegiado que seja ou venha a ser. Este contrato é regido pelas leis da República Federativa do Brasil.</p>
          </section>

          <div className="bg-muted/50 p-6 rounded-2xl border border-dashed text-xs text-center space-y-2">
            <p className="font-bold text-foreground opacity-70">Suporte e Notificações Extrajudiciais:</p>
            <p>Synapse Group Technology | Compliance Division</p>
            <p>contato@wsstudioscompany.com.br</p>
          </div>
        </div>
      </main>
    </div>
  );
}
