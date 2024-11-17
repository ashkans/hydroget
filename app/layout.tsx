import "./globals.css";
import { Inter } from "next/font/google";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  UserButton,
  UserProfile,
} from "@clerk/nextjs";
import SignInPage from "@/components/main/SignInPage";
import AuthButtons from "@/components/main/AuthButtons";
import NavigationMenuComponent from "@/components/main/NavigationComponent";
import { Analytics } from "@vercel/analytics/react";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "HydroGet",
  description:
    "HydroGet! A comprehensive web platform for hydrological modeling, analysis and simulation. Streamline your workflow with powerful tools for catchment analysis and flood modeling.",
  openGraph: {
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <SignedIn>
            <header className="bg-white shadow-sm  bg-blue-100">
              <div className="flex justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <NavigationMenuComponent />
                <AuthButtons />
              </div>
            </header>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </SignedIn>
          <SignedOut>
            <SignInPage />
          </SignedOut>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
