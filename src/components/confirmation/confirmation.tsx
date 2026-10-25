import {
  cloneElement,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
} from "react";
import useConfirmDialog from "../../hooks/useCongirmDialog";

type IConfirmationProps = {
  title?: string;
  message?: string;
  /** @default true */
  destructive?: boolean;
  children: ReactElement<{
    onClick?: (e: ReactMouseEvent<HTMLElement>) => void;
  }>;
};

export default function Confirmation(props: IConfirmationProps) {
  const { title, message, destructive, children } = props;
  const { confirmDialog, openConfirmDialog } = useConfirmDialog({
    title,
    message,
    destructive,
    onConfirm: children.props.onClick,
  });

  return (
    <>
      {confirmDialog}
      {cloneElement(children, {
        onClick: (e: ReactMouseEvent<HTMLElement>) => {
          e.preventDefault();
          e.stopPropagation();
          openConfirmDialog()
        },
      })}
    </>
  );
}
