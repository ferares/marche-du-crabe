import { type PropsWithChildren } from "react"

import { type Href } from "@/i18nConfig"
import { Link } from "@/navigation"

interface ButtonProps { onClick?: () => void, href?: Href }

export default function Button({ children, href, onClick }: PropsWithChildren<ButtonProps>) {
  if (href) return (
    // @ts-expect-error TODO: fix Href type to work on Link components
    <Link href={href} className="btn">
      {children}
    </Link>
  )
  return (
    <button type="button" className="btn" onClick={onClick}>
      {children}
    </button>
  )
}