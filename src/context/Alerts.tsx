"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"

import AlertComponent from "@/components/Alert"
import ScreenReaderAlert from "@/components/ScreenReaderAlert"

const DEFAULT_TIMEOUT = 5000

// This is to ensure every alert is unique so they always trigger a re-render
// even if two content-identical alerts are triggered on after the other
let alertId = 0

export type AlertType = "info" | "success" | "danger"

type Alert = {
  id: number
  type: AlertType
  content: string
  timeout: number
}

type ScreenReaderAlert = {
  id: number
  type: "off" | "assertive" | "polite"
  content: string
  timeout: number
}

declare type AlertsContextProps = {
  pushAlert: (type: Alert["type"], content: string, timeout?: number) => void,
  pushScreenReaderAlert: (type: ScreenReaderAlert["type"], content: string) => void,
}

const AlertsContext = createContext<AlertsContextProps>({
  pushAlert: () => null,
  pushScreenReaderAlert: () => null,
})

export function AlertsProvider({ children }: { children: React.ReactNode }) {
  // Visible alerts
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [currentAlert, setCurrentAlert] = useState<Alert>()
  const currentTimeout = useRef<NodeJS.Timeout | null>(null)
  // Screen reader alerts
  const [screenReaderAlerts, setScreenReaderAlerts] = useState<ScreenReaderAlert[]>([])
  const [currentScreenReaderAlert, setCurrentScreenReaderAlert] = useState<ScreenReaderAlert>()
  const currentScreenReaderTimeout = useRef<NodeJS.Timeout | null>(null)

  // Visible alerts
  const pushAlert = useCallback((type: Alert["type"], content: string, timeout?: number) => {
    const newAlert: Alert = { id: alertId++, type, content, timeout: timeout ?? DEFAULT_TIMEOUT }
    setAlerts((prevAlerts) => [...prevAlerts, newAlert])
  }, [])

  const removeAlert = useCallback(() => {
    if (currentTimeout.current) {
      clearTimeout(currentTimeout.current)
    }
    currentTimeout.current = null
    setAlerts((prevAlerts) => prevAlerts.slice(1))
  }, [])

  useEffect(() => {
    if (!currentTimeout.current) {
      if ((alerts.length > 0)) {
        const alert = alerts[0]
        currentTimeout.current = setTimeout(removeAlert, alert.timeout)
        setCurrentAlert(alert)
      } else {
        setCurrentAlert(undefined)
      }
    }
  }, [alerts, removeAlert])

  // Screen reader alerts
  const pushScreenReaderAlert = useCallback((type: ScreenReaderAlert["type"], content: string) => {
    const newScreenReaderAlert: ScreenReaderAlert = { id: alertId++, type, content, timeout: 500 }
    setScreenReaderAlerts((prevAlerts) => [...prevAlerts, newScreenReaderAlert])
  }, [])

  const removeScreenReaderAlert = useCallback(() => {
    if (currentScreenReaderTimeout.current) {
      clearTimeout(currentScreenReaderTimeout.current)
    }
    currentScreenReaderTimeout.current = null
    setScreenReaderAlerts((prevAlerts) => prevAlerts.slice(1))
  }, [])

  useEffect(() => {
    if (!currentScreenReaderTimeout.current) {
      if ((screenReaderAlerts.length > 0)) {
        const screenReaderAlert = screenReaderAlerts[0]
        currentScreenReaderTimeout.current = setTimeout(removeScreenReaderAlert, screenReaderAlert.timeout)
        setCurrentScreenReaderAlert(screenReaderAlert)
      } else {
        setCurrentScreenReaderAlert(undefined)
      }
    }
  }, [screenReaderAlerts, removeScreenReaderAlert])
  
  const value = { pushAlert, pushScreenReaderAlert }
  return (
    <AlertsContext.Provider value={value}>
      {children}
      {currentAlert && (
        <AlertComponent removeAlert={removeAlert} type={currentAlert.type} key={currentAlert.id}>
          {currentAlert.content}
        </AlertComponent>
      )}
      {currentScreenReaderAlert && (
        <ScreenReaderAlert type={currentScreenReaderAlert.type} key={currentScreenReaderAlert.id}>
          {currentScreenReaderAlert.content}
        </ScreenReaderAlert>
      )}
    </AlertsContext.Provider>
  )
}

export const useAlertsContext = () => useContext(AlertsContext)
