import type { Metadata } from "next";
import "./globals.css";
import ConditionalHeader from "@/components/ConditionalHeader";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AdminLanguageProvider } from "@/contexts/AdminLanguageContext";
import ChannelTalk from "@/components/ChannelTalk/ChannelTalk";
import ComingSoonNotice from "@/components/ComingSoonNotice/ComingSoonNotice";

export const metadata: Metadata = {
  title: "망고트래블 - 푸꾸옥 전문 여행사 | 호텔·투어·골프 예약",
  description: "푸꾸옥 여행의 모든 것! 10년 노하우의 푸꾸옥 전문 여행사 망고트래블과 함께하세요.",
  keywords: "푸꾸옥여행, 푸꾸옥호텔, 푸꾸옥리조트, 푸꾸옥골프, 푸꾸옥투어",
  openGraph: {
    title: "망고트래블 - 푸꾸옥 전문 여행사",
    description: "푸꾸옥 여행의 모든 것을 한 번에! 최저가 보장",
    type: "website",
  },
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
          <AdminLanguageProvider>
            <LanguageProvider>
              <ConditionalHeader />
              <main>{children}</main>
              <ChannelTalk />
              <ComingSoonNotice />
            </LanguageProvider>
          </AdminLanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
