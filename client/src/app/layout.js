import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
 variable: "--font-jakarta",
 subsets: ["latin"],
 weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
 title: "Canva - Design anything. Publish anywhere.",
 description: "Create beautiful designs with Canva's easy-to-use online design tool.",
};

export default function RootLayout({ children }) {
 return (
  <html lang="en">
   <body
    className={`${jakartaSans.variable} antialiased`}
    style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
   >
    {children}
   </body>
  </html>
 );
}
