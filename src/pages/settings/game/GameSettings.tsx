import { useCallback, useMemo, useState } from "react";
import type { IDuplicate } from "../../../types/game-data-types";
import DupeCard from "./dupe-card/DupeCard";
import { Button } from "../../../components/button/Button";
import DupeEdit from "./dupe-edit/DupeEdit";

export default function GameSettings() {
  const [duplicates] = useState<IDuplicate[]>([]);

  const [open, setOpen] = useState(false);

  const onEdit = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSave = useCallback(() => {
    setOpen(false);
  }, []);

  const dupeEdit = useMemo(() => {
    return (
      <DupeEdit
        open={open}
        onClose={handleClose}
        onSave={handleSave}
        dupe={undefined}
      />
    )
  }, [open, handleClose, handleSave, onEdit])

  return (
    <div>
      {duplicates.map((duplicate) => (
        <DupeCard key={duplicate.name} duplicate={duplicate} />
      ))}
      <Button onClick={onEdit}>Add Duplicate</Button>
      {dupeEdit}
    </div>
  )
}