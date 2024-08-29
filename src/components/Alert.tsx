"use client"

import { useTranslations } from "next-intl"

import { type PropsWithChildren, useState } from "react"

import { type AlertType } from "@/context/Alerts"

interface AlertComponentProps extends PropsWithChildren {
  type: AlertType,
  removeAlert: () => void,
}

export default function AlertComponent({ type, children, removeAlert }: AlertComponentProps) {
  const t = useTranslations("Labels")
  const [hiding, setHiding] = useState(false)

  return (
    <div className={`alert alert-${type} ${hiding ? "hide" : ""}`} role="alert" onAnimationEnd={() => (hiding) && removeAlert()}>
      <button type="button" className="close btn-close" title={t("close")} onClick={() => setHiding(true)}>
        X
      </button>
      <div>
        {children}
      </div>
    </div>
  )
}