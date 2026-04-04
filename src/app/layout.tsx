import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'livros.wiki',
  description: 'livros sem algoritmos — catálogo editorial brasileiro',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
