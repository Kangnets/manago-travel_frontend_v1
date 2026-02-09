'use client';

import Link from 'next/link';

const footerLinks = [
  { title: '회사소개', href: '#' },
  { title: '이용약관', href: '#' },
  { title: '개인정보처리방침', href: '#', bold: true },
  { title: '여행약관', href: '#' },
  { title: '해외여행자보험', href: '#' },
  { title: '마케팅제휴문의', href: '#' },
];

export default function Footer() {
  return (
    <footer className="bg-[#f8f9fa] pt-10 sm:pt-12 pb-12 sm:pb-16 border-t border-[#e9ecef]">
      <div className="max-w-[1280px] mx-auto section-padding">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-8 text-[13px] sm:text-[14px] text-[#333]">
          {footerLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className={`hover:text-black transition-colors ${link.bold ? 'font-bold' : 'font-medium'}`}
            >
              {link.title}
            </Link>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
          <div className="flex flex-col gap-2 text-[13px] sm:text-[14px] text-[#666] leading-relaxed">
            <div className="mb-1">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-black mb-1">Mango Travel</h2>
              <p className="font-medium text-[#333]">망고트래블(주)</p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <p>대표이사: 김망고</p>
              <p>사업자등록번호: 123-45-67890</p>
              <p>관광사업자 등록번호: 제2026-000001호</p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <p>주소: 서울특별시 중구 세종대로 123 망고빌딩 10층</p>
              <p>개인정보관리책임자: 이트래블</p>
            </div>
            <p className="mt-2 text-[#888] text-[12px] sm:text-[13px]">
              ※ 망고트래블은 통신판매중개자이며 통신판매의 당사자가 아닙니다. 따라서 망고트래블은 상품·거래정보 및 거래에 대하여 책임을 지지 않습니다.
            </p>
            <p className="mt-4 text-[#999] text-[12px]">
              Copyright © Mango Travel Corp. All Rights Reserved.
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-2 flex-shrink-0">
            <h3 className="text-[15px] sm:text-[16px] font-bold text-black">고객센터</h3>
            <p className="text-[22px] sm:text-[24px] font-bold text-[#fbd865] font-pretendard">1588-0000</p>
            <div className="text-[13px] text-[#666] leading-relaxed lg:text-right">
              <p>평일 09:00 ~ 18:00</p>
              <p>점심시간 12:00 ~ 13:00</p>
              <p>주말/공휴일 휴무</p>
            </div>
            <button className="mt-2 px-4 py-2 border border-[#ddd] rounded text-[13px] font-medium hover:bg-white transition-colors">
              1:1 문의하기
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
