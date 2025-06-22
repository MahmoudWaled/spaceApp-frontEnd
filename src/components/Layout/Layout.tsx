import type React from "react"
// import type { Metadata } from "next"
// import { Inter } from "next/font/google"
import "../../../app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/Navbar/Navbar"
import { LeftSidebar } from "@/components/left-sidebar"
import { RightPanel } from "@/components/right-panel"
import { Outlet } from "react-router-dom"

// const inter = Inter({ subsets: ["latin"] })

// export const metadata: Metadata = {
//   title: "Space - Social Media App",
//   description: "Connect with the universe",
// }

export function Layout() 
 {
  return (
    <>
        <ThemeProvider   attribute="class"  defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="min-h-screen  flex flex-col">
            <Navbar  />
            <div className="flex flex-1 pt-16">
              <LeftSidebar />

              <main className="flex-1   lg:ml-64 xl:mr-80 "><Outlet /></main>

              <RightPanel  />
            </div>
          </div>
        </ThemeProvider>
      </>
  )
}
