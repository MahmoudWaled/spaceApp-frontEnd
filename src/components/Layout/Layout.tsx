// import type { Metadata } from "next"
// import { Inter } from "next/font/google"
import "../../../app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/Navbar/navbar";
import { LeftSidebar } from "@/components/left-sidebar";
import { RightPanel } from "@/components/right-panel";
import { Outlet } from "react-router-dom";

export function Layout() {
  return (
    <>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <div className="min-h-screen  flex flex-col">
          <Navbar />
          <div className="flex flex-1 pt-16">
            <LeftSidebar />

            <main className="flex-1   lg:ml-64 xl:mr-80 ">
              <Outlet />
            </main>

            <RightPanel />
          </div>
        </div>
      </ThemeProvider>
    </>
  );
}
