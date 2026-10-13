
# Proova - Log de Desenvolvimento

## 📝 Histórico de Alterações Recentes
- **Documentação de Estratégia:** Criado `docs/strategy.md` para mapear o futuro do produto (Vídeo, IA e Gamificação).
- **Double-Down Reviews (Google Maps):** Implementada lógica na página de coleta (`/c`) que exibe o botão do Google Maps apenas para depoimentos de 4 ou 5 estrelas. Adicionados parâmetros UTM (`utm_source=proova`) na URL final para rastreio de origem e contagem de cliques.
- **Configuração Global do Google Maps:** Implementado sistema de atalho no Dashboard para configurar o link do Google Business diretamente no perfil do usuário (`User`). Isso centraliza o redirecionamento sem precisar editar widget por widget.
- **Selo Flutuante de SEO:** Adicionado botão flutuante "Configurar Link" no Dashboard para acesso rápido à gestão de SEO local.
- **Correção de Conexão Firestore:** Ativado `experimentalForceLongPolling` na inicialização do Firebase para resolver erros de CORS e "Unsafe attempt to load URL" em ambientes de Cloud Workstations.
- **Fluxo Google Maps Ajustado:** A funcionalidade de redirecionamento para o Google Business foi movida para a página de coleta (`/c`). Agora, após enviar um depoimento para o Proova, o cliente é convidado a replicar a avaliação no Google.

## 🚀 Próximos Marcos Técnicos
- [ ] Implementação de Depoimentos em Vídeo (Ver tese em docs/strategy.md).
- [ ] Moderação Automática com IA (Genkit).
- [ ] Sistema de Recompensas e Cupons.
