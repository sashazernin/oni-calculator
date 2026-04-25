import { useCallback, useEffect, useMemo, useState } from "react";
import { Popup } from "../../../../components/popup/Popup";
import { Button } from "../../../../components/button/Button";
import { Checkbox } from "../../../../components/checkbox/Checkbox";
import { TextField } from "../../../../components/text-field/TextField";
import type { IDuplicate } from "../../../../types/game-data-types";
import { safeParseZodWithFieldErrors, type ZodFieldErrorMap } from "../../../../helpers/zodFieldErrors";
import { dupeSchema } from "../../../../schemas/gameSchemas";

interface IDupeEditProps {
  open: boolean;
  onClose: () => void;
  onSave: (newDupe: IDuplicate) => void;
  dupe?: IDuplicate;
}

function defaultValues(dupe?: IDuplicate): IDuplicate {
  return {
    name: dupe?.name ?? "",
    gluttonous: dupe?.gluttonous ?? false,
  };
}

export default function DupeEdit(props: IDupeEditProps) {
  const { open, onClose, onSave, dupe } = props;

  const [newDupe, setNewDupe] = useState<IDuplicate>(() => defaultValues(dupe));
  const [error, setError] = useState<ZodFieldErrorMap>({});

  useEffect(() => {
    if (open) {
      setNewDupe(defaultValues(dupe));
      setError({});
    }
  }, [open, dupe]);

  const handleSave = useCallback(() => {
    const r = safeParseZodWithFieldErrors(dupeSchema, newDupe);
    console.log(r);
    if (r.success === false) {
      setError(r.errors);
      return;
    }
    setError({});
    onSave(r.data);
    onClose();
  }, [newDupe, onSave, onClose]);

  const dupeEditPopup = useMemo(() => {
    return (
      <Popup
        open={open}
        onClose={onClose}
        title="Edit Duplicate"
        variant="fit-content"
        bottom={
          <>
            <Button onClick={onClose} style={{ textTransform: "none" }}>
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
              setError({ ...error, name: undefined });
              setNewDupe((d) => ({ ...d, name: e.target.value }));
            }}
          />
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
  }, [
    open,
    onClose,
    handleSave,
    newDupe.name,
    newDupe.gluttonous,
    error,
  ]);

  return dupeEditPopup;
}
