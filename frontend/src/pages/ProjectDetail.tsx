import { useParams } from 'react-router'

export function ProjectDetail() {
  const { slug } = useParams()
  return <h1>{slug}</h1>
}
