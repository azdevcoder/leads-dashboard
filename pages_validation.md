
## Validação adicional

A resposta direta de `/index.html?check=ea45d9d` já contém `<title>Leads Dashboard - Prospecção Brasil` e carrega os assets `/leads-dashboard/assets/index-Co8bp62k.js` e `/leads-dashboard/assets/index-D4ZLTd8s.css`. Isso confirma que o build estático publicado existe.

No navegador, essa URL com parâmetro carregou a aplicação, mas caiu na página interna 404 porque o roteador Wouter interpreta a query como uma rota diferente. A URL canónica sem query continua a mostrar o README devido ao cache do CDN do GitHub Pages, enquanto o endpoint `/index.html` já responde com a aplicação atualizada.

Correção adicional recomendada: fazer o fallback do router renderizar `Home` para que parâmetros de cache não produzam 404; depois publicar novamente e aguardar a expiração do cache da URL canónica.

## Verificação do bundle mais recente

O endpoint público `/index.html?check=d9e764f` serve o bundle `index-BT5hc7zB.js`, gerado após a correção do router. O bundle contém os textos do dashboard e não produziu erros no console do navegador. Ainda assim, o navegador de sandbox mostrou a página interna 404 para a URL com `index.html` e parâmetro, o que indica que a versão executada ou o roteamento ainda não está a coincidir com a expectativa. A validação deve prosseguir com a URL canónica e com uma checagem direta dos componentes/rotas no bundle antes da entrega.

## Estado atual da URL canónica

A URL canónica continua a ser servida pelo navegador de sandbox como a página antiga do README, embora uma requisição HTTP direta ao endpoint `/index.html` já devolva o título do dashboard e o bundle compilado. O GitHub Pages está a atualizar o conteúdo de forma assíncrona/cacheada; a aplicação já está acessível pelo artefacto `index.html`, mas a URL raiz ainda não foi invalidada no navegador.

A validação funcional do build final via URL com parâmetro mostrou o dashboard completo com 63 leads, filtros por cidade e segmento, busca, exportação CSV e ações de telefone/WhatsApp. A entrega deve destacar que o código e o build estão corrigidos, e que a URL canónica pode exigir uma atualização do cache do Pages/navegador.

## Teste funcional concluído

A versão pública com parâmetro de verificação carregou o dashboard com 63 leads. A busca por `Oficina Mecânica Valmir` funcionou em tempo real e reduziu os resultados para 1 lead, exibindo o telefone e as ações `WhatsApp` e `Ligar`. Isso confirma que o bundle, o CSS, a renderização React e a filtragem principal estão operacionais no GitHub Pages.
