import { useEffect, useState, type ReactNode } from "react";
import type { PlanetoidGameType } from "../../types/planetoid-types";
import Box from "../box/box";
import { useAppSettings } from "../../providers/app-settings-provider";
import PlanetoidTypePicker from "./PlanetoidTypePicker";
import { PlanetoidPreviewProvider } from "./planetoid-gate-context";

type PlanetoidGateProps = {
  children: ReactNode;
  pickerTitle?: ReactNode;
};

/** Пока нет планетойда — выбор Classic / Spaced Out только на этой странице; иначе содержимое. */
export default function PlanetoidGate({ children, pickerTitle }: PlanetoidGateProps) {
  const { activePlanetoid } = useAppSettings();
  const [previewGameType, setPreviewGameType] = useState<PlanetoidGameType | null>(null);

  useEffect(() => {
    if (activePlanetoid) setPreviewGameType(null);
  }, [activePlanetoid]);

  if (!activePlanetoid && !previewGameType) {
    return (
      <Box
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          minHeight: 0,
          width: "100%",
          boxSizing: "border-box",
          overflowY: "auto",
        }}
      >
        <PlanetoidTypePicker title={pickerTitle} onPick={setPreviewGameType} />
      </Box>
    );
  }

  const preview = activePlanetoid ? null : previewGameType;

  return (
    <PlanetoidPreviewProvider preview={preview}>{children}</PlanetoidPreviewProvider>
  );
}
