
# Proova - Log de Desenvolvimento

## 📝 Histórico de Alterações Recentes
- **Double-Down Reviews (Google Maps):** Implementada lógica na página de coleta (`/c`) que exibe o botão do Google Maps apenas para depoimentos de 4 ou 5 estrelas. Adicionados parâmetros UTM (`utm_source=proova`) na URL final para rastreio de origem e contagem de cliques.
- **Configuração Global do Google Maps:** Implementado sistema de atalho no Dashboard para configurar o link do Google Business diretamente no perfil do usuário (`User`). Isso centraliza o redirecionamento sem precisar editar widget por widget.
- **Selo Flutuante de SEO:** Adicionado botão flutuante "Configurar Link" no Dashboard para acesso rápido à gestão de SEO local.
- **Correção de Conexão Firestore:** Ativado `experimentalForceLongPolling` na inicialização do Firebase para resolver erros de CORS e "Unsafe attempt to load URL" em ambientes de Cloud Workstations.
- **Fluxo Google Maps Ajustado:** A funcionalidade de redirecionamento para o Google Business foi movida para a página de coleta (`/c`). Agora, após enviar um depoimento para o Proova, o cliente é convidado a replicar a avaliação no Google.
- **IDs Baseados em Slugs:** Widgets agora utilizam o nome (slugificado) como ID no Firestore. Isso resulta em URLs amigáveis como `/pp/[slug]/[nome-do-widget]` e buscas O(1) mais eficientes.
- **Adaptação Desktop (/pp):** Aumentada largura máxima do container central e ajustado o mural para 3 colunas em telas grandes, mantendo a experiência mobile intacta.
- **Rodapé da Página Pública:** Adicionada chamada de ação (CTA) "Quer faturar mais? Crie seu Proova" no rodapé para incentivar novos cadastros.

## 🚀 Próximos Marcos Técnicos
- [ ] Implementação de Depoimentos em Vídeo.
- [ ] Validação de Slugs duplicados com sugestões automáticas.
- [ ] Otimização de SEO para as páginas de coleta.
