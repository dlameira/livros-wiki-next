export default function PessoaPage({ params }: { params: { slug: string } }) {
  return <div>Pessoa: {params.slug}</div>
}
