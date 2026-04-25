import { useMemo, useState } from "react";
import { Popup } from "../components/popup/Popup";
import { Button } from "../components/button/Button";
import Divider from "../components/divider/Devider";

type ConfirmDialogProps = {
  title?: string;
  message?: string;
  onConfirm?: (e?: any) => void;
};

export default function useConfirmDialog(props?: ConfirmDialogProps) {
  const { title = 'Confirmation', message = 'Are you sure?', onConfirm } = props ?? {};
  const [open, setOpen] = useState(false);

  const modal = useMemo(() => {
    return (
      <Popup
        title={title}
        open={open} onClose={() => setOpen(false)}
        variant="fit-content"
      >
        <div style={{ padding: '16px', minWidth: '300px' }}>{message}</div>
        <Divider />
        <div style={{ display: 'flex', flexDirection: 'row', gap: 10, justifyContent: 'flex-end', padding: '16px' }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => { onConfirm?.(); setOpen(false); }}>Confirm</Button>
        </div>
      </Popup>
    );
  }, [open, title, message, onConfirm]);

  return { confirmDialog: modal, openConfirmDialog: () => setOpen(true) };
}