import type { IDuplicate } from "../../../../types/game-data-types";

export default function DupeCard({ duplicate }: { duplicate: IDuplicate }) {
  return (
    <div>
      <h1>{duplicate.name}</h1>
      <p>{duplicate.gluttonous ? 'Gluttonous' : 'Not gluttonous'}</p>
    </div>
  )
}