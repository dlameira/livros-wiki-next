import type { Metadata } from 'next'
import { Montserrat, Merriweather } from 'next/font/google'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
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
    <html lang="pt-BR" className={`light ${montserrat.variable} ${merriweather.variable}`}>
      <body>{children}</body>
    </html>
  )
}
