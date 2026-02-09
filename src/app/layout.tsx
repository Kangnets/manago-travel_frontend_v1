import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header/Header";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Mango Travel - 맞춤형 여행 상품",
  description: "원하는 여행을 바로 찾아보세요. 키워드만 입력해도 가장 적절한 상품을 찾아드려요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <AuthProvider>
          <Header />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
