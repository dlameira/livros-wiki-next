export default function LivroPage({ params }: { params: { slug: string } }) {
  return <div>Livro: {params.slug}</div>
}
