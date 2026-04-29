import { useCallback, useContext, useState } from "react";
import type { IDuplicate } from "../../../types/game-data-types";
import DupeCard from "./dupe-card/DupeCard";
import DupeEdit from "./dupe-edit/DupeEdit";
import { LuCirclePlus } from "react-icons/lu";
import { IconButton } from "../../../components/icon-button/IconButton";
import { DupeIcon } from "../../../icons";
import { ThemeContext } from "../../../providers/app-theme-provider";
import { DuplicantContext } from "../../../providers/duplicant-provider";
import Divider from "../../../components/divider/Devider";
import { IoFastFoodSharp } from "react-icons/io5";
import Chip from "../../../components/chip/chip";
import { duplicantInfo } from "../../../game-data/dublicantInfo";
import { useTranslation } from "../../../hooks/useTranslation";

type DupeDialog =
  | { kind: "closed" }
  | { kind: "add" }
  | { kind: "edit"; index: number };

export default function GameSettings() {
  const { t } = useTranslation();
  const { colors } = useContext(ThemeContext);
  const { duplicants, setDuplicants } = useContext(DuplicantContext);

  const [dupeDialog, setDupeDialog] = useState<DupeDialog>({ kind: "closed" });
  const open = dupeDialog.kind !== "closed";

  const openAdd = useCallback(() => {
    setDupeDialog({ kind: "add" });
  }, []);

  const openEdit = useCallback((index: number) => {
    setDupeDialog({ kind: "edit", index });
  }, []);

  const handleClose = useCallback(() => {
    setDupeDialog({ kind: "closed" });
  }, []);

  const handleSaveDupe = useCallback(
    (dupe: IDuplicate) => {
      if (dupeDialog.kind === "add") {
        setDuplicants([...duplicants, dupe]);
      } else if (dupeDialog.kind === "edit") {
        setDuplicants(duplicants.map((d, i) => (i === dupeDialog.index ? dupe : d)));
      }
    },
    [dupeDialog, duplicants, setDuplicants]
  );

  const handleDelete = useCallback(
    (index: number) => {
      setDuplicants(duplicants.filter((_, i) => i !== index));
    },
    [duplicants, setDuplicants]
  );

  const dupeForModal: IDuplicate | undefined =
    open && dupeDialog.kind === "edit"
      ? duplicants[dupeDialog.index]
      : undefined;

  const dupeEditTitle =
    dupeDialog.kind === "edit" ? t("game_edit_duplicant") : t("game_add_duplicant");

  return (
    <>
      <DupeEdit
        open={open}
        onClose={handleClose}
        onSave={handleSaveDupe}
        title={dupeEditTitle}
        dupe={dupeForModal}
      />
      <div
        style={{
          position: "relative",
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
          }}
        >
          <Chip>
            <DupeIcon size={25} style={{ color: colors.primary.main }} />
            <span>{duplicants.length}</span>
          </Chip>
          <Chip>
            <IoFastFoodSharp
              size={20}
              style={{ color: colors.primary.main }}
            />
            <span>
              {duplicants.reduce(
                (acc, duplicate) =>
                  acc + 1000 + (duplicate.gluttonous ? duplicantInfo.gluttonous : 0),
                0
              )}
            </span>
          </Chip>
          <div style={{ flex: 1 }}></div>
          <IconButton onClick={openAdd} aria-label={t("aria_add_duplicant")}>
            <LuCirclePlus aria-hidden />
          </IconButton>
        </div>

        <Divider />

        <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          {duplicants.length === 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 120,
                padding: 16,
                fontSize: "0.95rem",
                fontWeight: 500,
                color: `color-mix(in srgb, ${colors.text.primary} 48%, ${colors.background.paper})`,
                textAlign: "center",
              }}
            >
              {t("game_no_duplicants_hint")}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(min(100%, 140px), 1fr))",
                gap: 10,
                alignContent: "start",
                boxSizing: "border-box",
              }}
            >
              {duplicants.map((duplicate, index) => (
                <DupeCard
                  key={`${duplicate.name}-${index}`}
                  duplicate={duplicate}
                  onEdit={() => openEdit(index)}
                  onDelete={() => handleDelete(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
