
# Proova - Log de Desenvolvimento

## 📝 Histórico de Alterações Recentes
- **Filtros de Período (Métricas Dinâmicas) - [FINALIZADO]:** Implementada funcionalidade de filtragem temporal no Dashboard. Agora o usuário pode alternar a visualização de métricas e depoimentos entre "Últimos 7 dias", "Últimos 30 dias" ou "Total". O sistema recalcula o engajamento instantaneamente, oferecendo uma visão clara do crescimento recente.
- **Ações Rápidas (Quick Access) - [FINALIZADO]:** Implementada seção de atalhos táteis no Dashboard. Agora o usuário tem acesso a 1-clique para as funções mais vitais: Copiar Link, Ver Cartaz, Gerenciar Murais e Inbox Privado. Layout adaptativo para mobile (2x2) e desktop (4x1).
- **Consultor Proativo & Alertas Sem Estrela - [FINALIZADO]:** Removido ícone decorativo do Consultor para um visual mais limpo. Seção compactada para melhor aproveitamento de espaço no mobile.
- **Otimização de Dash Mobile - [FINALIZADO]:** Redesenhada a barra de progresso e o checklist de onboarding para telas menores. Agora o layout é mais compacto, reduzindo o scroll vertical e focando nas ações essenciais sem poluir a interface.
- **Alerta de Feedback Crítico - [FINALIZADO]:** Implementado sistema de notificação automática via e-mail (Resend). Agora, sempre que um feedback de 1-3 estrelas é recebido no Inbox Privado, o dono do negócio recebe um e-mail em tempo real para agir prontamente na recuperação do cliente.
- **Compliance Jurídico - [FINALIZADO]:** Implementada captura automática de endereço IP e timestamp no momento do cadastro. O sistema agora vincula o "Proof of Acceptance" (prova de aceite) aos Termos de Uso diretamente no documento do usuário, garantindo segurança jurídica para a plataforma.
- **Segurança & Rate Limiting - [FINALIZADO]:** Implementada proteção global de 10 requisições por minuto (Rate Limit) baseada em IP via Firestore. O sistema agora protege a API do Google Maps contra abusos e o formulário de coleta contra SPAM. Migrada a lógica de submissão para Server Actions para maior controle de backend.
- **Social Cards (Compartilhamento VIP) - [FINALIZADO]:** Implementada ferramenta de geração de artes para redes sociais. O sistema agora permite transformar depoimentos 5 estrelas em imagens de alta resolução (1080x1080) otimizadas para o Instagram, com um clique. Adicionada funcionalidade de compartilhamento nativo (Web Share API) e download direto em PNG.
- **Precisão Google Maps (Zero-Click) - [FINALIZADO]:** Implementada integração real com a `Google Places API` via Server Action. O sistema agora busca estabelecimentos no banco de dados oficial do Google usando a chave de API configurada no servidor, capturando o `place_id` exato para gerar links de avaliação infalíveis.

## 🚀 Próximos Marcos Técnicos
- [ ] Implementação de Depoimentos em Vídeo.
- [ ] Ativação da Moderação Automática com Genkit (Shield).
- [ ] Dashboard de Insights de Sentimento para feedbacks privados.
