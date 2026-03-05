import Link from 'next/link';
import { Product } from '@/types/product';
import SafeImage from '@/components/ui/SafeImage';
import { IconLocation } from '@/components/ui/Icons';
import { StarIcon } from '@heroicons/react/24/solid';

interface ProductCardType1Props {
  product: Product;
}

export default function ProductCardType1({ product }: ProductCardType1Props) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="block w-full group hover:-translate-y-2 transition-all duration-300"
    >
      <div className="relative w-full rounded-3xl overflow-hidden cursor-pointer shadow-soft group-hover:shadow-strong transition-all duration-300">
        {/* 이미지 */}
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <SafeImage
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 392px"
          />
          {/* 그라디언트 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        {/* 글래스 정보 패널 */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          {/* 카테고리 배지 */}
          {product.category && (
            <span className="inline-block mb-2 px-2.5 py-0.5 glass rounded-full text-white/80 text-[10px] font-bold uppercase tracking-wider">
              {product.category}
            </span>
          )}

          <h3 className="text-white text-[17px] font-bold leading-snug drop-shadow-lg line-clamp-2 mb-2">
            {product.title}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-white/75">
              <IconLocation className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-[12px] font-medium">
                {product.location} · {product.duration}
              </span>
            </div>
            {product.rating != null && (
              <div className="flex items-center gap-1">
                <StarIcon className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-white text-[12px] font-bold">{Number(product.rating).toFixed(1)}</span>
              </div>
            )}
          </div>

          <p className="text-white text-[20px] font-bold drop-shadow-lg mt-2">
            ₩{product.price.toLocaleString()}~
          </p>
        </div>
      </div>
    </Link>
  );
}
