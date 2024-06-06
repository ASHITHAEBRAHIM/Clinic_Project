import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "clinic_Project",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (<>
    <html lang="en" className={GeistSans.className}>
      <body className="bg-background text-foreground">
        <main className="h-full w-full flex flex-col items-center">
          {children}
        </main>
        <Toaster position="top-right" />
      </body>
    </html>
  </>
  );
}
