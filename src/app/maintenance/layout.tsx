import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  icons:
    "https://cdn.discordapp.com/attachments/1382019709989290004/1382020202946101449/IMG_8208.png?ex=6892249d&is=6890d31d&hm=3ef25c941e0e30f1b1ed7c56432f7c6e84b346da3f59b135ce38b135951376b9&",
  title: "Maintenance Mode | MLRPCrafting - MotionLife RP Calculator",
  description:
    "Website sedang dalam perbaikan. Calculator crafting MotionLife RP akan segera kembali dengan fitur yang lebih baik.",
};

export default function MaintenanceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
