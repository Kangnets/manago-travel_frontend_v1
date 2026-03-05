import Link from 'next/link';
import { Product } from '@/types/product';
import SafeImage from '@/components/ui/SafeImage';
import { IconLocation, IconStar } from '@/components/ui/Icons';

interface ProductCardType2Props {
  product: Product;
}

export default function ProductCardType2({ product }: ProductCardType2Props) {
  const hasDiscount = product.originalPrice != null && product.originalPrice > product.price;
  const discountRate = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="block w-full group hover:-translate-y-2 transition-all duration-300"
    >
      {/* 글래스 카드 컨테이너 */}
      <div className="w-full flex flex-col overflow-hidden rounded-3xl glass-card hover:shadow-strong transition-all border border-white/50">
        {/* 이미지 */}
        <div className="relative w-full aspect-[16/10] overflow-hidden">
          <SafeImage
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 600px) 100vw, 530px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          {hasDiscount && (
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#ffa726] text-white rounded-xl text-[13px] font-bold shadow-lg">
              {discountRate}% OFF
            </div>
          )}
          {product.rating != null && (
            <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 glass rounded-full">
              <IconStar className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-white text-[12px] font-bold">{Number(product.rating).toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* 정보 영역 */}
        <div className="flex flex-col gap-2 p-5">
          <h3 className="text-gray-900 text-[17px] font-bold leading-snug line-clamp-2">
            {product.title}
          </h3>

          <div className="flex items-center gap-1.5 text-gray-500">
            <IconLocation className="w-4 h-4 flex-shrink-0" />
            <span className="text-[13px] font-medium truncate">
              {product.location} · {product.duration}
            </span>
          </div>

          <div className="flex items-end justify-between mt-2 pt-3 border-t border-gray-100">
            <div>
              {hasDiscount && (
                <p className="text-gray-400 text-[13px] font-medium line-through">
                  ₩{product.originalPrice?.toLocaleString()}
                </p>
              )}
              <p className="text-black text-[22px] font-bold leading-none">
                ₩{product.price.toLocaleString()}
              </p>
            </div>
            <span className="text-xs text-gray-400 font-medium pb-0.5">/ 1인</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
