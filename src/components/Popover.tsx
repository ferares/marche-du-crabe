import { type PropsWithChildren } from "react"

interface PopoverProps { title: string, open: boolean, position?: "top" | "bottom" | "left" | "right" }

export default function Popover({ children, title, open, position = "top" }: PropsWithChildren<PopoverProps>) {
  return (
    <div className={`popover popover--${position} ${open ? "show" : ""}`} role="dialog" aria-hidden={!open}>
      <div className="popover-header">
        <h4 className="popover-title">
          {title}
        </h4>
      </div>
      <div className="popover-content">
        {children}
      </div>
    </div>
  )
}