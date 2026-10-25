import PlanetoidGate from "../../components/planetoid/PlanetoidGate";
import PlanetoidPickTypeIntroWithLink from "../../components/planetoid/PlanetoidPickTypeIntroWithLink";
import { useEffectivePlanetoidGameType } from "../../components/planetoid/planetoid-gate-context";
import Rocket from "./rocket";
import ClassicRocket from "./ClassicRocket";

function RocketPageContent() {
  const gameType = useEffectivePlanetoidGameType();
  if (gameType === "classic") return <ClassicRocket />;
  return <Rocket />;
}

export default function RocketPage() {
  return (
    <PlanetoidGate pickerTitle={<PlanetoidPickTypeIntroWithLink />}>
      <RocketPageContent />
    </PlanetoidGate>
  );
}
