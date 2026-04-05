import { DIRECTUS_URL } from '@/lib/directus'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

function slugify(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ── Dados editoriais embutidos (fonte: research + record.html) ──────────────
const SELO_INFO: Record<string, { tag: string; desc: string }> = {
  'Record': {
    tag: 'ficção · não-ficção · bestsellers',
    desc: 'O selo principal do grupo, fundado em 1942. Ficção, autoajuda e grandes nomes internacionais lado a lado. Motor comercial do grupo e principal porta de entrada ao mercado de massa.',
  },
  'BestSeller': {
    tag: 'ficção popular · thrillers · suspense',
    desc: 'Especializado em ficção de entretenimento de grande apelo. Stieg Larsson, Gillian Flynn e E.L. James estão entre os nomes que definiram o selo. O próprio nome é a promessa.',
  },
  'BestBolso': {
    tag: 'pocket · backlist · custo acessível',
    desc: 'Segunda vida para títulos do grupo em formato de bolso e preço reduzido. Amplifica obras que já provaram mercado e democratiza o acesso. Sustenta a saúde do catálogo backlist dos selos premium.',
  },
  'Best Business': {
    tag: 'negócios · gestão · liderança',
    desc: 'Voltado ao leitor corporativo e empreendedor. Gestão, liderança e produtividade formam o núcleo do catálogo. Compete diretamente com a GMT/Sextante em um segmento de alta fidelidade.',
  },
  'Galera': {
    tag: 'young adult · fantasia · romance',
    desc: 'Um dos maiores selos de YA do Brasil, com forte apelo em séries e sagas. Fantasia, distopia e romance adolescente dominam o catálogo. Pipeline natural para os selos adultos do grupo.',
  },
  'Galera Junior': {
    tag: 'infantojuvenil · 8–12 anos',
    desc: 'Projetado para o leitor pré-adolescente em formação. Aventura, fantasia leve e humor em temas adequados à faixa dos 8 aos 12 anos. Antecâmara natural da Galera.',
  },
  'Galerinha': {
    tag: 'infantil · 4–8 anos · escola',
    desc: 'Livros para a primeira infância escolar, dos 4 aos 8 anos, com ilustração protagonista. Histórias curtas e temas que dialogam com a rotina da criança. Fideliza pais e professores ao grupo desde a base.',
  },
  'Reco-reco': {
    tag: 'bebês · estimulação · primeiras leituras',
    desc: 'Livros para bebês e crianças bem pequenas, com formatos resistentes e cores vivas. Estimulação sensorial no centro de cada título. O primeiro contato com o livro como objeto de afeto e descoberta.',
  },
  'Viva Livros': {
    tag: 'autoajuda · bem-estar · comportamento',
    desc: 'Autoajuda, saúde emocional e qualidade de vida com linguagem acessível. Bem-estar, mindfulness e desenvolvimento pessoal em um pacote direto ao leitor. Opera em um dos segmentos de maior crescimento do mercado editorial.',
  },
  'José Olympio': {
    tag: 'literatura brasileira · clássicos · ensaios',
    desc: 'Fundada em 1931, uma das mais relevantes da história editorial brasileira. Jorge Amado, Rachel de Queiroz e Graciliano Ramos passaram por aqui. Publica hoje literatura nacional, ensaios e biografias com o peso de um nome centenário.',
  },
  'Civilização Brasileira': {
    tag: 'ciências sociais · política · humanidades',
    desc: 'Fundada em 1929, referência em pensamento crítico e ciências sociais no Brasil. Atravessou a ditadura publicando Paulo Freire, Florestan Fernandes e Caio Prado Jr. Patrimônio da edição nacional com relevância acadêmica e peso histórico.',
  },
  'Bertrand Brasil': {
    tag: 'literatura · ficção literária · premiados',
    desc: 'Herança da Livraria Bertrand portuguesa, fundada no século XVIII. Referência em literatura nacional e internacional de qualidade literária. Publica ficção de prestígio e autores premiados.',
  },
  'Nova Era': {
    tag: 'espiritualidade · new age · autoconhecimento',
    desc: 'Espiritualidade, filosofia oriental e autoconhecimento para o leitor em busca de sentido. Nicho de alta fidelidade com leitor recorrente e baixa sensibilidade a preço. Mercado em expansão constante no Brasil.',
  },
  'Paz & Terra': {
    tag: 'humanidades · filosofia · pensamento crítico',
    desc: 'Fundada em 1965, com foco em pensamento crítico e filosofia política. Paulo Freire e outras vozes centrais do pensamento brasileiro marcaram sua trajetória. Relevância acadêmica e presença de mercado consolidadas.',
  },
  'Difel': {
    tag: 'academia · filosofia · ciências humanas',
    desc: 'Difusão Europeia do Livro — clássicos do pensamento europeu em tradução cuidadosa. Ciências humanas e filosofia para o leitor universitário e o pesquisador. Catálogo que se mantém relevante por décadas na academia brasileira.',
  },
  'Rosa dos Tempos': {
    tag: 'ficção · romance · protagonismo feminino',
    desc: 'Literatura contemporânea com protagonismo feminino e diversidade de perspectivas. Romance e ficção histórica que exploram a experiência das mulheres. Um dos segmentos mais dinâmicos e fidelizados do mercado atual.',
  },
  'Verus': {
    tag: 'ficção internacional · curadoria literária',
    desc: 'Ficção internacional com qualidade literária e seleção rigorosa. Autores premiados e vozes diversas de múltiplas literaturas do mundo. Entre o comercial e o literário — uma curadoria que valoriza a narrativa.',
  },
  'Amarcord': {
    tag: 'memórias · literatura europeia · cultura',
    desc: 'O nome remete ao Fellini: nostalgia, memória, Europa. Autobiografias e memórias literárias em edições editorialmente cuidadas. Nicho sofisticado com leitor fiel e disposição a pagar pelo objeto-livro.',
  },
}

const HITS: Record<string, string[]> = {
  'Record': [
    'Tudo é rio — Carla Madeira',
    'A paciente silenciosa — Alex Michaelides',
    'Véspera — Carla Madeira',
    'A natureza da mordida — Carla Madeira',
    'Em agosto nos vemos — García Márquez',
    'Cem anos de solidão — García Márquez',
    'Uma vida pequena — Hanya Yanagihara',
    'Um defeito de cor — Ana Maria Gonçalves',
    'Nunca minta — Freida McFadden',
    'O cavaleiro preso na armadura — Richard Fisher',
  ],
  'BestSeller': [
    'O poder do subconsciente — Joseph Murphy',
    'O milagre da manhã — Hal Elrod',
    'Os quatro compromissos — Miguel Ruiz',
    'Em busca de mim — Viola Davis',
    'Você pode curar sua vida — Louise Hay',
    'Os 7 hábitos das pessoas altamente eficazes — Covey',
    'A coragem para liderar — Brené Brown',
    'A síndrome da boazinha — Braiker',
    'Amigos, Amores e Aquela Coisa Terrível — Matthew Perry',
    'A coragem de ser você mesmo — Brené Brown',
  ],
  'BestBolso': [
    'O diário de Anne Frank',
    'A origem da família, da Propriedade Privada e do Estado — Engels',
    'O alcorão',
    'Reunião de poesia — Adélia Prado',
    'Você pode curar sua vida — Louise Hay',
    'O estrangeiro — Albert Camus',
    'A arte da tese — Beaud',
    'Pedro Páramo — Juan Rulfo',
    'O último teorema de Fermat — Simon Singh',
    'A marcha da insensatez — Barbara Tuchman',
  ],
  'Best Business': [
    'Os Axiomas de Zurique — Max Gunther',
    'A vaca roxa — Seth Godin',
    'Capital erótico — Catherine Hakim',
    'A jornada de um banqueiro — Daniel Gross',
    'O novo Gerente-Minuto — Blanchard',
    'A fórmula do lançamento — Jeff Walker',
    'A arte de pensar com clareza — Lee',
    'Gente feliz não enche o saco — Linhares',
    'Escassez — Mullainathan',
    'A jornada da liderança — Maor',
  ],
  'Galera': [
    'Verity — Colleen Hoover',
    'É assim que acaba — Colleen Hoover',
    'É assim que começa — Colleen Hoover',
    'O lado feio do amor — Colleen Hoover',
    'Todas as suas (im)perfeições — Colleen Hoover',
    'Até o verão terminar — Colleen Hoover',
    'As mil partes do meu coração — Colleen Hoover',
    'Uma segunda chance — Colleen Hoover',
    'Verity (edição de colecionador) — Colleen Hoover',
    'É assim que acaba (edição de colecionador) — Colleen Hoover',
  ],
  'Galera Junior': [
    'A fantástica fábrica de chocolate — Roald Dahl',
    'Matilda (edição especial) — Roald Dahl',
    'As Crônicas de Spiderwick — DiTerlizzi & Black',
    'Fantástico Sr. Raposo — Roald Dahl',
    'Box Roald Dahl',
    'Wonka — Pounder',
    'As bruxas (edição especial) — Roald Dahl',
    'A fada mamãe e eu — Sophie Kinsella',
    'Box Magisterium — Cassandra Clare',
    'O BGA: O Bom Gigante Amigo — Roald Dahl',
  ],
  'Galerinha': [
    'Amor de cabelo — Tiffany Cherry',
    'Quando eu era pequena — Adélia Prado',
    'Longe é um lugar que não existe — Bach',
    'A pequena Alice no país das maravilhas — Lewis Carroll',
    'Meu corpo pode — Crenshaw',
    'Voando entre sonhos — Bispo',
    'O que a Estrada me disse — Wade',
    'Carmela vai à escola — Adélia Prado',
    'O chapéu maravilhoso de Mila — Kitamura',
    'Domingo na praça — Cunha',
  ],
  'Reco-reco': [
    'A menina e a baleia — Benji Davies',
    'O primeiro mergulho — Santos',
    'Hey, vovô Jude — Paul McCartney',
    'João, Joãozinho, Joãozito — Fragata',
    'O pote vazio — Demi',
    'Homens choram — Turu',
    'Perla: A cachorrinha poderosa — Allende',
    'O cavaleiro da lua — Simas',
  ],
  'Viva Livros': [
    'O poder do subconsciente (bolso) — Joseph Murphy',
    'Como atrair dinheiro (bolso) — Joseph Murphy',
    'Telepsiquismo (bolso) — Joseph Murphy',
    'Codependência nunca mais (bolso) — Melody Beattie',
    'O poder cósmico da mente (bolso) — Joseph Murphy',
    'Saúde perfeita (bolso) — Deepak Chopra',
    'Seus pontos fracos (bolso) — Wayne Dyer',
    'Ame-se e cure sua vida (bolso) — Louise Hay',
    'Vivendo, amando e aprendendo (bolso) — Buscaglia',
  ],
  'José Olympio': [
    'O sol é para todos — Harper Lee',
    'O menino do dedo verde — Maurice Druon',
    'Caminho de pedras — Rachel de Queiroz',
    'A cor púrpura — Alice Walker',
    'A lei do triunfo — Napoleon Hill',
    'O quinze — Rachel de Queiroz',
    'Orgulho e Preconceito — Jane Austen',
    'Pedro Páramo — Juan Rulfo',
    'Dicionário de símbolos — Chevalier',
    'Orgulho e preconceito (edição especial) — Jane Austen',
  ],
  'Civilização Brasileira': [
    'O pobre de direita — Jessé Souza',
    'Justiça: O que é fazer a coisa certa — Michael Sandel',
    'Chomsky & Mujica: Sobrevivendo ao século XXI',
    'Carta de uma orientadora — Débora Diniz',
    'Umbandas: Uma história do Brasil — Simas',
    'O corpo encantado das ruas — Simas',
    'Problemas de gênero — Judith Butler',
    'A tirania do mérito — Michael Sandel',
    'Pacientes que curam — Rocha',
    'Filosofias africanas: Uma introdução — Lopes',
  ],
  'Bertrand Brasil': [
    'A biblioteca da meia-noite — Matt Haig',
    'A inconveniente loja de conveniência — Ho-yeon',
    'O velho e o mar — Ernest Hemingway',
    'Meus dias na livraria Morisaki — Yagisawa',
    'Violeta — Isabel Allende',
    'Se os gatos desaparecessem do mundo — Kawamura',
    'A casa dos espíritos — Isabel Allende',
    'O vento sabe meu nome — Isabel Allende',
    'A lanterna das memórias perdidas — Hiiragi',
    'Se eu soubesse: para maiores de 40 anos — Carpinejar',
  ],
  'Nova Era': [
    'Passes mágicos — Carlos Castaneda',
    'Sai Baba: O homem dos milagres — Murphet',
    'Trilhando o caminho com Sai Baba — Murphet',
    'O grande dicionário de sonhos — Zolar',
    'Sonhos lúcidos — Donner',
    'Mude sua vida — Fox',
    'Signos Estelares — Goodman',
    'Kama Sutra Para Mulheres — Verma',
    'Consulte seus guias — Choquette',
  ],
  'Paz & Terra': [
    'Conversas corajosas — Renata Santos',
    'Pedagogia do oprimido — Paulo Freire',
    'Educação não violenta — Santos',
    'Pedagogia da autonomia — Paulo Freire',
    'O manifesto comunista — Marx & Engels',
    'A psicanálise dos contos de fadas — Bettelheim',
    'Jung: Vida e obra — Silveira',
    'Microfísica do poder — Foucault',
    'Educação como prática da liberdade — Paulo Freire',
    'Aparelhos ideológicos de Estado — Althusser',
  ],
  'Difel': [
    'A fascinante história da matemática — Launay',
    'Uma ovelha negra no poder — Danza',
    'De Bizâncio para o mundo — Wells',
    'O livro negro do comunismo — Courtois',
    'A política como ela é — Almeida & Ribeiro',
    'História para o amanhã — Krznaric',
    'Os nomes da Independência — Trespach',
    'Os nomes do Terceiro Reich — Trespach',
    'A democracia da abolição — Angela Davis',
    'O lado oculto — Roberts',
  ],
  'Rosa dos Tempos': [
    'O feminismo é para todo mundo — bell hooks',
    'O mito da beleza — Naomi Wolf',
    'Eu, Tituba: Bruxa negra de Salem — Maryse Condé',
    'E eu não sou uma mulher? — bell hooks',
    'Marielle e Monica — Benicio',
    'A história da arte sem os homens — Hessel',
    'O martelo das feiticeiras — Kramer',
    'Niède Guidon: Uma arqueóloga no sertão — Abujamra',
    'A mística feminina — Betty Friedan',
    'O fabuloso e triste destino de Ivan e Ivana — Condé',
  ],
  'Verus': [
    'Leitura de verão — Emily Henry',
    'O beijo da neve — Sette',
    'Diário de uma garota nada popular — Rachel Russell',
    'Lugar feliz — Emily Henry',
    'Nem te conto — Emily Henry',
    'Loucos por livros — Emily Henry',
    'Amor de redenção — Francine Rivers',
    'Diário de uma garota nada popular 2 — Rachel Russell',
    'Um favorzinho do vizinho — Forest',
    'Box Diário de uma garota nada popular (Vol. 1–5) — Russell',
  ],
  'Amarcord': [
    'De quatro — Miranda July',
    'Mau hábito — Portero',
    'Fup — Jim Dodge',
    'Triste Tigre — Neige Sinno',
    'Um estranho no ninho — Ken Kesey',
    'Dias lentos, encontros fugazes — Eve Babitz',
    'Escalavra — Freire',
    'Monstros: O dilema do fã — Dederer',
    'Drácula: O homem da noite — Bram Stoker',
    'Dengue boy: A infância do mundo — Nieva',
  ],
}

// Logos CDN como fallback quando logo_url não está no Directus
const SELO_LOGOS_FALLBACK: Record<string, string> = {
  'Record':                 'https://cdn.record.com.br/wp-content/uploads/2019/06/26030107/logo-record.png',
  'BestSeller':             'https://cdn.record.com.br/wp-content/uploads/2019/06/26030056/logo-best-seller.png',
  'BestBolso':              'https://cdn.record.com.br/wp-content/uploads/2019/06/26030058/logo-best-bolso.png',
  'Best Business':          'https://cdn.record.com.br/wp-content/uploads/2019/06/26030056/logo-best-business.png',
  'Galera':                 'https://cdn.record.com.br/wp-content/uploads/2019/06/26030105/logo-galera.png',
  'Galera Junior':          'https://cdn.record.com.br/wp-content/uploads/2019/06/26030103/logo-galera-junior.png',
  'Galerinha':              'https://cdn.record.com.br/wp-content/uploads/2019/06/26030101/logo-galerinha.png',
  'Reco-reco':              'https://cdn.record.com.br/wp-content/uploads/2025/01/23092547/Design-sem-nome-e1737635201568.png',
  'Verus':                  'https://cdn.record.com.br/wp-content/uploads/2019/06/26030045/logo-verus.png',
  'Bertrand Brasil':        'https://cdn.record.com.br/wp-content/uploads/2019/06/26030100/logo-bertrand-brasil.png',
  'José Olympio':           'https://cdn.record.com.br/wp-content/uploads/2019/06/26030051/logo-jose-olympio.png',
  'Rosa dos Tempos':        'https://cdn.record.com.br/wp-content/uploads/2019/06/26030047/logo-rosa-dos-tempos.png',
  'Civilização Brasileira': 'https://cdn.record.com.br/wp-content/uploads/2019/06/26030054/logo-civilizacao-brasileira.png',
  'Paz & Terra':            'https://cdn.record.com.br/wp-content/uploads/2019/06/26030049/logo-paz-e-terra.png',
  'Difel':                  'https://cdn.record.com.br/wp-content/uploads/2019/06/26030052/logo-difel.png',
  'Amarcord':               'https://cdn.record.com.br/wp-content/uploads/2023/11/24111333/Logo-Amarcord-p.png',
}

type Grupo = { id: number; nome: string; cor?: string }

type Selo = {
  id: number
  nome_display: string
  total_livros_mb: number | null
  ativo: boolean
  logo_url?: string | null
  descricao?: string | null
}

type Livro = {
  isbn: string
  titulo: string
  editora: string
  capa_url: string | null
  data_publicacao: string
}

export default async function GrupoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const gruposRes = await fetch(`${DIRECTUS_URL}/items/grupos_editoriais?fields=id,nome,cor&limit=100`)
  const grupos: Grupo[] = (await gruposRes.json()).data || []
  const grupo = grupos.find(g => slugify(g.nome) === slug)
  if (!grupo) notFound()

  const selosRes = await fetch(
    `${DIRECTUS_URL}/items/selos?filter[grupo][_eq]=${grupo.id}&fields=id,nome_display,total_livros_mb,ativo,logo_url,descricao&limit=200&sort=nome_display`
  )
  const selos: Selo[] = ((await selosRes.json()).data || []).filter((s: Selo) => s.nome_display)

  const selosAtivos = selos.filter(s => s.ativo)
  const selosInativos = selos.filter(s => !s.ativo)

  // Datas para classificação de atividade
  const hoje = new Date().toISOString().slice(0, 10)
  const seisAtras = new Date()
  seisAtras.setMonth(seisAtras.getMonth() - 6)
  const seisAtrasStr = seisAtras.toISOString().slice(0, 10)

  // Fetch covers + real catalog count + lançamentos + pré-vendas per active selo in parallel
  const livrosPorSelo: Record<string, Livro[]> = {}
  const contagemPorSelo: Record<string, number> = {}
  const lancPorSelo: Record<string, number> = {}
  const prevPorSelo: Record<string, number> = {}

  await Promise.all(
    selosAtivos.map(async (selo) => {
      const filterCovers = encodeURIComponent(JSON.stringify({
        _and: [{ editora: { _eq: selo.nome_display } }, { capa_url: { _nnull: true } }]
      }))
      const filterCount = encodeURIComponent(JSON.stringify({ editora: { _eq: selo.nome_display } }))
      const filterLanc = encodeURIComponent(JSON.stringify({
        _and: [
          { editora: { _eq: selo.nome_display } },
          { data_publicacao: { _gte: seisAtrasStr, _lte: hoje } },
        ]
      }))
      const filterPrev = encodeURIComponent(JSON.stringify({
        _and: [
          { editora: { _eq: selo.nome_display } },
          { data_publicacao: { _gt: hoje } },
        ]
      }))

      const [coversRes, countRes, lancRes, prevRes] = await Promise.all([
        fetch(`${DIRECTUS_URL}/items/biblioteca?fields=isbn,titulo,editora,capa_url,data_publicacao&sort=-data_publicacao&limit=16&filter=${filterCovers}`),
        fetch(`${DIRECTUS_URL}/items/biblioteca?limit=0&meta=filter_count&filter=${filterCount}`),
        fetch(`${DIRECTUS_URL}/items/biblioteca?limit=0&meta=filter_count&filter=${filterLanc}`),
        fetch(`${DIRECTUS_URL}/items/biblioteca?limit=0&meta=filter_count&filter=${filterPrev}`),
      ])

      livrosPorSelo[selo.nome_display] = (await coversRes.json()).data || []
      contagemPorSelo[selo.nome_display] = (await countRes.json()).meta?.filter_count || 0
      lancPorSelo[selo.nome_display] = (await lancRes.json()).meta?.filter_count || 0
      prevPorSelo[selo.nome_display] = (await prevRes.json()).meta?.filter_count || 0
    })
  )

  // For inactive selos, use stored total or fetch count
  await Promise.all(
    selosInativos.map(async (selo) => {
      if (selo.total_livros_mb && selo.total_livros_mb > 0) {
        contagemPorSelo[selo.nome_display] = selo.total_livros_mb
      } else {
        const filterCount = encodeURIComponent(JSON.stringify({ editora: { _eq: selo.nome_display } }))
        const countRes = await fetch(`${DIRECTUS_URL}/items/biblioteca?limit=0&meta=filter_count&filter=${filterCount}`)
        contagemPorSelo[selo.nome_display] = (await countRes.json()).meta?.filter_count || 0
      }
    })
  )

  const totalLivros = Object.values(contagemPorSelo).reduce((sum, n) => sum + n, 0)

  // Mosaico: 20 livros mais recentes do grupo
  const nomesSelos = selos.map(s => s.nome_display)
  let mosaico: Livro[] = []
  if (nomesSelos.length > 0) {
    const filter = encodeURIComponent(JSON.stringify({ editora: { _in: nomesSelos }, capa_url: { _nnull: true } }))
    const res = await fetch(
      `${DIRECTUS_URL}/items/biblioteca?fields=isbn,titulo,editora,capa_url&sort=-data_publicacao&limit=24&filter=${filter}`
    )
    mosaico = (await res.json()).data || []
  }

  const sortedSelos = [...selosAtivos, ...selosInativos]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'Georgia, serif' }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <div style={{
        padding: '64px 64px 48px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: '32px',
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c0392b', marginBottom: '12px' }}>
            grupo editorial
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 'normal', letterSpacing: '0.04em', color: 'var(--text)', lineHeight: 1, marginBottom: '10px' }}>
            {grupo.nome}
          </h1>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontStyle: 'italic' }}>
            {selosAtivos.length} selos ativos · {totalLivros.toLocaleString('pt-BR')} títulos catalogados
          </div>
        </div>
      </div>

      {/* ── STATS ────────────────────────────────────────── */}
      <div style={{ display: 'flex', padding: '36px 64px', borderBottom: '1px solid var(--border)' }}>
        {[
          { num: selosAtivos.length, label: 'selos ativos' },
          { num: selosInativos.length, label: 'selos inativos' },
          { num: totalLivros.toLocaleString('pt-BR'), label: 'títulos catalogados' },
          { num: selos.length, label: 'total de selos' },
        ].map((stat, i, arr) => (
          <div key={i} style={{
            flex: 1,
            paddingRight: i < arr.length - 1 ? '32px' : 0,
            marginRight: i < arr.length - 1 ? '32px' : 0,
            borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ fontSize: '2.4rem', fontWeight: 'normal', color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '6px' }}>
              {stat.num}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── MOSAICO ──────────────────────────────────────── */}
      {mosaico.length > 0 && (
        <div style={{ padding: '48px 64px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '24px' }}>
            lançamentos recentes
          </div>
          <div style={{ display: 'flex', gap: '6px', height: '200px', overflow: 'hidden' }}>
            {mosaico.map(livro => (
              <div key={livro.isbn} style={{ height: '100%', flexShrink: 0, borderRadius: '3px', overflow: 'hidden', background: 'var(--surface)' }}>
                {livro.capa_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={livro.capa_url}
                    alt={livro.titulo}
                    title={livro.titulo}
                    style={{ height: '100%', width: 'auto', display: 'block', objectFit: 'cover' }}
                    loading="lazy"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SELOS ────────────────────────────────────────── */}
      <div style={{ padding: '48px 64px 80px' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '24px' }}>
          selos do grupo
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2px' }}>
          {sortedSelos.map(selo => {
            const covers = livrosPorSelo[selo.nome_display] || []
            const count = contagemPorSelo[selo.nome_display] || 0
            const nLanc = lancPorSelo[selo.nome_display] || 0
            const nPrev = prevPorSelo[selo.nome_display] || 0
            const isInativo = !selo.ativo
            // Selos marcados como ativos mas sem atividade recente
            const semLancamentos = !isInativo && nLanc === 0 && nPrev === 0
            const info = SELO_INFO[selo.nome_display]
            const hits = HITS[selo.nome_display] || []
            const logoUrl = selo.logo_url || SELO_LOGOS_FALLBACK[selo.nome_display] || null
            const descricao = selo.descricao || info?.desc || null

            return (
              <div
                key={selo.id}
                style={{
                  background: 'var(--surface)',
                  padding: '32px',
                  border: '1px solid var(--border)',
                  position: 'relative',
                  opacity: isInativo ? 0.65 : 1,
                }}
              >
                {isInativo && (
                  <div style={{
                    position: 'absolute', top: '14px', right: '14px',
                    fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: '#c0392b', border: '1px solid #c0392b', background: 'rgba(192,57,43,0.08)',
                    padding: '2px 7px', borderRadius: '3px',
                  }}>
                    inativo
                  </div>
                )}
                {semLancamentos && (
                  <div style={{
                    position: 'absolute', top: '14px', right: '14px',
                    fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: '#888', border: '1px solid #444', background: 'rgba(100,100,100,0.08)',
                    padding: '2px 7px', borderRadius: '3px',
                  }}>
                    sem lançamentos
                  </div>
                )}

                {/* Logo */}
                {logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt={selo.nome_display}
                    style={{ maxHeight: '28px', maxWidth: '110px', width: 'auto', height: 'auto', display: 'block', marginBottom: '10px', opacity: 0.85 }}
                  />
                )}

                {/* Header: nome + stats */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: info?.tag ? '8px' : '16px', gap: '12px' }}>
                  <div style={{ fontSize: '1.1rem', letterSpacing: '0.03em', color: 'var(--text)' }}>
                    {selo.nome_display}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                      <strong style={{ color: 'var(--text)', fontWeight: 'normal' }}>{count.toLocaleString('pt-BR')}</strong>{' '}em catálogo
                    </span>
                    {!isInativo && (
                      <>
                        <span style={{ fontSize: '0.7rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                          <strong style={{ color: nLanc > 0 ? 'var(--text)' : 'var(--muted)', fontWeight: 'normal' }}>{nLanc}</strong>{' '}últimos 6 meses
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                          <strong style={{ color: nPrev > 0 ? '#c0392b' : 'var(--muted)', fontWeight: 'normal' }}>{nPrev}</strong>{' '}em pré-venda
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Tag */}
                {info?.tag && (
                  <div style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c0392b', marginBottom: '12px', opacity: 0.85 }}>
                    {info.tag}
                  </div>
                )}

                {/* Descrição */}
                {descricao && (
                  <div style={{
                    fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '20px',
                    fontStyle: 'italic',
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {descricao}
                  </div>
                )}

                {/* Capas recentes — 2 linhas */}
                {covers.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', overflow: 'hidden', maxHeight: '172px', marginBottom: hits.length > 0 ? '20px' : 0 }}>
                    {covers.map(livro => (
                      <div
                        key={livro.isbn}
                        title={livro.titulo}
                        style={{
                          width: '56px', height: '80px', background: 'var(--border)',
                          borderRadius: '3px', overflow: 'hidden', flexShrink: 0,
                          border: '1px solid var(--border)',
                        }}
                      >
                        {livro.capa_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={livro.capa_url}
                            alt={livro.titulo}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            loading="lazy"
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '1.2rem' }}>
                            ◻
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Títulos de referência (HITS) */}
                {hits.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>
                      títulos de referência
                    </div>
                    <ol style={{ margin: 0, padding: '0 0 0 16px', listStyle: 'decimal' }}>
                      {hits.slice(0, 5).map((hit, i) => (
                        <li key={i} style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '2px' }}>
                          {hit}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {!isInativo && covers.length === 0 && hits.length === 0 && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                    sem títulos catalogados
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
