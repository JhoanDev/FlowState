import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SettingsProvider } from "@/providers/settings-provider";
import { I18nProvider } from "@/providers/i18n-provider";
import { CommandPaletteProvider } from "@/providers/command-palette-provider";
import { GlobalLoader } from "@/components/layout/global-loader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlowState",
  description: "Time tracking and productivity for developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <I18nProvider>
          <SettingsProvider>
            <CommandPaletteProvider>
              <GlobalLoader />
              {children}
            </CommandPaletteProvider>
          </SettingsProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
