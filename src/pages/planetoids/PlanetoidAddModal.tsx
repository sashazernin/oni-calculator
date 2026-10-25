import { useContext, useEffect, useState } from "react";
import type { PlanetoidGameType } from "../../types/planetoid-types";
import { ThemeContext } from "../../providers/app-theme-provider";
import { useTranslation } from "../../hooks/useTranslation";
import { TextField } from "../../components/text-field/TextField";
import { Switch } from "../../components/switch/Switch";
import FormDialog from "../../components/form-dialog/FormDialog";
import spacedOutLogo from "../../assets/Spaced_Out_Logo.webp";

type PlanetoidAddModalProps = {
  open: boolean;
  onClose: () => void;
  suggestedName: string;
  defaultGameType?: PlanetoidGameType;
  onAdd: (name: string, gameType: PlanetoidGameType, expansions: boolean) => void;
};

export default function PlanetoidAddModal({
  open,
  onClose,
  suggestedName,
  defaultGameType = "classic",
  onAdd,
}: PlanetoidAddModalProps) {
  const { t } = useTranslation();
  const { colors } = useContext(ThemeContext);
  const muted = `color-mix(in srgb, ${colors.text.primary} 58%, transparent)`;

  const [name, setName] = useState("");
  const [spacedOut, setSpacedOut] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(suggestedName);
    setSpacedOut(defaultGameType === "spaced-out");
  }, [open, suggestedName, defaultGameType]);

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const gameType: PlanetoidGameType = spacedOut ? "spaced-out" : "classic";
    onAdd(trimmed, gameType, false);
    onClose();
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={t("planetoid_add_title")}
      onSave={handleCreate}
      saveLabel={t("planetoid_add_button")}
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
