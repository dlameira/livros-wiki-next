import type { Metadata } from 'next'
import { IBM_Plex_Sans, Lora } from 'next/font/google'
import './globals.css'

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'livros.wiki',
  description: 'livros sem algoritmos — catálogo editorial brasileiro',
  icons: { icon: '/liki.png', apple: '/liki.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`light ${ibmPlexSans.variable} ${lora.variable}`}>
      <body>{children}</body>
    </html>
  )
}
