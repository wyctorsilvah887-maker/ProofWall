# Proova - Estudos e Estratégias de Implementação

Este documento detalha as teses de evolução do produto para transformar prova social em receita direta.

## 🚀 1. Depoimentos em Vídeo (The Trust Multiplier)
**Tese:** O vídeo aumenta a conversão em até 80% comparado ao texto.
- **Implementação:**
    - Captura via WebRTC (MediaRecorder API).
    - Armazenamento em Firebase Storage.
    - Processamento: Usar Genkit + Gemini para:
        - Transcrição automática.
        - Geração de "Social Clips" (cortes dos melhores momentos).
        - Análise de segurança (verificar se o conteúdo é apropriado).

## 🧠 2. Moderação e Inteligência de Sentimento
**Tese:** Reduzir o trabalho operacional do empresário usando IA.
- **Implementação:**
    - Fluxo Genkit `analyzeTestimonialFlow`:
        - Score de Sentimento (0 a 1).
        - Extração de tópicos (ex: "preço", "atendimento", "qualidade").
        - Sugestão de resposta automática para o empresário enviar ao cliente.

## 🎁 3. Ciclo de Recorrência (Gamificação)
**Tese:** O momento após o elogio é a melhor hora para vender novamente.
- **Implementação:**
    - Sistema de "Rewards":
        - Integração com a página de sucesso (`/c`).
        - Exibição de um QR Code de desconto gerado dinamicamente.
        - Envio de e-mail de agradecimento com o bônus.

## 🔍 4. SEO Local Avançado
**Tese:** Dominar a primeira página do Google para o termo "Empresa X avaliações".
- **Implementação:**
    - Schema.org (JSON-LD) em todas as páginas públicas (`/pp`).
    - Sitemap dinâmico para os diretórios de empresas.
    - Otimização de meta-tags para "Social Proof Search".
