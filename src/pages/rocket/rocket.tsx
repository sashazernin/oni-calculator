import { useMemo, useState } from "react";
import Box from "../../components/box/box";
import { HexMapPopup, type HexMapObjectItem } from "../../components/hex-map/HexMap";
import { Button } from "../../components/button/Button";
import RocketBuilder, { type PlacedRocketModule } from "../../components/rocket/Rocket";
import { rocketEngines, type RocketEngineId } from "../../game-data/rocket";
import { useTranslation } from "../../hooks/useTranslation";
import { readStoredStarMapObjects } from "../../helpers/readStoredStarMapObjects";

const allEngineIds = Object.keys(rocketEngines) as RocketEngineId[];

export default function Rocket() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const [objects] = useState<HexMapObjectItem[]>(readStoredStarMapObjects);
  const [way, setWay] = useState<number[] | null>(null);
  const [engineId, setEngineId] = useState<RocketEngineId | null>(null);
  const [stackModules, setStackModules] = useState<PlacedRocketModule[]>([]);
  const engineIds = useMemo(() => allEngineIds, []);

  const handleEngineChange = (id: RocketEngineId | null) => {
    setEngineId(id);
    if (id === null) setStackModules([]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "row", gap: 16, flex: 1 }}>
      <Box
        style={{ width: "70%", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}
      >
        <RocketBuilder
          availableEngineIds={engineIds}
          engineId={engineId}
          onEngineChange={handleEngineChange}
          modules={stackModules}
          onModulesChange={setStackModules}
        />
      </Box>
      <Box style={{ width: "30%", display: "flex", flexDirection: "column", gap: 16 }}>
        <Button onClick={() => setOpen(true)}>{t('settings_tab_space_map')}</Button>
        Перемещений: {way ? way?.length - 1 : 0}
        <HexMapPopup
          open={open}
          onClose={() => setOpen(false)}
          mapProps={{
            objects: objects,
            rocketWay: way,
            onWayChange: setWay,
            minHeightPx: 280,
            mode: 'select',
          }}
        />
      </Box>
    </div>
  );
}
