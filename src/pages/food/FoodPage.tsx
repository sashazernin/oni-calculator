import PlanetoidGate from "../../components/planetoid/PlanetoidGate";
import PlanetoidPickTypeIntroWithLink from "../../components/planetoid/PlanetoidPickTypeIntroWithLink";
import { useAppSettings } from "../../providers/app-settings-provider";
import Food from "./Food";

export default function FoodPage() {
  const { data } = useAppSettings();

  if (data.mixedMode) {
    return <Food />;
  }

  return (
    <PlanetoidGate pickerTitle={<PlanetoidPickTypeIntroWithLink />}>
      <Food />
    </PlanetoidGate>
  );
}
