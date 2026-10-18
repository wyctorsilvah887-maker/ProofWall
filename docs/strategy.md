
# Proova - Estudos e Estratégias de Implementação

Este documento detalha as teses de evolução do produto para transformar prova social em receita direta.

## 🚀 1. Depoimentos em Vídeo (The Trust Multiplier)
**Tese:** O vídeo aumenta a conversão em até 80% comparado ao texto.
- **Implementação:**
    - Captura via WebRTC (MediaRecorder API).
    - Armazenamento em Firebase Storage.
    - Processamento: Usar Genkit + Gemini para transcrição e análise de sentimento.

## 🧠 2. Performance: Counter Pattern & Lazy Loading
**Tese:** Reduzir custos de leitura do Firestore e aumentar a fluidez do Dashboard.
- **Implementação:**
    - **Contador Denormalizado:** O documento `User` mantém o campo `testimonialsCount`.
    - **Escrita Atômica:** Uso de `increment(1)` no momento do envio do feedback.
    - **Leitura sob Demanda:** 
        - Dashboard carrega apenas os metadados do usuário e as últimas 5 mensagens.
        - Subcoleções pesadas são carregadas apenas nas páginas de configuração de widget.

## 🎁 3. Ciclo de Recorrência (Gamificação)
**Tese:** O momento após o elogio é a melhor hora para vender novamente.
- **Implementação:**
    - QR Code de desconto gerado na página de sucesso (`/c`).
    - Envio de e-mail de agradecimento automatizado.

## 🔍 4. SEO Local Avançado
**Tese:** Dominar a primeira página do Google para o termo "Empresa X avaliações".
- **Implementação:**
    - Schema.org (JSON-LD) em todas as páginas públicas (`/pp`).
    - Otimização para "Social Proof Search".

## 🛠️ 5. Suporte Prioritário (Conversão & Retenção Gold)
**Tese:** Remover barreiras técnicas para garantir que o cliente veja valor no produto imediatamente.
- **Implementação:**
    - **SLA de Resposta:** Garantia de retorno em até 8 horas úteis para usuários Gold/Trial.
    - **WhatsApp Lite:** Canal de chat direto para dúvidas rápidas de instalação e configuração.
    - **Auxílio Guided Setup:** Suporte focado em ajudar o cliente a colar o script e configurar o DNS do link personalizado.
    - **Priorização Sistêmica:** Tags visuais no painel administrativo para identificar UIDs com status prioritário.
