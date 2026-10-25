import { useCallback, useMemo, useState, type MouseEventHandler } from "react";
import { Popup } from "../components/popup/Popup";
import { Button } from "../components/button/Button";
import { useTranslation } from "./useTranslation";

const DANGER = "rgb(211, 64, 64)";

const destructiveConfirmOverrides = {
  main: DANGER,
  hover: "rgb(190, 52, 52)",
  active: "rgb(165, 42, 42)",
  contrastText: "#ffffff",
  ripple: `color-mix(in srgb, ${DANGER} 45%, transparent)`,
};

type ConfirmDialogProps = {
  title?: string;
  message?: string;
  onConfirm?: MouseEventHandler<HTMLElement>;
  /** Красная кнопка подтверждения (удаление и т.п.). @default true */
  destructive?: boolean;
};

export default function useConfirmDialog(props?: ConfirmDialogProps) {
  const { t } = useTranslation();
  const title = props?.title ?? t("dialog_confirmation");
  const message = props?.message ?? t("dialog_confirm_question");
  const onConfirm = props?.onConfirm;
  const destructive = props?.destructive ?? true;
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  const modal = useMemo(() => {
    return (
      <Popup
        title={title}
        open={open}
        onClose={close}
        variant="fit-content"
        closeButton
        bottom={
          <>
            <Button type="button" variant="outline" onClick={close} style={{ textTransform: "none" }}>
              {t("button_cancel")}
            </Button>
            <Button
              type="button"
              variant="primary"
              colorOverrides={destructive ? destructiveConfirmOverrides : undefined}
              onClick={(e) => {
                onConfirm?.(e);
                close();
              }}
              style={{ textTransform: "none" }}
            >
              {t("button_confirm")}
            </Button>
          </>
        }
      >
        <div
          style={{
            padding: 16,
            minWidth: 300,
            maxWidth: "100%",
            width: "100%",
            boxSizing: "border-box",
            lineHeight: 1.45,
          }}
        >
          {message}
        </div>
      </Popup>
    );
  }, [open, title, message, onConfirm, destructive, t, close]);

  return { confirmDialog: modal, openConfirmDialog: () => setOpen(true) };
}
