import Link from 'next/link';
import { Product } from '@/types/product';
import SafeImage from '@/components/ui/SafeImage';
import { IconLocation } from '@/components/ui/Icons';

interface ProductCardType1Props {
  product: Product;
}

export default function ProductCardType1({ product }: ProductCardType1Props) {
  return (
    <Link href={`/products/${product.id}`} className="block w-full max-w-[392px]">
      <div className="relative w-full bg-primary-lightGray rounded-[18px] overflow-hidden group cursor-pointer">
        {/* 이미지 */}
        <div className="relative aspect-[862/575] w-full">
          <SafeImage
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 392px"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* 텍스트 콘텐츠 */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[320px] flex flex-col items-end gap-1.5">
          <div className="w-full flex flex-col gap-1">
            <h3 className="text-white text-[18px] sm:text-[20px] md:text-[22px] font-pretendard font-bold leading-tight drop-shadow-md line-clamp-2">
              {product.title}
            </h3>
            <div className="flex items-center gap-1 text-primary-yellow">
              <IconLocation className="w-4 h-4 flex-shrink-0" />
              <span className="text-[14px] sm:text-[15px] font-pretendard font-medium">
                {product.country} · {product.duration}
              </span>
            </div>
          </div>
          <p className="text-white text-[18px] sm:text-[20px] font-pretendard font-semibold drop-shadow-md">
            ₩{product.price.toLocaleString()}~
          </p>
        </div>
      </div>
    </Link>
  );
}
