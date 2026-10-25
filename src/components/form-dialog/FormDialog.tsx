import type { CSSProperties, ReactNode } from "react";
import { Popup } from "../popup/Popup";
import { Button } from "../button/Button";
import { useTranslation } from "../../hooks/useTranslation";

export const FORM_DIALOG_WIDTH = 440;

export const formDialogBodyStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  padding: 16,
  width: "100%",
  minWidth: 0,
  maxWidth: "100%",
  boxSizing: "border-box",
  alignItems: "stretch",
};

export type FormDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSave?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  saveDisabled?: boolean;
  width?: number;
  /** `null` — без нижней панели; иначе по умолчанию Отмена + Сохранить при `onSave`. */
  footer?: ReactNode | null;
  zIndex?: number;
  closeButton?: boolean;
  disableCloseOnEscape?: boolean;
  disableCloseOnClickOutside?: boolean;
};

export default function FormDialog({
  open,
  onClose,
  title,
  children,
  onSave,
  saveLabel,
  cancelLabel,
  saveDisabled,
  width = FORM_DIALOG_WIDTH,
  footer,
  zIndex,
  closeButton = true,
  disableCloseOnEscape,
  disableCloseOnClickOutside,
}: FormDialogProps) {
  const { t } = useTranslation();

  const defaultFooter =
    onSave != null
      ? (
          <>
            <Button type="button" variant="outline" onClick={onClose} style={{ textTransform: "none" }}>
              {cancelLabel ?? t("button_cancel")}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={onSave}
              disabled={saveDisabled}
              style={{ textTransform: "none" }}
            >
              {saveLabel ?? t("button_save")}
            </Button>
          </>
        )
      : undefined;

  const bottom = footer === null ? undefined : (footer ?? defaultFooter);

  return (
    <Popup
      open={open}
      onClose={onClose}
      title={title}
      variant="fit-content"
      width={width}
      closeButton={closeButton}
      disableCloseOnEscape={disableCloseOnEscape}
      disableCloseOnClickOutside={disableCloseOnClickOutside}
      bottom={bottom}
      zIndex={zIndex}
    >
      <div style={formDialogBodyStyle}>{children}</div>
    </Popup>
  );
}
