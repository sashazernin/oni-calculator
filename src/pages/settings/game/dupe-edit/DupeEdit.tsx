import { useCallback, useEffect, useState } from "react";
import { Popup } from "../../../../components/popup/Popup";
import { Button } from "../../../../components/button/Button";
import { Checkbox } from "../../../../components/checkbox/Checkbox";
import { TextField } from "../../../../components/text-field/TextField";
import type { IDuplicate } from "../../../../types/game-data-types";
import { safeParseZodWithFieldErrors, type ZodFieldErrorMap } from "../../../../helpers/zodFieldErrors";
import { dupeSchema } from "../../../../schemas/gameSchemas";
import Divider from "../../../../components/divider/Devider";

interface IDupeEditProps {
  open: boolean;
  onClose: () => void;
  onSave: (newDupe: IDuplicate) => void;
  /** Заполняет форму при открытии; `undefined` — новый дубликат. */
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
  const { open, onClose, onSave, dupe, title = "Add duplicant" } = props;

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
    setIsSubmit(true)
    if (r.success === false) {
      setError(r.errors);
      return;
    }
    setError({});
    onSave(r.data);
    handleClose();
  }, [newDupe, onSave, handleClose]);

  return (
    <Popup
      open={open}
      onClose={handleClose}
      title={title}
      variant="fit-content"
      bottom={
        <>
          <Button onClick={handleClose} style={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button onClick={handleSave} style={{ textTransform: "none" }}>
            Save
          </Button>
        </>
      }
    >
      <div
        style={{
          padding: 16,
          minWidth: 500,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <TextField
          label="Name"
          value={newDupe.name}
          error={error.name}
          onChange={(e) => {
            setError((prev) => {
              const next = { ...prev };
              delete next.name;
              return next;
            });
            setNewDupe((d) => ({ ...d, name: e.target.value }));
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div>Peculiarities</div>
          <Divider />
        </div>
        <Checkbox
          label="Bottomless stomach"
          checked={newDupe.gluttonous}
          onChange={(e) => {
            setNewDupe((d) => ({ ...d, gluttonous: e.target.checked }));
          }}
        />
      </div>
    </Popup>
  );
}
