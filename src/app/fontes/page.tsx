import {
  Lora,
  Playfair_Display,
  EB_Garamond,
  Merriweather,
  Source_Serif_4,
  Libre_Baskerville,
  Crimson_Text,
  Cormorant_Garamond,
  Spectral,
  PT_Serif,
} from 'next/font/google'

const fLora         = Lora({ subsets: ['latin'], weight: ['400','500'], variable: '--f-lora', display: 'swap' })
const fPlayfair     = Playfair_Display({ subsets: ['latin'], weight: ['400','500'], variable: '--f-playfair', display: 'swap' })
const fGaramond     = EB_Garamond({ subsets: ['latin'], weight: ['400','500'], variable: '--f-garamond', display: 'swap' })
const fMerriweather = Merriweather({ subsets: ['latin'], weight: ['300','400'], variable: '--f-merriweather', display: 'swap' })
const fSource       = Source_Serif_4({ subsets: ['latin'], weight: ['400','500'], variable: '--f-source', display: 'swap' })
const fBaskerville  = Libre_Baskerville({ subsets: ['latin'], weight: ['400'], variable: '--f-baskerville', display: 'swap' })
const fCrimson      = Crimson_Text({ subsets: ['latin'], weight: ['400','600'], variable: '--f-crimson', display: 'swap' })
const fCormorant    = Cormorant_Garamond({ subsets: ['latin'], weight: ['400','500'], variable: '--f-cormorant', display: 'swap' })
const fSpectral     = Spectral({ subsets: ['latin'], weight: ['400','500'], variable: '--f-spectral', display: 'swap' })
const fPtSerif      = PT_Serif({ subsets: ['latin'], weight: ['400'], variable: '--f-ptserif', display: 'swap' })

const FONTES = [
  { nome: 'Lora',               variavel: '--f-lora',         font: fLora },
  { nome: 'Playfair Display',   variavel: '--f-playfair',     font: fPlayfair },
  { nome: 'EB Garamond',        variavel: '--f-garamond',     font: fGaramond },
  { nome: 'Merriweather',       variavel: '--f-merriweather', font: fMerriweather },
  { nome: 'Source Serif 4',     variavel: '--f-source',       font: fSource },
  { nome: 'Libre Baskerville',  variavel: '--f-baskerville',  font: fBaskerville },
  { nome: 'Crimson Text',       variavel: '--f-crimson',      font: fCrimson },
  { nome: 'Cormorant Garamond', variavel: '--f-cormorant',    font: fCormorant },
  { nome: 'Spectral',           variavel: '--f-spectral',     font: fSpectral },
  { nome: 'PT Serif',           variavel: '--f-ptserif',      font: fPtSerif },
]

const LIVRO = {
  titulo: 'Dias Perfeitos',
  autor: 'Montes, Raphael',
  editora: 'Companhia das Letras',
  isbn: '9788535928938',
  sinopse: `Teo é um jovem médico-legista solitário que vive uma rotina monótona até o dia em que se apaixona perdidamente por Clarice, uma estudante de direito cheia de vida. Quando ela não corresponde ao seu amor, ele decide fazer o impensável: sequestra-a e a mantém presa em sua casa, determinado a conquistá-la a qualquer custo.

Com uma narrativa perturbadora e ao mesmo tempo hipnótica, Raphael Montes constrói um thriller psicológico que questiona os limites entre obsessão e amor, entre liberdade e prisão, entre o bem e o mal que existe em cada um de nós.`,
}

const allVars = FONTES.map(f => f.font.variable).join(' ')

export default function FontesPage() {
  return (
    <div className={allVars} style={{ background: '#f8f6f0', minHeight: '100vh', padding: '48px 32px' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '1.1rem', fontWeight: 400, color: '#888', letterSpacing: '0.06em' }}>
          livros<span style={{ color: '#fbf236' }}>.</span>wiki · teste de fontes serifadas
        </h1>
        <p style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '0.78rem', color: '#aaa', marginTop: 6 }}>
          mesmo conteúdo · 10 fontes · comparação lado a lado
        </p>
      </div>

      <div style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 32, alignItems: 'flex-start' }}>
        {FONTES.map(({ nome, variavel }) => (
          <div key={nome} style={{
            minWidth: 260,
            maxWidth: 260,
            background: '#fff',
            borderRadius: 8,
            border: '1px solid #e0dbd0',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            {/* Label da fonte */}
            <div style={{
              background: '#f0ece4',
              padding: '8px 14px',
              fontFamily: 'var(--font-sans), sans-serif',
              fontSize: '0.68rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#888',
              borderBottom: '1px solid #e0dbd0',
            }}>
              {nome}
            </div>

            {/* Capa + info */}
            <div style={{ padding: '16px 16px 0', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/cover/${LIVRO.isbn}?size=s`}
                alt={LIVRO.titulo}
                style={{ width: 60, flexShrink: 0, height: 'auto', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
              />
              <div>
                <div style={{
                  fontFamily: 'var(--font-sans), sans-serif',
                  fontSize: '1rem',
                  lineHeight: 1.35,
                  color: '#24211c',
                  marginBottom: 4,
                }}>
                  {LIVRO.titulo}
                </div>
                <div style={{
                  fontFamily: 'var(--font-sans), sans-serif',
                  fontSize: '0.78rem',
                  color: '#888',
                }}>
                  {LIVRO.autor}
                </div>
                <div style={{
                  fontFamily: 'var(--font-sans), sans-serif',
                  fontSize: '0.68rem',
                  color: '#bbb',
                  marginTop: 4,
                }}>
                  {LIVRO.editora}
                </div>
              </div>
            </div>

            {/* Sinopse */}
            <div style={{ padding: '14px 16px 20px' }}>
              <div style={{
                fontFamily: 'var(--font-sans), sans-serif',
                fontSize: '0.6rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#bbb',
                marginBottom: 8,
              }}>
                sinopse
              </div>
              {LIVRO.sinopse.split('\n').filter(Boolean).map((p, i) => (
                <p key={i} style={{
                  fontFamily: `var(${variavel}), Georgia, serif`,
                  fontSize: '0.82rem',
                  lineHeight: 1.75,
                  color: '#444',
                  marginBottom: 10,
                }}>
                  {p}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
