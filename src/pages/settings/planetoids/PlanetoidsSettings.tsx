import { useContext, useState, type CSSProperties } from "react";
import type { PlanetoidGameType } from "../../../types/planetoid-types";
import { useAppSettings } from "../../../providers/app-settings-provider";
import { ThemeContext } from "../../../providers/app-theme-provider";
import { useTranslation } from "../../../hooks/useTranslation";
import PlanetoidCard from "../../planetoids/PlanetoidCard";
import PlanetoidAddModal from "../../planetoids/PlanetoidAddModal";
import PlanetoidEditModal from "../../planetoids/PlanetoidEditModal";
import type { Planetoid } from "../../../types/planetoid-types";
import { PlanetoidIcon } from "../../../icons";
import { IconButton } from "../../../components/icon-button/IconButton";
import { LuCirclePlus } from "react-icons/lu";
import Divider from "../../../components/divider/Devider";
import PageToolbar, { pageStatCardStyle } from "../../../components/page-toolbar/PageToolbar";
import PlanetoidTypePicker from "../../../components/planetoid/PlanetoidTypePicker";
import { visiblePlanetoids } from "../../../helpers/planetoidStorage";

type PlanetoidsSettingsProps = {
  pageTitle: string;
};

export default function PlanetoidsSettings({ pageTitle }: PlanetoidsSettingsProps) {
  const { t } = useTranslation();
  const { colors } = useContext(ThemeContext);
  const { data, setActivePlanetoidId, addPlanetoid, updatePlanetoid, removePlanetoid } =
    useAppSettings();
  const [addOpen, setAddOpen] = useState(false);
  const [addDefaultGameType, setAddDefaultGameType] = useState<PlanetoidGameType>("classic");
  const [editTarget, setEditTarget] = useState<Planetoid | null>(null);
  const visible = visiblePlanetoids(data.planetoids);
  const canDeletePlanetoid = visible.length > 1;

  const catalogGridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 220px), 1fr))",
    gap: 16,
    alignItems: "stretch",
  };

  const statCardStyle = pageStatCardStyle(colors);

  const openAdd = (gameType: PlanetoidGameType = "classic") => {
    setAddDefaultGameType(gameType);
    setAddOpen(true);
  };

  return (
    <>
      <PlanetoidAddModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        suggestedName={t("planetoid_default_name", { n: visible.length + 1 })}
        defaultGameType={addDefaultGameType}
        onAdd={addPlanetoid}
      />
      <PlanetoidEditModal
        open={editTarget != null}
        planetoid={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={(id, name, gameType, expansions) => updatePlanetoid(id, { name, gameType, expansions })}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
        <PageToolbar
          title={pageTitle}
          actions={
            <IconButton onClick={() => openAdd()} aria-label={t("aria_add_planetoid")}>
              <LuCirclePlus aria-hidden />
            </IconButton>
          }
        >
          <div
            style={statCardStyle}
            title={t("planetoid_total_label")}
            aria-label={`${t("planetoid_total_label")}: ${visible.length}`}
          >
            <PlanetoidIcon size={26} style={{ color: colors.primary.main, flexShrink: 0, opacity: 0.95 }} />
            <span style={{ fontSize: 22, fontWeight: 700, color: colors.text.primary, lineHeight: 1.15 }}>
              {visible.length}
            </span>
          </div>
        </PageToolbar>

        <Divider />

        {visible.length === 0 ? (
          <PlanetoidTypePicker
            title={t("planetoids_pick_type_intro")}
            onPick={(gameType) => {
              openAdd(gameType);
            }}
          />
        ) : (
          <div style={catalogGridStyle}>
            {visible.map((p) => (
              <PlanetoidCard
                key={p.id}
                planetoid={p}
                isActive={p.id === data.activePlanetoidId}
                canDelete={canDeletePlanetoid}
                onActivate={() => setActivePlanetoidId(p.id)}
                onEdit={() => setEditTarget(p)}
                onDelete={() => removePlanetoid(p.id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
