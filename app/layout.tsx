import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";

const nastaliq = Noto_Nastaliq_Urdu({
  variable: "--font-noto-nastaliq-urdu",
  weight: ["400", "700"],
  subsets: ["arabic"],
  display: "swap",
});

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson-hyperlegible",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sher",
  description: "One couplet a day, made understandable and shareable.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nastaliq.variable} ${atkinson.variable} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
