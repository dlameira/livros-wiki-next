import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'livros.wiki',
  description: 'livros sem algoritmos — catálogo editorial brasileiro',
  icons: { icon: '/liki.png', apple: '/liki.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="light">
      <body>{children}</body>
    </html>
  )
}
