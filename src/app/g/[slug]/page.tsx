export default function GrupoPage({ params }: { params: { slug: string } }) {
  return <div>Grupo editorial: {params.slug}</div>
}
