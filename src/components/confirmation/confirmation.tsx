import {
  cloneElement,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
} from "react";
import useConfirmDialog from "../../hooks/useCongirmDialog";

type IConfirmationProps = {
  title?: string;
  message?: string;
  children: ReactElement<{
    onClick?: (e: ReactMouseEvent<HTMLElement>) => void;
  }>;
};

export default function Confirmation(props: IConfirmationProps) {
  const { title, message, children } = props;
  const { confirmDialog, openConfirmDialog } = useConfirmDialog({ title, message, onConfirm: children.props.onClick });

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
