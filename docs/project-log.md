
# Proova - Log de Desenvolvimento

## 📝 Histórico de Alterações Recentes
- **Fluxo Google Maps Ajustado:** A funcionalidade de redirecionamento para o Google Business foi movida para a página de coleta (`/c`). Agora, após enviar um depoimento para o Proova, o cliente é convidado a replicar a avaliação no Google, aumentando o impacto de SEO local.
- **Redirecionados Google:** Ativado sistema de rastreamento de cliques para o Google Maps. Agora o usuário pode configurar o link do Google Business e acompanhar os redirecionamentos no Dashboard.
- **IDs Baseados em Slugs:** Widgets agora utilizam o nome (slugificado) como ID no Firestore. Isso resulta em URLs amigáveis como `/pp/[slug]/[nome-do-widget]` e buscas O(1) mais eficientes.
- **Adaptação Desktop (/pp):** Aumentada largura máxima do container central e ajustado o mural para 3 colunas em telas grandes, mantendo a experiência mobile intacta.
- **Blueprint:** Criado arquivo `docs/blueprint.md` para centralizar a estratégia do produto.
- **Rodapé da Página Pública:** Adicionada chamada de ação (CTA) "Quer faturar mais? Crie seu Proova" no rodapé para incentivar novos cadastros.
- **Bordas nos Cards:** Reintrodução das bordas coloridas nos depoimentos na página `/pp`. Corrigido bug de visibilidade onde classes Shadcn ocultavam a borda.
- **Botão WhatsApp:** Configurado como flutuante e fixo para acompanhar o scroll.
- **Configuração de Widget:** Implementada máscara funcional de WhatsApp no formato `+55 (XX) XXXXX-XXXX`.

## 🚀 Próximos Marcos Técnicos
- [ ] Implementação de Depoimentos em Vídeo.
- [ ] Validação de Slugs duplicados com sugestões automáticas.
- [ ] Otimização de SEO para as páginas de coleta.
