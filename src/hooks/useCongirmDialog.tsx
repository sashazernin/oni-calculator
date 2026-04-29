import { useMemo, useState, type MouseEventHandler } from "react";
import { Popup } from "../components/popup/Popup";
import { Button } from "../components/button/Button";
import Divider from "../components/divider/Devider";
import { useTranslation } from "./useTranslation";

type ConfirmDialogProps = {
  title?: string;
  message?: string;
  onConfirm?: MouseEventHandler<HTMLElement>;
};

export default function useConfirmDialog(props?: ConfirmDialogProps) {
  const { t } = useTranslation();
  const title = props?.title ?? t("dialog_confirmation");
  const message = props?.message ?? t("dialog_confirm_question");
  const onConfirm = props?.onConfirm;
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
          <Button onClick={() => setOpen(false)}>{t("button_cancel")}</Button>
          <Button onClick={(e) => { onConfirm?.(e); setOpen(false); }}>{t("button_confirm")}</Button>
        </div>
      </Popup>
    );
  }, [open, title, message, onConfirm, t]);

  return { confirmDialog: modal, openConfirmDialog: () => setOpen(true) };
}
