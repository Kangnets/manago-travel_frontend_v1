'use client';

import Link from 'next/link';
import SafeImage from '@/components/ui/SafeImage';
import { 
  InformationCircleIcon, 
  MapPinIcon, 
  TrophyIcon, 
  BeakerIcon 
} from '@heroicons/react/24/outline';

const BASE = 'https://images.unsplash.com';

interface GuideItem {
  id: string;
  category: string;
  title: string;
  imageUrl: string;
  Icon: any;
  color: string;
}

const guides: GuideItem[] = [
  { 
    id: '1', 
    category: '여행 준비', 
    title: '푸꾸옥 여행 전 꼭 알아야 할 10가지', 
    // Vietnam travel preparation
    imageUrl: `${BASE}/photo-1713551584263-9881fefc5ad7?auto=format&fit=crop&w=600&q=80`,
    Icon: InformationCircleIcon,
    color: 'text-blue-600'
  },
  { 
    id: '2', 
    category: '맛집 탐방', 
    title: '푸꾸옥 로컬 맛집 BEST 10', 
    // Hanoi Market / Vietnamese food
    imageUrl: `${BASE}/photo-1496310646944-3203203f09bb?auto=format&fit=crop&w=600&q=80`,
    Icon: MapPinIcon,
    color: 'text-red-600'
  },
  { 
    id: '3', 
    category: '골프 가이드', 
    title: '푸꾸옥 프리미엄 골프장 완전정복', 
    // Golf course by ocean (Da Nang style)
    imageUrl: `${BASE}/photo-1766288020088-4b95f5409376?auto=format&fit=crop&w=600&q=80`,
    Icon: TrophyIcon,
    color: 'text-green-600'
  },
  { 
    id: '4', 
    category: '휴양지 추천', 
    title: '푸꾸옥에서 꼭 가봐야 할 휴양 스팟 7선', 
    // Phu Quoc lagoon / tropical beach
    imageUrl: `${BASE}/photo-1567115220168-93d296e55a0a?auto=format&fit=crop&w=600&q=80`,
    Icon: BeakerIcon,
    color: 'text-purple-600'
  },
];

export default function TravelGuide() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {guides.map((guide) => (
        <Link href={`/guide/${guide.id}`} key={guide.id} className="group cursor-pointer">
          <div className="flex flex-col gap-4 bg-white p-4 rounded-xl hover:shadow-2xl transition-all border border-gray-100">
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
              <SafeImage
                src={guide.imageUrl}
                alt={guide.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <guide.Icon className={`w-4 h-4 ${guide.color}`} />
                <span className={`text-[12px] font-bold ${guide.color}`}>{guide.category}</span>
              </div>
              <h3 className="text-[15px] font-bold text-gray-900 leading-snug group-hover:text-[#ffa726] transition-colors line-clamp-2">
                {guide.title}
              </h3>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
