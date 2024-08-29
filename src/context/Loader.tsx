"use client"

import { createContext, useCallback, useContext, useState } from "react"

import Spinner from "@/components/Spinner"

declare type LoaderContextProps = {
  setLoading: (active: boolean, message?: string) => void,
}

const LoaderContext = createContext<LoaderContextProps>({
  setLoading: () => null,
})

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ active: boolean, message?: string }>({ active: false })

  const setLoading = useCallback((active: boolean, message?: string) => { setState({ active, message }) }, [])
  
  const value = { setLoading }
  return (
    <LoaderContext.Provider value={value}>
      {state.active && (
        <div className="loader active">
          {state.message && (<span className="loader-message" role="alert">{state.message}</span>)}
          <Spinner />
        </div>
      )}
      {children}
    </LoaderContext.Provider>
  )
}

export const useLoaderContext = () => useContext(LoaderContext)
