import "./globals.css";
import NextAuthProvider from "../providers/next-auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { Outfit } from "next/font/google";

const plusJakartaSans = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata = {
  title: "Canva Clone",
  description: "A powerful design editor",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className={plusJakartaSans.className}>
        <NextAuthProvider>{children}</NextAuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
