import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "./components/navigation";

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
  title: "MotionLife RP Crafting Optimizer | MINING",
  description:
    "Optimize your crafting and mining in MotionLife RP with our powerful tool. Calculate profits, time, and requirements for all items.",
};

export default function RootLayout({
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
