"use client"

import { type PropsWithChildren } from "react"

interface ScreenReaderAlertProps extends PropsWithChildren {
  type: "off" | "assertive" | "polite",
}

export default function ScreenReaderAlert({ type, children }: ScreenReaderAlertProps) {
  return (
    <div className="visually-hidden" aria-live={type} aria-atomic="true">
      {children}
    </div>
  )
}