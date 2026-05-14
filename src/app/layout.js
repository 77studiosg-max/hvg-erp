import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Sidebar from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "HVG ERP - Enterprise Resource Planning",
  description: "A professional ERP system for sales, purchasing, and inventory management.",
};

export default async function RootLayout({ children }) {
  let categories = [];
  try {
    const allCategories = await prisma.productCategory.findMany({
      orderBy: { name: 'asc' }
    });
    
    // Transform flat list into hierarchy for Sidebar
    categories = allCategories
      .filter(c => !c.parentId)
      .map(parent => ({
        ...parent,
        subcategories: allCategories
          .filter(c => c.parentId === parent.id)
          .map(child => ({
            ...child,
            subcategories: allCategories.filter(c => c.parentId === child.id)
          }))
      }));
  } catch (error) {
    console.error("Failed to fetch categories for sidebar:", error);
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="layout-container">
            <Suspense fallback={<div className="sidebar-skeleton" />}>
              <Sidebar categories={categories} />
            </Suspense>
            <main className="main-content">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
