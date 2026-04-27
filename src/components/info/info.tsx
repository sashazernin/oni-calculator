import { FaInfoCircle } from "react-icons/fa";
import { Tooltip, type TooltipPlacement } from "../tooltip/Tooltip";

type InfoProps = {
  message: string;
  placement?: TooltipPlacement;
}

export default function Info({ message, placement = "bottom" }: InfoProps) {
  return (
    <Tooltip arrow placement={placement} title={message}>
      <FaInfoCircle size={20} />
    </Tooltip>
  )
}