import { useContext, useEffect, useState } from "react";
import type { Planetoid, PlanetoidGameType } from "../../types/planetoid-types";
import { ThemeContext } from "../../providers/app-theme-provider";
import { useTranslation } from "../../hooks/useTranslation";
import { TextField } from "../../components/text-field/TextField";
import { Switch } from "../../components/switch/Switch";
import FormDialog from "../../components/form-dialog/FormDialog";
import spacedOutLogo from "../../assets/Spaced_Out_Logo.webp";

type PlanetoidEditModalProps = {
  open: boolean;
  planetoid: Planetoid | null;
  onClose: () => void;
  onSave: (
    id: string,
    name: string,
    gameType: PlanetoidGameType,
    expansions: boolean
  ) => void;
};

export default function PlanetoidEditModal({
  open,
  planetoid,
  onClose,
  onSave,
}: PlanetoidEditModalProps) {
  const { t } = useTranslation();
  const { colors } = useContext(ThemeContext);
  const muted = `color-mix(in srgb, ${colors.text.primary} 58%, transparent)`;

  const [name, setName] = useState("");
  const [spacedOut, setSpacedOut] = useState(true);

  useEffect(() => {
    if (!open || !planetoid) return;
    setName(planetoid.name);
    setSpacedOut(planetoid.gameType === "spaced-out");
  }, [open, planetoid]);

  const handleSave = () => {
    if (!planetoid) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const gameType: PlanetoidGameType = spacedOut ? "spaced-out" : "classic";
    onSave(planetoid.id, trimmed, gameType, false);
    onClose();
  };

  return (
    <FormDialog
      open={open && planetoid != null}
      onClose={onClose}
      title={t("planetoid_edit_title")}
      onSave={handleSave}
      saveDisabled={!name.trim()}
    >
      <TextField
        label={t("planetoid_name_label")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: muted,
            lineHeight: 1.3,
          }}
        >
          {t("planetoid_expansions_label")}
        </div>
        <Switch
          checked={spacedOut}
          togglePosition="start"
          onChange={setSpacedOut}
          labelImageSrc={spacedOutLogo}
          labelImageAlt={t("planetoid_type_spaced_out")}
        />
      </div>
    </FormDialog>
  );
}
