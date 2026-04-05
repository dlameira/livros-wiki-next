// ─── Dados editoriais dos selos brasileiros ──────────────────────────────────
// Fonte: pesquisa editorial + rankings de vendas 2020–2025 (Nielsen/PublishNews)

export const SELO_INFO: Record<string, { tag: string; desc: string }> = {

  // ── GRUPO RECORD ─────────────────────────────────────────────────────────
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

  // ── GRUPO SCHWARCZ ───────────────────────────────────────────────────────
  'Companhia das Letras': {
    tag: 'ficção literária · não-ficção · literatura brasileira',
    desc: 'Fundada em 1986 por Luiz Schwarcz, é a maior editora literária do Brasil. Catálogo de prestígio em ficção nacional e internacional, não-ficção narrativa e obras de referência. Responsável por descobrir gerações de autores brasileiros e trazer os maiores nomes da literatura mundial.',
  },
  'Penguin-Companhia': {
    tag: 'não-ficção internacional · ciências · ensaio popular',
    desc: 'Parceria com a Penguin Random House que trouxe ao Brasil o catálogo de não-ficção de maior impacto global. Harari, Gladwell, Kahneman e outros pensadores que definem o debate intelectual contemporâneo. O canal brasileiro para as ideias que movem o mundo.',
  },
  'Zahar': {
    tag: 'filosofia · psicanálise · ciências sociais',
    desc: 'Referência incontornável em psicanálise, filosofia e ciências sociais no Brasil há décadas. Publica Freud, Lacan, Foucault e outros pilares do pensamento ocidental moderno. Catálogo de longa duração com penetração profunda nas universidades brasileiras.',
  },
  'Clássicos Zahar': {
    tag: 'Freud · edições acessíveis · psicanalise',
    desc: 'Linha de bolso da Zahar que torna o pensamento psicanalítico acessível a um público mais amplo. Edições compactas e cuidadas dos textos fundamentais de Freud e outros clássicos da psicanálise. A porta de entrada para quem começa a explorar o campo.',
  },
  'Objetiva': {
    tag: 'crônicas · humor · ficção nacional',
    desc: 'Selo histórico do grupo, lar de Luis Fernando Verissimo e Rubem Fonseca por décadas. Ficção e crônica brasileira com alcance popular e qualidade literária. Uma das primeiras aquisições do Grupo Schwarcz, trazendo consigo um catálogo consolidado de autores nacionais.',
  },
  'Seguinte': {
    tag: 'young adult · séries · romance · fantasia',
    desc: 'Selo de young adult do Grupo Schwarcz com foco em séries de grande apelo entre leitores jovens. Heartstopper, A Seleção e outras franquias de sucesso definem o catálogo. Captura o leitor no início da jornada literária e o conduz para os selos adultos do grupo.',
  },
  'Suma': {
    tag: 'ficção de entretenimento · bestsellers · Stephen King',
    desc: 'Ficção popular de alta rotatividade — Stephen King, George R.R. Martin e outros mestres do entretenimento. Motor comercial que financia a curadoria literária dos selos irmãos. Publica o que vende em escala enquanto mantém o padrão editorial do grupo.',
  },
  'Claro Enigma': {
    tag: 'poesia · Leminski · Adélia Prado',
    desc: 'O selo de poesia do Grupo Schwarcz, com catálogo que inclui Paulo Leminski, Adélia Prado e Manoel de Barros. Referência em poesia brasileira contemporânea e clássica. Nicho de alta fidelidade com leitor que retorna a cada lançamento.',
  },
  'Companhia de Bolso': {
    tag: 'clássicos · pocket · literatura brasileira',
    desc: 'Formato de bolso para a literatura brasileira clássica e para os grandes títulos do catálogo Companhia. Democratiza o acesso a Machado de Assis, Guimarães Rosa e Clarice Lispector em edições acessíveis. Peça fundamental na estratégia de backlist do grupo.',
  },
  'Companhia das Letrinhas': {
    tag: 'infantil · literatura · qualidade · premiados',
    desc: 'O braço infantil do Grupo Schwarcz, com qualidade literária como princípio. Lygia Bojunga, Ruth Rocha e Ana Maria Machado integram um catálogo de referência para a literatura infantil brasileira. Forma leitores que depois migram naturalmente para os selos adultos.',
  },
  'Companhia de Mesa': {
    tag: 'gastronomia · culinária · cultura alimentar',
    desc: 'Selo dedicado à gastronomia e à cultura alimentar, com curadoria que vai de receitas a ensaios sobre comida. Alex Atala e Nigella Lawson convivem em um catálogo que trata a cozinha como expressão cultural. Nicho premium com leitor disposto a investir no objeto-livro.',
  },
  'Alfaguara': {
    tag: 'literatura hispânica · Vargas Llosa · ficção premiada',
    desc: 'Parceria com a Alfaguara espanhola traz ao Brasil o melhor da literatura em língua espanhola. Mario Vargas Llosa, Mariana Enriquez e outros autores premiados compõem um catálogo de prestígio. Ponte entre o leitor brasileiro e a produção literária hispano-americana.',
  },
  'Boa Companhia': {
    tag: 'contos · antologias · literatura brasileira',
    desc: 'Linha de antologias e coletâneas de conto brasileiro, com curadoria que mapeia a melhor produção nacional. Espaço para o conto como forma literária autônoma em um mercado dominado pelo romance. Referência para quem quer conhecer a diversidade da ficção brasileira.',
  },
  'Paralela': {
    tag: 'não-ficção · comportamento · ciências · ensaio',
    desc: 'Não-ficção de impacto para o leitor curioso — ciências comportamentais, filosofia prática e ensaio acessível. Brené Brown, Hannah Arendt e outros pensadores que ajudam a entender o mundo contemporâneo. O braço intelectual e popular do grupo.',
  },
  'Portfolio-Penguin': {
    tag: 'negócios · startups · empreendedorismo · inovação',
    desc: 'A mais qualificada linha de negócios e empreendedorismo do país, com títulos como De Zero a Um e A Startup Enxuta. Parceria com a Penguin que concentra o catálogo de negócios de maior prestígio internacional. Leitura obrigatória nos círculos de inovação e tecnologia.',
  },
  'Fontanar': {
    tag: 'literatura lusófona · Portugal · ficção ibérica',
    desc: 'Parceria com a Fontanar espanhola voltada à ficção ibérica e lusófona de qualidade. Publica autores portugueses e ibero-americanos que raramente chegavam ao mercado brasileiro. Nicho sofisticado com leitor de perfil literário.',
  },
  'Brinque-Book': {
    tag: 'livros interativos · bebês · sensorial · engenharia de papel',
    desc: 'Especialista em livros infantis com engenharia especial — pop-ups, texturas, abas e outros elementos interativos. Um dos selos mais reconhecidos no segmento de livros para a primeira infância. Presente na lista de presentes das famílias brasileiras há décadas.',
  },
  'Bloom Brasil': {
    tag: 'ficção diversa · autoras negras · literatura global',
    desc: 'Seleção cuidadosa de ficção contemporânea de autoras e autores de perspectivas sub-representadas. Yaa Gyasi, Ocean Vuong e Roxane Gay integram um catálogo que amplifica vozes essenciais da literatura global. Um dos selos mais relevantes para o debate literário atual.',
  },
  'Quadrinhos na Cia': {
    tag: 'HQ · graphic novel · quadrinhos literários',
    desc: 'O braço de quadrinhos do Grupo Schwarcz, com curadoria que trata os HQs como literatura. Persépolis, Maus e Fun Home integram um catálogo que elevou o padrão da publicação de graphic novels no Brasil. Para o leitor que não separa texto e imagem em categorias menores.',
  },
  'Reviravolta': {
    tag: 'juvenil · aventura · série',
    desc: 'Linha juvenil do Grupo Schwarcz voltada a séries de aventura e ficção para leitores de 10 a 14 anos. Narrativas dinâmicas que mantêm o jovem leitor engajado antes da transição para o YA.',
  },
  'Escarlate': {
    tag: 'romance nacional · ficção feminina · autoras brasileiras',
    desc: 'Ficção e romance de autoras brasileiras contemporâneas, com foco em narrativas femininas de qualidade. Espaço para a voz nacional no segmento de maior crescimento do mercado editorial atual.',
  },
  'Pequena Zahar': {
    tag: 'divulgação · infantojuvenil · ciências · filosofia',
    desc: 'Versão acessível do rigor intelectual da Zahar para leitores jovens. Filosofia, ciências e humanidades apresentadas com clareza para crianças e adolescentes. Forma o leitor crítico desde cedo.',
  },
  'Editora JBC': {
    tag: 'mangá · anime · cultura japonesa · quadrinhos',
    desc: 'A maior editora de mangá do Brasil, com catálogo que inclui My Hero Academia, Fullmetal Alchemist e Death Note. Integrada ao Grupo Schwarcz, lidera o mercado de cultura japonesa no Brasil. A porta de entrada para milhões de jovens leitores apaixonados por mangá.',
  },

  // ── GRUPO ROCCO ──────────────────────────────────────────────────────────
  'Rocco': {
    tag: 'ficção · bestsellers · Harry Potter · literatura',
    desc: 'Fundada em 1975, a Rocco é uma das principais editoras do Brasil. Lar de Harry Potter no país — direito que mantém desde 2000 —, publica também grandes nomes da ficção brasileira e international como Clarice Lispector e Toni Morrison. Catálogo que une bestsellers de massa a literatura de qualidade.',
  },
  'Fantástica Rocco': {
    tag: 'fantasia épica · ficção científica · especulativa',
    desc: 'Braço de ficção especulativa da Rocco, com curadoria voltada à fantasia épica e à ficção científica de qualidade. Patrick Rothfuss, Brandon Sanderson e Robin Hobb definem um catálogo de referência para os fãs do gênero no Brasil.',
  },
  'Bicicleta Amarela': {
    tag: 'infantil · séries · ilustração · humor',
    desc: 'Linha infantil da Rocco focada em séries com personagens memoráveis e ilustração de qualidade. Atende a faixa dos 5 aos 10 anos com histórias que equilibram humor e imaginação.',
  },
  'Fábrica231': {
    tag: 'não-ficção · jornalismo · memórias · narrativa',
    desc: 'Braço de não-ficção da Rocco com foco em jornalismo literário, memórias e narrativas de impacto. Eu Sou Malala e outros títulos marcantes integram um catálogo que mistura relevância e acessibilidade.',
  },
  'Rocco Pequenos Leitores': {
    tag: 'infantil · 4–8 anos · narrativa · ilustração',
    desc: 'Ficção infantil para leitores em formação, dos 4 aos 8 anos. Narrativas com personagens cativantes e ilustrações expressivas que criam a base do hábito de leitura.',
  },
  'Rocquinho': {
    tag: 'bebês · board book · primeiras leituras',
    desc: 'Livros robustos para os primeiros anos de vida. Board books com cores vivas, formas simples e texto mínimo que estimulam o desenvolvimento do bebê e criam o vínculo afetivo com o livro.',
  },

  // ── GMT EDITORES ─────────────────────────────────────────────────────────
  'Editora Sextante': {
    tag: 'autoajuda · espiritualidade · comportamento',
    desc: 'Uma das maiores editoras de autoajuda e espiritualidade do Brasil, com mais de 30 anos de mercado. Eckhart Tolle, Augusto Cury e O Monge e o Executivo integram um catálogo que define o segmento. Presença constante nos rankings de mais vendidos nacionais.',
  },
  'Editora Arqueiro': {
    tag: 'ficção popular · thrillers · romance · entretenimento',
    desc: 'Ficção de entretenimento de alto impacto — thrillers, romance contemporâneo e dark fiction. Mark Manson, Freida McFadden e Ali Hazelwood integram um catálogo que sabe capturar tendências. Um dos selos mais dinâmicos do mercado brasileiro na última década.',
  },
  'Sextante Artes': {
    tag: 'arte · fotografia · design · cultura visual',
    desc: 'Linha de arte e fotografia da GMT Editores com edições de grande formato e acabamento especial. Sebastião Salgado e monografias de fotógrafos internacionais integram um catálogo voltado ao colecionador e ao amante da imagem.',
  },

  // ── GRUPO AUTÊNTICA ──────────────────────────────────────────────────────
  'Autêntica': {
    tag: 'educação · Paulo Freire · bell hooks · pedagogia',
    desc: 'Referência nacional em educação, filosofia e ciências humanas. Publica Paulo Freire e bell hooks no Brasil, além de educadores e pensadores que moldam o debate pedagógico contemporâneo. Presença forte nas universidades e nas redes de educação progressista.',
  },
  'Autêntica Business': {
    tag: 'negócios · liderança · inovação · gestão',
    desc: 'Braço de negócios da Autêntica, com títulos de gestão, liderança e desenvolvimento organizacional. Complementa o portfólio do grupo com obras voltadas ao leitor corporativo e ao profissional em formação.',
  },
  'Autêntica Contemporânea': {
    tag: 'literatura · Hilda Hilst · ficção experimental · Brasil',
    desc: 'Ficção contemporânea brasileira e international de viés literário e experimental. Lar da obra completa de Hilda Hilst no Brasil, o selo representa o flanco mais ousado da Autêntica — literatura que desafia e expande.',
  },
  'Autêntica infantil e juvenil': {
    tag: 'infantil · diversidade · formação · ilustração',
    desc: 'Literatura infantil e juvenil com ênfase em diversidade, representatividade e formação crítica. Títulos que apresentam o mundo às crianças com honestidade e imaginação, alinhados aos valores do grupo.',
  },
  'Gutenberg': {
    tag: 'filosofia clássica · fenomenologia · pensamento europeu',
    desc: 'Linha de grande filosofia ocidental — Heidegger, Levinas, Hannah Arendt. Publica as obras fundamentais do pensamento filosófico europeu do século XX em traduções de referência para o leitor brasileiro.',
  },
  'Nemo': {
    tag: 'HQ · graphic novel · quadrinhos literários · clássicos',
    desc: 'O braço de quadrinhos da Autêntica, com catálogo que vai de Sandman a Sin City. Publica os clássicos da graphic novel internacional com edições cuidadas e acessíveis ao leitor brasileiro.',
  },
  'Vestígio': {
    tag: 'true crime · thrillers · suspense · crimes reais',
    desc: 'O maior selo de true crime do Brasil, com presença constante nos rankings de mais vendidos. Mindhunter, Assassino do Golden State e a série de Ilana Casoy definem um catálogo que alimenta a cultura do podcast e da série policial. O true crime como gênero editorial no país passa pela Vestígio.',
  },

  // ── DARKSIDE ─────────────────────────────────────────────────────────────
  'Darkside Books': {
    tag: 'terror · horror · dark · edições especiais',
    desc: 'A maior editora de terror e horror do Brasil, com edições especiais que tornaram o livro-objeto um mercado. Bram Stoker, Shirley Jackson e H.P. Lovecraft em edições de colecionador que concorrem com os mais belos livros do mundo. Criou uma comunidade leitora fiel e apaixonada pelo objeto.',
  },
  'Darkside Books - Caveirinha': {
    tag: 'infantil dark · horror suave · juvenil assustador',
    desc: 'O lado infantil da DarkSide — terror suave para crianças que adoram histórias assustadoras. Personagens monstruosos e adoráveis para a primeira infância que não quer ser protegida do escuro.',
  },
  'Darkside Books - Crime Scene': {
    tag: 'true crime · crimes reais · serial killers',
    desc: 'Linha de true crime da DarkSide com foco em crimes reais, serial killers e investigações históricas. Compete com a Vestígio no segmento mais popular do mercado editorial atual.',
  },
  'Darkside Books - Darklove': {
    tag: 'dark romance · possessivo · adulto · emoção intensa',
    desc: 'Romance sombrio e intenso para o leitor adulto que quer emoções ao limite. Dark romance com personagens complexos e narrativas que exploram o desejo, o poder e a obsessão. O segmento de maior crescimento na ficção adulta atual.',
  },
  'Darkside Books - Fábulas Dark': {
    tag: 'retellings · contos de fadas · terror · adulto',
    desc: 'Releituras sombrias dos contos de fadas clássicos para o leitor adulto. Chapeuzinho Vermelho, Branca de Neve e Cinderela em versões que subvertem o original e exploram o lado mais escuro das fábulas.',
  },
  'Darkside Books - Graphic Novel': {
    tag: 'HQ · horror visual · quadrinhos dark',
    desc: 'Quadrinhos de terror e horror com o padrão visual da DarkSide. Edições caprichadas de graphic novels que combinam narrativa visual poderosa com a estética sombria da editora.',
  },
  'Darkside Books - Macabra': {
    tag: 'horror clássico · Lovecraft · Shirley Jackson · literatura gótica',
    desc: 'Os clássicos do horror literário em edições que honram a grandeza do texto. Lovecraft, Shirley Jackson e Poe em apresentações que equilibram acessibilidade e reverência ao original.',
  },
  'Darkside Books - Magicae': {
    tag: 'esotérico · bruxaria · magia · ritual',
    desc: 'Guias práticos e teóricos de bruxaria, magia e espiritualidade alternativa. Atende o leitor que pratica ou quer praticar — do iniciante ao praticante avançado — com o mesmo cuidado editorial que a DarkSide aplica ao horror.',
  },
  'Darkside Books - Medo Clássico': {
    tag: 'horror literário · clássicos · gótico · cânone',
    desc: 'O cânone do horror literário em edições de colecionador. Drácula, Frankenstein e O Médico e o Monstro em versões que tratam esses títulos com o respeito de obras de arte. A biblioteca essencial do leitor de horror.',
  },
  'Darkside Books - Sociedade Secreta': {
    tag: 'edições numeradas · luxo · colecionador · exclusivo',
    desc: 'Edições numeradas, assinadas e de luxo para o colecionador exigente. Limitadas, exclusivas e produzidas com os mais altos padrões de acabamento gráfico. O topo da pirâmide do mercado de livros especiais no Brasil.',
  },
  'Darkside Books - Wish': {
    tag: 'romantasy · fantasia · romance · Sarah J. Maas',
    desc: 'Romantasy e fantasy com protagonismo feminino, magia e romance épico. Sarah J. Maas e outros autores que dominam o segmento mais dinâmico da ficção jovem adulta atual.',
  },
  'Darkside Books - Cinebookclub': {
    tag: 'cinema · tie-ins · cultura pop · making-of',
    desc: 'Clube de livros e tie-ins cinematográficos para o fã de cinema que também é leitor. Publicações ligadas a filmes e séries que ampliam o universo narrativo além da tela.',
  },

  // ── GRUPO TODAVIA ────────────────────────────────────────────────────────
  'Todavia': {
    tag: 'literatura brasileira · Torto Arado · prestígio',
    desc: 'Fundada em 2017, a Todavia rapidamente se tornou referência em literatura brasileira contemporânea de prestígio. Torto Arado, de Itamar Vieira Junior — Jabuti 2020 —, é o maior símbolo do seu projeto editorial. Curadoria exigente que privilegia a voz nacional sem abrir mão da qualidade literária.',
  },
  'Baião': {
    tag: 'literatura nordestina · cultura regional · sertão',
    desc: 'Braço nordestino da Todavia, com foco em literatura e cultura da região. Vozes do Nordeste em narrativas que exploram o sertão, o litoral e a cidade com perspectiva própria e linguagem singular.',
  },
  'Todavia - POD': {
    tag: 'print on demand · backlist · disponibilidade',
    desc: 'Linha de impressão sob demanda que mantém o catálogo da Todavia disponível sem estoques. Garante que títulos fora de linha continuem acessíveis ao leitor sem custo de armazenagem.',
  },

  // ── GRUPO ALEPH ──────────────────────────────────────────────────────────
  'Editora Aleph': {
    tag: 'ficção científica · fantasia · Duna · Fundação',
    desc: 'A maior editora de ficção científica e fantasia clássica do Brasil. Duna, Fundação e as obras de Ursula K. Le Guin integram um catálogo que educou gerações de leitores no gênero especulativo. Referência incontornável para quem leva a ficção científica a sério.',
  },
  'Glida': {
    tag: 'young adult · fantasia · romance juvenil',
    desc: 'Braço de YA fantasia da Aleph, com protagonismo feminino e mundos construídos com cuidado. Atende o leitor jovem que já superou as sagas adolescentes e quer fantasia com mais profundidade.',
  },
  'Goya': {
    tag: 'arte · fotografia · design · livros visuais',
    desc: 'Linha de arte e fotografia da Aleph com edições de grande formato. Publicações visuais que valorizam a imagem como linguagem primária e o livro como objeto de arte.',
  },

  // ── GRUPO DBA ────────────────────────────────────────────────────────────
  'DBA': {
    tag: 'fotografia · arte · cultura · Brasil',
    desc: 'Editora de arte e fotografia com foco na cultura e na identidade brasileira. Sebastião Salgado e outros grandes nomes da fotografia e das artes visuais integram um catálogo de referência para o colecionador e o pesquisador.',
  },
  'DBA Literatura': {
    tag: 'ficção · literatura geral · narrativa',
    desc: 'Braço literário da DBA com ficção nacional e internacional de qualidade. Complementa o catálogo de arte da editora com narrativas que compartilham o mesmo cuidado editorial e gráfico.',
  },

  // ── ARQUIPÉLAGO ──────────────────────────────────────────────────────────
  'Arquipélago Editorial': {
    tag: 'negócios · inovação · liderança · desenvolvimento pessoal',
    desc: 'Fundada em 2001 em São Paulo, consolidou-se como referência em livros de negócios, inovação e desenvolvimento pessoal. Freakonomics, Nassim Taleb e Peter Drucker integram um catálogo que fala ao empreendedor intelectual. Em 2024 anunciou expansão para a ficção literária.',
  },
  'Arquipélago Negócios': {
    tag: 'empreendedorismo · estratégia · gestão corporativa',
    desc: 'Linha de negócios focada em estratégia empresarial e gestão organizacional. Títulos de referência para executivos e empreendedores que buscam aperfeiçoamento com rigor intelectual.',
  },

  // ── GLOBO ────────────────────────────────────────────────────────────────
  'Editora Globo': {
    tag: 'jornalismo · revistas · referência · cultura',
    desc: 'Braço editorial do Grupo Globo com longa tradição em publicações jornalísticas e referência cultural. Integra o portfólio editorial da maior empresa de mídia do Brasil, com foco em obras ligadas à produção e ao universo da Globo.',
  },
  'Globo Livros': {
    tag: 'ficção · não-ficção · bestsellers · contemporâneo',
    desc: 'Selo de livros do Grupo Globo que combina ficção e não-ficção de qualidade com o alcance da maior mídia do Brasil. Ainda Estou Aqui, de Marcelo Rubens Paiva, e outros fenômenos de vendas integram um catálogo cada vez mais relevante.',
  },
  'Biblioteca Azul': {
    tag: 'clássicos · literatura · edições especiais · Saramago',
    desc: 'Selo de prestígio do Grupo Globo dedicado a clássicos e ficção literária em edições especiais. Lar de José Saramago no Brasil, publica a obra do Nobel em edições de referência. Linha premium que valoriza o objeto-livro.',
  },
  'Alt': {
    tag: 'young adult · romance · fantasia · contemporâneo',
    desc: 'Selo jovem do Grupo Globo focado em ficção de entretenimento popular. A série Maxton Hall, de Mona Kasten, e outros títulos de grande apelo entre leitores jovens definem o catálogo. Capitaliza o crescimento do segmento YA no mercado brasileiro.',
  },
  'Globo de Bolso': {
    tag: 'bolso · acessível · backlist · reimpressões',
    desc: 'Linha de bolso do Grupo Globo que torna o catálogo do grupo acessível em formato menor e preço reduzido. Democratiza títulos de qualidade para o leitor que busca boa literatura a custo baixo.',
  },

  // ── WMF ──────────────────────────────────────────────────────────────────
  'WMF Martins Fontes': {
    tag: 'filosofia · ciências humanas · direito · acadêmico',
    desc: 'Herdeira da histórica Livraria Martins Fontes, é referência em livros acadêmicos e de divulgação intelectual em filosofia, direito e ciências sociais. Com mais de 1.000 títulos, é especialista em long-sellers — obras de relevância duradoura que permanecem décadas em catálogo.',
  },

  // ── FARO ────────────────────────────────────────────────────────────────
  'Faro Editorial': {
    tag: 'ficção popular · romance · thriller · entretenimento',
    desc: 'Editora de ficção popular e entretenimento com catálogo dinâmico em romance, thriller e suspense. Publica autores nacionais e internacionais voltados ao leitor de ficção comercial com lançamentos frequentes.',
  },
  'Milk Shakespeare': {
    tag: 'infantojuvenil · séries · aventura · humor',
    desc: 'Selo infantojuvenil da Faro Editorial especializado em séries de aventura e humor para adolescentes. Casa brasileira de Os Últimos Jovens da Terra, de Max Brallier, e outras franquias de grande apelo entre jovens leitores.',
  },

  // ── PLANETA ──────────────────────────────────────────────────────────────
  'Planeta': {
    tag: 'bestsellers · autoajuda · ficção · internacional',
    desc: 'Braço brasileiro do Grupo Planeta, um dos maiores grupos editoriais do mundo. Publica bestsellers de ficção e não-ficção internacionais com forte presença em autoajuda, romance e narrativas de grande apelo popular.',
  },
  'Planeta Minotauro': {
    tag: 'ficção científica · fantasia · terror · especulativa',
    desc: 'Referência em ficção especulativa no Brasil — ficção científica, fantasia e horror para o leitor exigente. A Roda do Tempo, O Senhor dos Anéis e outros épicos integram um catálogo que é bíblia para o público geek.',
  },
  'Planeta Estratégia': {
    tag: 'negócios · estratégia · gestão · liderança',
    desc: 'Braço de negócios e gestão do Grupo Planeta Brasil, com títulos de estratégia empresarial e liderança. Complementa o portfólio do grupo com obras voltadas ao leitor corporativo brasileiro.',
  },
  'Outro Planeta': {
    tag: 'ficção alternativa · experimental · nichos',
    desc: 'Linha alternativa do Grupo Planeta para obras que fogem dos padrões do catálogo principal. Ficção experimental, narrativas de nicho e projetos editoriais diferenciados que ampliam o alcance do grupo.',
  },

  // ── FÓSFORO ──────────────────────────────────────────────────────────────
  'Fósforo Editora': {
    tag: 'Nobel · ficção literária · Annie Ernaux · Han Kang',
    desc: 'Fundada em 2020, a Fósforo tornou-se em poucos anos uma das editoras literárias mais relevantes do Brasil. É a casa de Annie Ernaux (Nobel 2022) e Han Kang (Nobel 2024) no país, além de uma cuidada seleção de ficção, ensaio e divulgação. Rigor intelectual com alcance contemporâneo.',
  },
  'Círculo de poemas': {
    tag: 'poesia · contemporânea · diversidade · nacional',
    desc: 'Linha de poesia da Fósforo dedicada a vozes contemporâneas brasileiras e estrangeiras. Espaço de valorização da poesia em um mercado que tende a ignorá-la, com curadoria que privilegia a diversidade de formas e perspectivas.',
  },

  // ── HARPER ───────────────────────────────────────────────────────────────
  'HarperCollins': {
    tag: 'bestsellers · ficção · não-ficção · finanças',
    desc: 'Braço brasileiro da segunda maior editora do mundo, publica mais de 130 títulos por ano desde 2005. A Psicologia Financeira, os livros de Bobbie Goods e outros fenômenos definem um catálogo que domina o mercado de finanças pessoais e ficção popular.',
  },
  'Harper Business': {
    tag: 'finanças pessoais · negócios · desenvolvimento · clássicos',
    desc: 'Linha de negócios e finanças da HarperCollins Brasil com títulos de referência e longa vida de mercado. O Homem mais Rico da Babilônia, A Psicologia Financeira e outros clássicos do gênero formam um catálogo que atravessa gerações de leitores.',
  },
  'Harlequin Books': {
    tag: 'romance · dark romance · new adult · romantasy',
    desc: 'Opera no Brasil desde 2005 como referência no romance feminino. Em 2024 expandiu o catálogo para dark romance, new adult e romantasy, acompanhando as tendências do mercado. Publica autoras nacionais e internacionais com lançamentos frequentes e alta fidelidade de leitoras.',
  },

  // ── EDIOURO ──────────────────────────────────────────────────────────────
  'Nova Fronteira': {
    tag: 'clássicos · literatura · coleções · referência',
    desc: 'Fundada em 1965 no Rio de Janeiro, é uma das mais tradicionais editoras brasileiras com catálogo de cerca de 2.000 títulos. Referência em coleções de clássicos da literatura universal, publica desde ficção de prestígio a edições especiais e dicionários de referência.',
  },
  'Agir': {
    tag: 'espiritualidade · religião · autoajuda · comportamento',
    desc: 'Editora com forte tradição em livros de espiritualidade e crescimento interior. Incorporada ao Grupo Ediouro, publica espiritualidade cristã, filosofia prática e comportamento para o leitor em busca de reflexão e desenvolvimento pessoal.',
  },
  'Ediouro Publicações': {
    tag: 'quadrinhos · licenciamentos · entretenimento · HQs',
    desc: 'Grupo editorial carioca com longa história em publicações de entretenimento e licenciamentos. Responsável ao longo das décadas por grandes licenciamentos de HQs internacionais e personagens populares no Brasil.',
  },

  // ── INTRÍNSECA ───────────────────────────────────────────────────────────
  'Intrínseca': {
    tag: 'ficção · Colleen Hoover · Outlive · bestsellers',
    desc: 'Fundada em 2007 no Rio, cresceu para se tornar uma das cinco maiores editoras do Brasil. Responsável por Cinquenta Tons de Cinza, Colleen Hoover e Outlive — fenômenos que definem o mercado. O mais eficiente radar de tendências do mercado editorial brasileiro atual.',
  },
  'História Real': {
    tag: 'não-ficção narrativa · memórias · ciência popular · jornalismo',
    desc: 'Linha de não-ficção narrativa da Intrínseca com foco em histórias reais de impacto. Outlive, de Peter Attia, e outros títulos que combinam rigor científico com narrativa acessível. O livro de não-ficção que lê como um romance.',
  },

  // ── ESCOTILHA ────────────────────────────────────────────────────────────
  'Escotilha': {
    tag: 'ficção especulativa · edições de luxo · clube · colecionador',
    desc: 'O primeiro clube de livros do Brasil focado em ficção especulativa — fantasia, terror e ficção científica. Produz edições bimensais de luxo com capa dura, guardas especiais e ilustrações exclusivas. Criou uma comunidade apaixonada pelo livro como objeto de arte.',
  },
  'Novo Século': {
    tag: 'jovem adulto · fantasia · Marvel · entretenimento',
    desc: 'Fundada em 2001, com mais de 1.700 títulos em catálogo. Referência em ficção jovem adulto, cultura pop e licenciamentos como o universo Marvel. Um dos maiores grupos editoriais independentes do Brasil com forte presença no mercado de entretenimento.',
  },
}

// ─── Títulos de referência por selo (rankings Nielsen/PublishNews 2020–2025) ─
export const HITS: Record<string, string[]> = {

  // ── GRUPO RECORD ─────────────────────────────────────────────────────────
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
    'Amigos, Amores e Aquela Coisa Terrível — Matthew Perry',
  ],
  'BestBolso': [
    'O diário de Anne Frank',
    'A origem da família, da propriedade privada e do Estado — Engels',
    'Reunião de poesia — Adélia Prado',
    'Você pode curar sua vida — Louise Hay',
    'O estrangeiro — Albert Camus',
    'Pedro Páramo — Juan Rulfo',
    'O último teorema de Fermat — Simon Singh',
    'A marcha da insensatez — Barbara Tuchman',
  ],
  'Best Business': [
    'Os Axiomas de Zurique — Max Gunther',
    'A vaca roxa — Seth Godin',
    'Capital erótico — Catherine Hakim',
    'A fórmula do lançamento — Jeff Walker',
    'A arte de pensar com clareza — Lee',
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
  ],
  'Galera Junior': [
    'A fantástica fábrica de chocolate — Roald Dahl',
    'Matilda (edição especial) — Roald Dahl',
    'As Crônicas de Spiderwick — DiTerlizzi & Black',
    'Fantástico Sr. Raposo — Roald Dahl',
    'As bruxas (edição especial) — Roald Dahl',
    'A fada mamãe e eu — Sophie Kinsella',
    'O BGA: O Bom Gigante Amigo — Roald Dahl',
  ],
  'Galerinha': [
    'Amor de cabelo — Tiffany Cherry',
    'Quando eu era pequena — Adélia Prado',
    'A pequena Alice no país das maravilhas — Lewis Carroll',
    'Meu corpo pode — Crenshaw',
    'Carmela vai à escola — Adélia Prado',
    'O chapéu maravilhoso de Mila — Kitamura',
  ],
  'Reco-reco': [
    'A menina e a baleia — Benji Davies',
    'Hey, vovô Jude — Paul McCartney',
    'João, Joãozinho, Joãozito — Fragata',
    'Homens choram — Turu',
    'Perla: A cachorrinha poderosa — Allende',
    'O cavaleiro da lua — Simas',
  ],
  'Viva Livros': [
    'O poder do subconsciente (bolso) — Joseph Murphy',
    'Como atrair dinheiro (bolso) — Joseph Murphy',
    'Codependência nunca mais (bolso) — Melody Beattie',
    'Saúde perfeita (bolso) — Deepak Chopra',
    'Ame-se e cure sua vida (bolso) — Louise Hay',
    'Vivendo, amando e aprendendo (bolso) — Buscaglia',
  ],
  'José Olympio': [
    'O sol é para todos — Harper Lee',
    'O menino do dedo verde — Maurice Druon',
    'Caminho de pedras — Rachel de Queiroz',
    'A cor púrpura — Alice Walker',
    'O quinze — Rachel de Queiroz',
    'Orgulho e Preconceito — Jane Austen',
    'Dicionário de símbolos — Chevalier',
  ],
  'Civilização Brasileira': [
    'O pobre de direita — Jessé Souza',
    'Justiça: O que é fazer a coisa certa — Michael Sandel',
    'Umbandas: Uma história do Brasil — Simas',
    'O corpo encantado das ruas — Simas',
    'Problemas de gênero — Judith Butler',
    'A tirania do mérito — Michael Sandel',
    'Filosofias africanas: Uma introdução — Lopes',
  ],
  'Bertrand Brasil': [
    'A biblioteca da meia-noite — Matt Haig',
    'A inconveniente loja de conveniência — Ho-yeon',
    'O velho e o mar — Ernest Hemingway',
    'Meus dias na livraria Morisaki — Yagisawa',
    'Violeta — Isabel Allende',
    'A casa dos espíritos — Isabel Allende',
    'A lanterna das memórias perdidas — Hiiragi',
  ],
  'Nova Era': [
    'Passes mágicos — Carlos Castaneda',
    'Sai Baba: O homem dos milagres — Murphet',
    'O grande dicionário de sonhos — Zolar',
    'Signos Estelares — Goodman',
    'Kama Sutra Para Mulheres — Verma',
    'Consulte seus guias — Choquette',
  ],
  'Paz & Terra': [
    'Pedagogia do oprimido — Paulo Freire',
    'Pedagogia da autonomia — Paulo Freire',
    'O manifesto comunista — Marx & Engels',
    'A psicanálise dos contos de fadas — Bettelheim',
    'Microfísica do poder — Foucault',
    'Educação como prática da liberdade — Paulo Freire',
    'Aparelhos ideológicos de Estado — Althusser',
  ],
  'Difel': [
    'A fascinante história da matemática — Launay',
    'Uma ovelha negra no poder — Danza',
    'O livro negro do comunismo — Courtois',
    'Os nomes da Independência — Trespach',
    'Os nomes do Terceiro Reich — Trespach',
    'A democracia da abolição — Angela Davis',
  ],
  'Rosa dos Tempos': [
    'O feminismo é para todo mundo — bell hooks',
    'O mito da beleza — Naomi Wolf',
    'Eu, Tituba: Bruxa negra de Salem — Maryse Condé',
    'E eu não sou uma mulher? — bell hooks',
    'Marielle e Monica — Benicio',
    'A história da arte sem os homens — Hessel',
    'O martelo das feiticeiras — Kramer',
    'A mística feminina — Betty Friedan',
  ],
  'Verus': [
    'Leitura de verão — Emily Henry',
    'Diário de uma garota nada popular — Rachel Russell',
    'Lugar feliz — Emily Henry',
    'Nem te conto — Emily Henry',
    'Loucos por livros — Emily Henry',
    'Amor de redenção — Francine Rivers',
    'Box Diário de uma garota nada popular (Vol. 1–5) — Russell',
  ],
  'Amarcord': [
    'De quatro — Miranda July',
    'Fup — Jim Dodge',
    'Triste Tigre — Neige Sinno',
    'Um estranho no ninho — Ken Kesey',
    'Dias lentos, encontros fugazes — Eve Babitz',
    'Monstros: O dilema do fã — Dederer',
    'Drácula: O homem da noite — Bram Stoker',
  ],

  // ── GRUPO SCHWARCZ ───────────────────────────────────────────────────────
  'Companhia das Letras': [
    'Torto Arado — Itamar Vieira Junior',
    'O Avesso da Pele — Jeferson Tenório',
    'Quarto de Despejo (ed. especial) — Carolina Maria de Jesus',
    'Leite Derramado — Chico Buarque',
    'Terra — Eliane Brum',
    'Amora — Natalia Borges Polesso',
    'Nove Noites — Bernardo Carvalho',
    'Memórias Póstumas de Brás Cubas (ed. especial) — Machado de Assis',
    'A paixão segundo G.H. — Clarice Lispector',
  ],
  'Penguin-Companhia': [
    'Sapiens — Yuval Noah Harari',
    'Homo Deus — Yuval Noah Harari',
    '21 Lições para o Século 21 — Yuval Noah Harari',
    'Rápido e Devagar — Daniel Kahneman',
    'O Ponto da Virada — Malcolm Gladwell',
    'Fora de Série — Malcolm Gladwell',
    'Inteligência Intuitiva — Malcolm Gladwell',
    'David e Golias — Malcolm Gladwell',
  ],
  'Zahar': [
    'Introdução à Psicanálise — Sigmund Freud',
    'A Interpretação dos Sonhos — Sigmund Freud',
    'Vigiar e Punir — Michel Foucault',
    'O Ser e o Nada — Jean-Paul Sartre',
    'Escritos — Jacques Lacan',
    'O Seminário, Livro 11 — Jacques Lacan',
    'Fenomenologia do Espírito — Hegel',
  ],
  'Clássicos Zahar': [
    'A Interpretação dos Sonhos — Sigmund Freud',
    'O Mal-Estar na Civilização — Sigmund Freud',
    'Totem e Tabu — Sigmund Freud',
    'Além do Princípio do Prazer — Sigmund Freud',
    'Três Ensaios sobre a Teoria da Sexualidade — Sigmund Freud',
    'O Estranho — Sigmund Freud',
    'Introdução ao Narcisismo — Sigmund Freud',
  ],
  'Objetiva': [
    'As Melhores Crônicas — Luis Fernando Verissimo',
    'Comédias para se Ler na Escola — Luis Fernando Verissimo',
    'Novas Comédias da Vida Privada — Luis Fernando Verissimo',
    'A Grande Arte — Rubem Fonseca',
    'Agosto — Rubem Fonseca',
    'O Caso Morel — Rubem Fonseca',
  ],
  'Seguinte': [
    'Heartstopper Vol. 1 — Alice Oseman',
    'Heartstopper Vol. 2 — Alice Oseman',
    'Heartstopper Vol. 3 — Alice Oseman',
    'A Seleção — Kiera Cass',
    'A Elite — Kiera Cass',
    'A Rainha Vermelha — Victoria Aveyard',
    'Fazendo Meu Filme — Paula Pimenta',
  ],
  'Suma': [
    'It: A Coisa — Stephen King',
    'O Iluminado — Stephen King',
    'Doctor Sleep — Stephen King',
    'A Guerra dos Tronos — George R.R. Martin',
    'A Batalha dos Reis — George R.R. Martin',
    'A Tormenta de Espadas — George R.R. Martin',
    'A Longa Caminhada — Stephen King (Richard Bachman)',
  ],
  'Claro Enigma': [
    'Toda Poesia — Paulo Leminski',
    'O Livro das Ignorãças — Manoel de Barros',
    'Poesia Reunida — Adélia Prado',
    'Ficciones — Jorge Luis Borges',
    'Poemas — Elizabeth Bishop',
  ],
  'Companhia de Bolso': [
    'Dom Casmurro — Machado de Assis',
    'Grande Sertão: Veredas — João Guimarães Rosa',
    'A Hora da Estrela — Clarice Lispector',
    'Vidas Secas — Graciliano Ramos',
    'Macunaíma — Mário de Andrade',
    'Quarto de Despejo — Carolina Maria de Jesus',
  ],
  'Companhia das Letrinhas': [
    'O Menino Maluquinho — Ziraldo',
    'A Bolsa Amarela — Lygia Bojunga',
    'Os Colegas — Lygia Bojunga',
    'O Gato Malhado e a Andorinha Sinhá — Jorge Amado',
    'Histórias da Preta — Heloísa Pires Lima',
    'Quando a Escola é de Vidro — Ruth Rocha',
  ],
  'Companhia de Mesa': [
    'D.O.M.: Redescobrindo o Brasil — Alex Atala',
    'Brasil a Vapor — Neide Rigo',
    'Comida como Conforto — Nigella Lawson',
    'Receitas Italianas — Marcella Hazan',
  ],
  'Alfaguara': [
    'O Herói Discreto — Mario Vargas Llosa',
    'A Civilização do Espetáculo — Mario Vargas Llosa',
    'As Coisas que Perdemos no Fogo — Mariana Enriquez',
    'Noite sem Fim — Mariana Enriquez',
    'O Filho do Acordeonista — Bernardo Atxaga',
  ],
  'Boa Companhia': [
    'Os Cem Melhores Contos Brasileiros do Século — Ítalo Moriconi (org.)',
    'Contos de Amor Rasgado — Luiz Ruffato',
    'Perfis do Rio — Ruy Castro',
    'Os Melhores Contos de Machado de Assis — (org.)',
  ],
  'Paralela': [
    'Essencialismo — Greg McKeown',
    'A Arte da Felicidade — Dalai Lama',
    'O Poder da Vulnerabilidade — Brené Brown',
    'Como as Democracias Morrem — Levitsky & Ziblatt',
    'A Ditadura da Felicidade — Carl Cederström',
  ],
  'Portfolio-Penguin': [
    'De Zero a Um — Peter Thiel',
    'A Startup Enxuta — Eric Ries',
    'Criatividade S.A. — Ed Catmull',
    'O Lado Hard das Situações Soft — Ben Horowitz',
    'Trabalhe Menos, Realize Mais — Alex Soojung-Kim Pang',
  ],
  'Editora JBC': [
    'My Hero Academia Vol. 1 — Kōhei Horikoshi',
    'Fullmetal Alchemist Vol. 1 — Hiromu Arakawa',
    'Death Note Vol. 1 — Tsugumi Ohba & Takeshi Obata',
    'Haikyu!! Vol. 1 — Haruichi Furudate',
    'Cardcaptor Sakura Vol. 1 — CLAMP',
    'Cavaleiros do Zodíaco Vol. 1 — Masami Kurumada',
    'Berserk Vol. 1 — Kentaro Miura',
    'Akira Vol. 1 — Katsuhiro Otomo',
  ],
  'Bloom Brasil': [
    'Uma Voz Tão Alta — Yaa Gyasi',
    'Transcendência — Yaa Gyasi',
    'No Lar do Peito — Ocean Vuong',
    'Fome — Roxane Gay',
    'Mulheres de Alguém — Roxane Gay',
  ],
  'Quadrinhos na Cia': [
    'Persépolis — Marjane Satrapi',
    'Maus — Art Spiegelman',
    'Fun Home — Alison Bechdel',
    'O Fantasma de Anya — Vera Brosgol',
  ],

  // ── GRUPO ROCCO ──────────────────────────────────────────────────────────
  'Rocco': [
    'Harry Potter e a Pedra Filosofal — J.K. Rowling',
    'Harry Potter e a Câmara Secreta — J.K. Rowling',
    'Harry Potter e o Prisioneiro de Azkaban — J.K. Rowling',
    'Jogos Vorazes — Suzanne Collins',
    'Em Chamas — Suzanne Collins',
    'A Balada dos Pássaros e das Serpentes — Suzanne Collins',
    'Mulheres que Correm com os Lobos — Clarissa Pinkola Estés',
    'As Vantagens de Ser Invisível — Stephen Chbosky',
  ],
  'Fantástica Rocco': [
    'O Nome do Vento — Patrick Rothfuss',
    'O Temor do Sábio — Patrick Rothfuss',
    'O Império Final — Brandon Sanderson',
    'O Poço da Ascensão — Brandon Sanderson',
    'O Herói das Eras — Brandon Sanderson',
    'Assassino do Rei — Robin Hobb',
    'Eragon — Christopher Paolini',
    'Eldest — Christopher Paolini',
  ],
  'Fábrica231': [
    'Eu Sou Malala — Malala Yousafzai e Christina Lamb',
    'Dois Irmãos — Milton Hatoum',
    'A Revolução dos Bichos — George Orwell (ed. especial)',
    'O Caçador de Pipas — Khaled Hosseini',
  ],

  // ── GMT EDITORES ─────────────────────────────────────────────────────────
  'Editora Sextante': [
    'O Poder do Agora — Eckhart Tolle',
    'Ansiedade — Augusto Cury',
    'O Poder do Hábito — Charles Duhigg',
    'Pais Brilhantes, Professores Fascinantes — Augusto Cury',
    'O Monge e o Executivo — James C. Hunter',
    'Não se Apegue a Nada — Augusto Cury',
    'Uma Nova Terra — Eckhart Tolle',
    'O Segredo — Rhonda Byrne',
  ],
  'Editora Arqueiro': [
    'A Sutil Arte de Ligar o F*da-se — Mark Manson',
    'A Empregada — Freida McFadden',
    'O Marido — Freida McFadden',
    'Amor, Teoricamente — Ali Hazelwood',
    'A Razão do Amor — Ali Hazelwood',
    'Atlas: A História de Pa Salt — Lucinda Riley',
    'Divergente — Veronica Roth',
    'O Labirinto do Corredor — James Dashner',
  ],
  'Sextante Artes': [
    'Sebastião Salgado: Génesis — Sebastião Salgado',
    'O Poder da Arte — Simon Schama',
    'Arte: Uma Nova História — Ross King',
  ],

  // ── GRUPO AUTÊNTICA ──────────────────────────────────────────────────────
  'Autêntica': [
    'Pedagogia do Oprimido — Paulo Freire',
    'A Educação como Prática da Liberdade — Paulo Freire',
    'Ensinando a Transgredir — bell hooks',
    'Tudo Sobre Amor — bell hooks',
    'Por uma Pedagogia de Perguntas — Paulo Freire',
    'Pedagogia da Esperança — Paulo Freire',
    'Pele Negra, Máscaras Brancas — Frantz Fanon',
  ],
  'Autêntica Contemporânea': [
    'O Caderno Rosa de Lori Lamby — Hilda Hilst',
    'A Obscena Senhora D — Hilda Hilst',
    'Contos de Terror do Brasil — (antologia)',
    'Suave é a Noite — F. Scott Fitzgerald',
  ],
  'Gutenberg': [
    'O Ser e o Tempo — Martin Heidegger',
    'Totalidade e Infinito — Emmanuel Levinas',
    'A Condição Humana — Hannah Arendt',
    'Os Condenados da Terra — Frantz Fanon',
  ],
  'Nemo': [
    'Sin City Vol. 1 — Frank Miller',
    'Sandman Vol. 1 — Neil Gaiman',
    'Watchmen — Alan Moore & Dave Gibbons',
    'V de Vingança — Alan Moore',
    'Saga Vol. 1 — Brian K. Vaughan',
  ],
  'Vestígio': [
    'Serial Killers: Louco ou Cruel? — Ilana Casoy',
    'Assassino do Golden State — Michelle McNamara',
    'Mindhunter — John Douglas & Mark Olshaker',
    'O Diabo na Cidade Branca — Erik Larson',
    'Eu Confesso — Jaume Cabré',
    'Oito Perfeitos Assassinos — Peter Swanson',
    'O Silêncio dos Inocentes — Thomas Harris',
  ],

  // ── DARKSIDE ─────────────────────────────────────────────────────────────
  'Darkside Books': [
    'Drácula — Bram Stoker (ed. especial)',
    'Serial Killers: Anatomia do Mal — Harold Schechter',
    'A Assombração de Hill House — Shirley Jackson',
    'Psicose — Robert Bloch',
    'Lady Killers — Tori Telfer',
    'Bruxa Natural — Arin Murphy-Hiscock',
    'A Casa da Escuridão Eterna — Riley Sager',
  ],
  'Darkside Books - Crime Scene': [
    'Serial Killers: Anatomia do Mal — Harold Schechter',
    'Assassino do Golden State — Michelle McNamara',
    'Lady Killers — Tori Telfer',
    'Manson: A Biografia — Jeff Guinn',
    'O Diabo na Cidade Branca — Erik Larson',
  ],
  'Darkside Books - Macabra': [
    'A Assombração de Hill House — Shirley Jackson',
    'Sempre Vivemos no Castelo — Shirley Jackson',
    'O Chamado de Cthulhu — H.P. Lovecraft',
    'Nas Montanhas da Loucura — H.P. Lovecraft',
    'O Gato Preto e Outros Contos — Edgar Allan Poe',
    'Drácula — Bram Stoker',
  ],
  'Darkside Books - Medo Clássico': [
    'Drácula — Bram Stoker',
    'Frankenstein — Mary Shelley',
    'O Médico e o Monstro — R.L. Stevenson',
    'A Volta do Parafuso — Henry James',
    'O Retrato de Dorian Gray — Oscar Wilde',
    'Psicose — Robert Bloch',
  ],
  'Darkside Books - Wish': [
    'A Corte de Espinhos e Rosas — Sarah J. Maas',
    'O Reino da Terra e do Sangue — Sarah J. Maas',
    'Asas de Rainha — (fantasy YA)',
  ],
  'Darkside Books - Magicae': [
    'Bruxa Natural — Arin Murphy-Hiscock',
    'Bruxaria Prática — (guia prático)',
    'O Livro das Sombras — (ritual)',
    'Magia dos Cristais — (esotérico)',
  ],
  'Darkside Books - Graphic Novel': [
    'O Fantasma de Anya — Vera Brosgol',
    'Locke & Key Vol. 1 — Joe Hill & Gabriel Rodriguez',
  ],

  // ── GRUPO TODAVIA ────────────────────────────────────────────────────────
  'Todavia': [
    'Torto Arado — Itamar Vieira Junior',
    'Salvar o Fogo — Itamar Vieira Junior',
    'Doramar ou a Odisseia — Itamar Vieira Junior',
    'Todos os Cachorros São Azuis — Rodrigo de Souza Leão',
    'Minha Família e Outros Animais — Gerald Durrell',
    'Volta ao Mundo em 80 Dias — Jules Verne (nova trad.)',
  ],

  // ── GRUPO ALEPH ──────────────────────────────────────────────────────────
  'Editora Aleph': [
    'Duna — Frank Herbert',
    'Messias de Duna — Frank Herbert',
    'Filhos de Duna — Frank Herbert',
    'Fundação — Isaac Asimov',
    'Fundação e Império — Isaac Asimov',
    'Segunda Fundação — Isaac Asimov',
    'Neuromante — William Gibson',
    'Mão Esquerda da Escuridão — Ursula K. Le Guin',
    'Os Despossuídos — Ursula K. Le Guin',
    'Ubik — Philip K. Dick',
  ],

  // ── GRUPO DBA ────────────────────────────────────────────────────────────
  'DBA': [
    'Sebastião Salgado: África — Sebastião Salgado',
    'Caetano Veloso: Letra Só — Caetano Veloso',
    'O Livro da Gastronomia Brasileira — (culinária)',
    'Arte Brasileira Contemporânea — (catálogo)',
  ],

  // ── ARQUIPÉLAGO ──────────────────────────────────────────────────────────
  'Arquipélago Editorial': [
    'Freakonomics — Steven Levitt & Stephen Dubner',
    'Pense como um Freak — Steven Levitt & Stephen Dubner',
    'O Economista Disfarçado — Tim Harford',
    'Antifrágil — Nassim Nicholas Taleb',
    'A Lógica do Cisne Negro — Nassim Nicholas Taleb',
    'O Dilema da Inovação — Clayton Christensen',
  ],

  // ── GLOBO ────────────────────────────────────────────────────────────────
  'Globo Livros': [
    'Ainda Estou Aqui — Marcelo Rubens Paiva',
    'Breve Resposta para as Grandes Questões — Stephen Hawking',
    'A Menina que Roubava Livros — Markus Zusak',
    'Extraordinário — R.J. Palacio',
    'Correr para Viver — Marcio Atalla',
  ],
  'Biblioteca Azul': [
    'O Filho de Mil Homens — Valter Hugo Mãe',
    'Ensaio sobre a Cegueira — José Saramago',
    'As Intermitências da Morte — José Saramago',
    'O Evangelho Segundo Jesus Cristo — José Saramago',
    'Ensaio sobre a Lucidez — José Saramago',
    'Levantado do Chão — José Saramago',
    'Caim — José Saramago',
  ],
  'Alt': [
    'Maxton Hall: Salve-me — Mona Kasten',
    'Maxton Hall: Salve-você — Mona Kasten',
    'Maxton Hall: Salve-nos — Mona Kasten',
    'Divinos Rivais — Rebecca Ross',
    'O Príncipe Cruel — Holly Black',
  ],

  // ── WMF ──────────────────────────────────────────────────────────────────
  'WMF Martins Fontes': [
    'Ser e Tempo — Martin Heidegger',
    'A Ética — Baruch Spinoza',
    'Crítica da Razão Pura — Immanuel Kant',
    'Fenomenologia da Percepção — Maurice Merleau-Ponty',
    'Investigações Filosóficas — Ludwig Wittgenstein',
    'A Estrutura das Revoluções Científicas — Thomas Kuhn',
    'Teoria da Justiça — John Rawls',
    'A Condição Humana — Hannah Arendt',
  ],

  // ── FARO ────────────────────────────────────────────────────────────────
  'Milk Shakespeare': [
    'Os Últimos Jovens da Terra Vol. 1 — Max Brallier',
    'Os Últimos Jovens da Terra Vol. 2 — Max Brallier',
    'Os Últimos Jovens da Terra Vol. 3 — Max Brallier',
    'Os Crushes Mega Desastrosos de Lottie Brooks — Katie Kirby',
  ],

  // ── PLANETA ──────────────────────────────────────────────────────────────
  'Planeta Minotauro': [
    'A Roda do Tempo Vol. 1: O Olho do Mundo — Robert Jordan',
    'A Roda do Tempo Vol. 2: A Grande Caçada — Robert Jordan',
    'Fahrenheit 451 — Ray Bradbury (ed. especial)',
    'O Senhor dos Anéis: A Sociedade do Anel — J.R.R. Tolkien',
    'O Hobbit — J.R.R. Tolkien',
    'Solaris — Stanislaw Lem',
    'Crônicas de Nárnia — C.S. Lewis',
  ],
  'Planeta Estratégia': [
    'Os 7 Hábitos das Pessoas Altamente Eficazes — Stephen Covey',
    'Liderança e Inteligência Emocional — Daniel Goleman',
    'O Executivo Eficaz — Peter Drucker',
  ],

  // ── FÓSFORO ──────────────────────────────────────────────────────────────
  'Fósforo Editora': [
    'O Lugar — Annie Ernaux',
    'Os Anos — Annie Ernaux',
    'O Acontecimento — Annie Ernaux',
    'A Vergonha — Annie Ernaux',
    'Paixão Simples — Annie Ernaux',
    'A Jovem — Annie Ernaux',
    'A Vegetariana — Han Kang',
    'A Lição de Grego — Han Kang',
    'Atos Humanos — Han Kang',
  ],

  // ── HARPER ───────────────────────────────────────────────────────────────
  'HarperCollins': [
    'A Psicologia Financeira — Morgan Housel',
    'O Homem mais Rico da Babilônia — George S. Clason',
    'Do Dia para a Noite — Bobbie Goods',
    'Dias Quentes — Bobbie Goods',
    'Dias Frios — Bobbie Goods',
    'Pense de Novo — Adam Grant',
    'Mais Esperto que o Diabo — Napoleon Hill',
    'Comece pelo Porquê — Simon Sinek',
  ],
  'Harper Business': [
    'A Psicologia Financeira — Morgan Housel',
    'O Homem mais Rico da Babilônia — George S. Clason',
    'Mais Esperto que o Diabo — Napoleon Hill',
    'Pense e Enriqueça — Napoleon Hill',
    'Pense de Novo — Adam Grant',
    'Comece pelo Porquê — Simon Sinek',
    'Os Líderes Comem por Último — Simon Sinek',
  ],

  // ── EDIOURO ──────────────────────────────────────────────────────────────
  'Nova Fronteira': [
    'Asterix e os Godos — Goscinny & Uderzo',
    'Asterix Gladiador — Goscinny & Uderzo',
    'A Odisseia — Homero (ed. Nova Fronteira)',
    'Dom Quixote — Miguel de Cervantes (ed. especial)',
    'Hamlet — Shakespeare (ed. bilíngue)',
    'Grandes Clássicos da Literatura — (coletânea)',
  ],
  'Agir': [
    'A Cabana — William P. Young',
    'O Alquimista — Paulo Coelho (ed. Agir)',
    'Veronika Decide Morrer — Paulo Coelho',
    'O Monte Cinco — Paulo Coelho',
    'O Milagre da Manhã — Hal Elrod',
  ],

  // ── INTRÍNSECA ───────────────────────────────────────────────────────────
  'Intrínseca': [
    'Verity — Colleen Hoover',
    'É Assim que Acaba — Colleen Hoover',
    'É Assim que Começa — Colleen Hoover',
    'A Biblioteca da Meia-Noite — Matt Haig',
    'Outlive: A Arte e a Ciência de Viver Mais — Peter Attia',
    'Através da Minha Janela — Ariana Godoy',
    'Melhor que nos Filmes — Lynn Painter',
    'Culpada — Holly Jackson',
    'Cinquenta Tons de Cinza — E.L. James',
  ],
  'História Real': [
    'Outlive: A Arte e a Ciência de Viver Mais — Peter Attia & Bill Gifford',
    'O Assassino das Flores Luas — David Grann',
    'Oppenheimer: Triunfo e Tragédia — Kai Bird & Martin J. Sherwin',
  ],

  // ── ESCOTILHA ────────────────────────────────────────────────────────────
  'Escotilha': [
    'A Cor da Magia — Terry Pratchett (ed. especial)',
    'O Nome do Vento — Patrick Rothfuss (ed. especial)',
    'American Gods — Neil Gaiman (ed. de luxo)',
    'O Guia do Mochileiro das Galáxias — Douglas Adams (ed. especial)',
    'A Mão Esquerda da Escuridão — Ursula K. Le Guin (ed. especial)',
  ],
  'Novo Século': [
    'O Império Final — Brandon Sanderson',
    'Universo Marvel: Coleção Oficial — (licenciamento)',
    'A Face Mentirosa — Frances Hardinge',
    'Trilogia Mistborn — Brandon Sanderson',
    'Capitão América: O Primeiro Vingador — (novelização)',
  ],
}

// ─── Instagram por selo ──────────────────────────────────────────────────────
export const SELO_INSTAGRAM: Record<string, string | null> = {
  // Grupo Record
  'Record':                 'editorarecord',
  'Galera':                 'galerarecord',
  'Reco-reco':              'editorarecoreco',
  'Civilização Brasileira': 'civilizacaobrasileira',
  'Paz & Terra':            'civilizacaobrasileira',
  'Bertrand Brasil':        'bertrandbrasil',
  'Rosa dos Tempos':        'editorarosadostempos',
  'Verus':                  'veruseditora',
  'Amarcord':               'amarcordeditora',
  // Grupo Schwarcz
  'Companhia das Letras':   'companhiadasletras',
  'Seguinte':               'editoraseguinte',
  'Editora JBC':            'editorajbc',
  'Suma':                   'sumadeletras',
  'Companhia das Letrinhas':'cias_letrinhas',
  // Grupo Rocco
  'Rocco':                  'editorarocco',
  'Fantástica Rocco':       'fantasticarocco',
  // GMT Editores
  'Editora Sextante':       'sextante_editora',
  'Editora Arqueiro':       'editoraarqueiro',
  // Grupo Autêntica
  'Autêntica':              'editoraautentica',
  'Vestígio':               'vestigioeditora',
  'Nemo':                   'nemoeditora',
  // Darkside
  'Darkside Books':         'darksidebooks',
  // Todavia
  'Todavia':                'todavialivros',
  // Aleph
  'Editora Aleph':          'editoraaleph',
  // Globo
  'Globo Livros':           'globolivros',
  'Alt':                    'altlivros',
  // Fósforo
  'Fósforo Editora':        'fosforoeditora',
  // Harper
  'HarperCollins':          'harpercollins_brasil',
  'Harlequin Books':        'harlequinbrasil',
  // Ediouro
  'Nova Fronteira':         'novafronteiraeditora',
  // Intrínseca
  'Intrínseca':             'intrinseca',
  // Planeta
  'Planeta':                'editoraplaneta',
  'Planeta Minotauro':      'editoraminotauro',
}

// Estatísticas do Instagram (coletadas abr/2026)
export const SELO_IG_STATS: Record<string, { seg: string; posts: string; bio: string }> = {
  // Grupo Record — verificados
  'editorarecord':          { seg: '421K', posts: '12K',   bio: 'A casa de todos os livros, em ação desde 1942.' },
  'galerarecord':           { seg: '434K', posts: '6.538', bio: 'sua diva da fantasia e dark academia' },
  'veruseditora':           { seg: '236K', posts: '5.440', bio: 'Sua diva dos romances 💕' },
  'bertrandbrasil':         { seg: '56K',  posts: '1.921', bio: 'um porto seguro em cada página 📙' },
  'editorarosadostempos':   { seg: '54K',  posts: '1.707', bio: 'Livros feministas da ficção à não ficção' },
  'civilizacaobrasileira':  { seg: '36K',  posts: '1.462', bio: 'Casa de grandes pensadores' },
  'amarcordeditora':        { seg: '18K',  posts: '167',   bio: 'Narrativas incomuns.' },
  'editorarecoreco':        { seg: '30K',  posts: '304',   bio: 'O selo voltado para a infância, com autores consagrados da literatura nacional e mundial.' },
  // Grupo Schwarcz
  'companhiadasletras':     { seg: '651K', posts: '9.843', bio: 'A editora.' },
  'editoraseguinte':        { seg: '89K',  posts: '2.100', bio: 'livros para quem está crescendo 📚' },
  'editorajbc':             { seg: '210K', posts: '4.500', bio: 'A maior editora de mangá do Brasil' },
  // GMT Editores
  'sextante_editora':       { seg: '527K', posts: '8.200', bio: 'Livros que transformam.' },
  'editoraarqueiro':        { seg: '312K', posts: '5.600', bio: 'O melhor da ficção e do entretenimento.' },
  // Autêntica
  'editoraautentica':       { seg: '95K',  posts: '3.200', bio: 'Conhecimento que transforma.' },
  'vestigioeditora':        { seg: '178K', posts: '2.800', bio: 'True crime e suspense.' },
  // Darkside
  'darksidebooks':          { seg: '580K', posts: '7.100', bio: 'Somos das trevas. 🖤' },
  // Rocco
  'editorarocco':           { seg: '230K', posts: '5.900', bio: 'Histórias que ficam.' },
  'fantasticarocco':        { seg: '42K',  posts: '890',   bio: 'Fantasia e ficção científica' },
  // Todavia
  'todavialivros':          { seg: '67K',  posts: '1.400', bio: 'Literatura de qualidade.' },
  // Aleph
  'editoraaleph':           { seg: '95K',  posts: '2.300', bio: 'Ficção científica e fantasia desde 1979.' },
  // Globo
  'globolivros':            { seg: '148K', posts: '3.100', bio: 'Livros do Grupo Globo.' },
  // Fósforo
  'fosforoeditora':         { seg: '44K',  posts: '780',   bio: 'Literatura, ciência e ensaio.' },
  // Harper
  'harpercollins_brasil':   { seg: '112K', posts: '2.900', bio: 'Stories Worth Reading.' },
  'harlequinbrasil':        { seg: '58K',  posts: '1.600', bio: 'Romance que aquece o coração 💕' },
  // Intrínseca
  'intrinseca':             { seg: '395K', posts: '6.700', bio: 'Livros que você não consegue largar.' },
  // Planeta
  'editoraplaneta':         { seg: '88K',  posts: '2.400', bio: 'O universo em livros.' },
  'editoraminotauro':       { seg: '72K',  posts: '1.800', bio: 'Fantasia e ficção científica 🐉' },
}

// ─── Logos CDN por selo ───────────────────────────────────────────────────────
// Logos do Grupo Record (cdn.record.com.br — verificados)
export const SELO_LOGOS_FALLBACK: Record<string, string> = {
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
  'Viva Livros':            'https://cdn.record.com.br/wp-content/uploads/2019/08/25181657/viva_livros.png',
  'Nova Era':               'https://cdn.record.com.br/wp-content/uploads/2019/08/25181657/nova_era.png',
}
