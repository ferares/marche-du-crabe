import "../styles/app.css"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "La Marche du Crabe",
  robots: { follow: false, index: false }
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
