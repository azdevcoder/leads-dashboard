# Design Ideas - Leads Dashboard

## Abordagem Escolhida: Modern Professional Dashboard

**Design Movement:** Minimalist Modernism com toques de Corporativo Sofisticado

### Core Principles
1. **Clareza Funcional:** Interface limpa que prioriza a leitura e ação rápida dos dados
2. **Hierarquia Visual Forte:** Uso inteligente de tipografia e espaçamento para guiar o usuário
3. **Eficiência Interativa:** Filtros rápidos e busca intuitiva, sem poluição visual
4. **Profissionalismo Elegante:** Design corporativo mas não entediante, com detalhes sofisticados

### Color Philosophy
- **Primária:** Azul profundo (Indigo 700) - confiança, profissionalismo, tecnologia
- **Secundária:** Cinza neutro (Slate 600) - estabilidade, leitura
- **Acentos:** Verde suave (Emerald 500) - ação, sucesso, chamadas positivas
- **Background:** Branco puro com sutis gradientes cinza claro
- **Intenção Emocional:** Transmitir confiabilidade, modernidade e facilidade de uso

### Layout Paradigm
- **Estrutura:** Sidebar navegável + conteúdo principal fluido
- **Grid Assimétrico:** Cards em grid responsivo (1-2-3 colunas conforme viewport)
- **Espaçamento Generoso:** Amplo whitespace entre seções para respiração visual
- **Painel de Filtros:** Lateral colapsível com filtros por cidade, segmento e status

### Signature Elements
1. **Card Minimalista:** Bordas suaves, sombra sutil, hover com elevação
2. **Badges Coloridas:** Indicadores de segmento com cores distintas
3. **Ícones Lucide:** Ícones limpos e modernos para ações e categorias
4. **Tipografia em Camadas:** Display bold para títulos, body regular para conteúdo

### Interaction Philosophy
- **Feedback Imediato:** Hover states claros, transições suaves
- **Busca Inteligente:** Filtros aplicam em tempo real sem reload
- **Ações Contextuais:** Botões aparecem ao passar mouse sobre cards
- **Responsividade Elegante:** Layout adapta graciosamente em mobile

### Animation
- **Transições Suaves:** 200-250ms ease-out para mudanças de estado
- **Entrada em Cascata:** Cards entram com stagger de 30-50ms
- **Hover Elevado:** Cards sobem 2-4px com sombra aumentada
- **Busca/Filtro:** Resultados aparecem com fade-in suave
- **Respeitar Preferências:** Reduzir motion em `prefers-reduced-motion`

### Typography System
- **Display:** Geist Bold (700) - títulos principais, 32-48px
- **Heading:** Geist SemiBold (600) - subtítulos, 20-24px
- **Body:** Geist Regular (400) - conteúdo, 14-16px
- **Small:** Geist Regular (400) - labels e metadata, 12-13px
- **Hierarquia:** Peso e tamanho trabalham juntos para criar distinção clara

---

## Implementação

Este design será implementado com:
- **Tailwind CSS 4** para utility-first styling
- **shadcn/ui** para componentes base consistentes
- **Lucide React** para ícones
- **Framer Motion** para animações suaves (se necessário)
- **Tema Light** como padrão (profissional para contexto corporativo)

A paleta de cores será definida em `client/src/index.css` com CSS variables para manutenção centralizada.
