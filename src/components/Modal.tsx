"use client"

import { type MouseEvent, type PropsWithChildren, useCallback, useEffect, useRef } from "react"

import { useTranslations } from "next-intl"

export interface ModalProps {
  id: string,
  title?: string,
  closeable?: boolean,
  open: boolean,
  onClose?: () => void,
  labelledBy: string,
}

export default function Modal({ id, open, onClose, title, children, labelledBy, closeable = true }: PropsWithChildren<ModalProps>) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const t = useTranslations("Labels")

  const keyDownHandler = useCallback((event: KeyboardEvent) => {
    if ((!closeable) && (event.key === "Escape")) {
      event.stopPropagation()
      event.preventDefault()
    }
  }, [closeable])

  // Open/close modal when open prop updates
  useEffect(() => {
    const currentDialogRef = dialogRef.current
    if (!currentDialogRef) return
    if (!closeable) currentDialogRef.addEventListener("keydown", keyDownHandler)
    if (open) currentDialogRef.showModal()
    else currentDialogRef.close()
    return () => currentDialogRef.removeEventListener("keydown", keyDownHandler)
  }, [open, keyDownHandler, closeable])

  // Close the modal on backdrop click
  const onClick = useCallback((event: MouseEvent<HTMLDialogElement>) => {
    if (!closeable) return
    if (event.target === dialogRef.current) dialogRef.current?.close()
  }, [closeable])

  return (
    <dialog ref={dialogRef} onClose={onClose} onClick={onClick} className={`modal ${open ? "open" : ""}`} aria-labelledby={labelledBy}>
      <div className="modal-content">
        <div className="modal-header">
          {title && (
            <h3 id={`modal-${id}-title`}>
              {title}
            </h3>
          )}
          {closeable && (
            <button type="button" className="modal-close" aria-label={t("close")} onClick={onClose}>
              X
            </button>
          )}
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </dialog>
  )
}
