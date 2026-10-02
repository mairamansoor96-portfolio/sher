import type { Metadata } from "next";
import Link from "next/link";
import { Atkinson_Hyperlegible, Noto_Nastaliq_Urdu } from "next/font/google";
import { TabBar } from "@/components/TabBar";
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
  title: { default: "Sher", template: "%s · Sher" },
  description: "One couplet a day, made understandable and shareable.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nastaliq.variable} ${atkinson.variable} antialiased`}>
      <body className="min-h-dvh">
        <div className="mx-auto max-w-reading px-gutter pt-8 pb-tabbar">
          <header className="mb-section">
            <Link href="/" className="inline-flex min-h-touch items-center text-ui-lg font-bold">
              Sher
            </Link>
          </header>
          <main>{children}</main>
        </div>
        <TabBar />
      </body>
    </html>
  );
}
