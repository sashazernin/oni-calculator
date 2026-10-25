import { useCallback, useEffect, useState } from "react";
import FormDialog from "../../../../components/form-dialog/FormDialog";
import { Checkbox } from "../../../../components/checkbox/Checkbox";
import { TextField } from "../../../../components/text-field/TextField";
import type { IDuplicate } from "../../../../types/game-data-types";
import { safeParseZodWithFieldErrors, type ZodFieldErrorMap } from "../../../../helpers/zodFieldErrors";
import { dupeSchema } from "../../../../schemas/gameSchemas";
import Divider from "../../../../components/divider/Devider";
import { useTranslation } from "../../../../hooks/useTranslation";
import type { TranslationKey } from "../../../../i18n/translations";

interface IDupeEditProps {
  open: boolean;
  onClose: () => void;
  onSave: (newDupe: IDuplicate) => void;
  /** Заполняет форму при открытии; `undefined` — новый дубликант. */
  dupe?: IDuplicate;
  title?: string;
}

function defaultValues(dupe?: IDuplicate): IDuplicate {
  return {
    name: dupe?.name ?? "",
    gluttonous: dupe?.gluttonous ?? false,
  };
}

export default function DupeEdit(props: IDupeEditProps) {
  const { t } = useTranslation();
  const { open, onClose, onSave, dupe, title } = props;
  const resolvedTitle = title ?? t("game_add_duplicant");

  const [newDupe, setNewDupe] = useState<IDuplicate>(() => defaultValues(dupe));
  const [error, setError] = useState<ZodFieldErrorMap>({});
  const [isSubmit, setIsSubmit] = useState(false);

  useEffect(() => {
    if (open) {
      setNewDupe(defaultValues(dupe));
    }
  }, [open, dupe]);

  const handleClose = useCallback(() => {
    setIsSubmit(false);
    onClose();
    setError({});
  }, [onClose]);

  useEffect(() => {
    if (isSubmit) {
      const r = safeParseZodWithFieldErrors(dupeSchema, newDupe);
      if (r.success === false) {
        setError(r.errors);
        return;
      }
      setError({});
    }
  }, [isSubmit, newDupe]);

  const handleSave = useCallback(() => {
    const r = safeParseZodWithFieldErrors(dupeSchema, newDupe);
    setIsSubmit(true);
    if (r.success === false) {
      setError(r.errors);
      return;
    }
    setError({});
    onSave(r.data);
    handleClose();
  }, [newDupe, onSave, handleClose]);

  return (
    <FormDialog open={open} onClose={handleClose} title={resolvedTitle} onSave={handleSave}>
      <TextField
        label={t("dupe_name_label")}
        value={newDupe.name}
        fullWidth
        error={error.name ? t(error.name as TranslationKey) : undefined}
        onChange={(e) => {
          setError((prev) => {
            const next = { ...prev };
            delete next.name;
            return next;
          });
          setNewDupe((d) => ({ ...d, name: e.target.value }));
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
        <div>{t("dupe_peculiarities")}</div>
        <Divider />
      </div>
      <Checkbox
        label={t("dupe_bottomless_stomach")}
        checked={newDupe.gluttonous}
        dense
        onChange={(e) => {
          setNewDupe((d) => ({ ...d, gluttonous: e.target.checked }));
        }}
      />
    </FormDialog>
  );
}
