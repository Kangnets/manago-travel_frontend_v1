import Link from 'next/link';
import { Product } from '@/types/product';
import SafeImage from '@/components/ui/SafeImage';
import { IconStar } from '@/components/ui/Icons';

interface ProductCardType3Props {
  product: Product;
}

export default function ProductCardType3({ product }: ProductCardType3Props) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="block w-full group hover:-translate-y-2 transition-all duration-300"
    >
      <div className="w-full flex flex-col overflow-hidden rounded-2xl glass-card border border-white/60 hover:shadow-strong transition-all cursor-pointer">
        {/* 이미지 */}
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          <SafeImage
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="308px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* 텍스트 */}
        <div className="flex flex-col gap-2 p-4">
          <h3 className="text-gray-900 text-[14px] sm:text-[15px] font-bold leading-snug line-clamp-2 min-h-[2.8em]">
            {product.title}
          </h3>
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100/60">
            {product.rating != null && (
              <div className="flex items-center gap-1">
                <IconStar className="w-3.5 h-3.5 flex-shrink-0 text-yellow-500" />
                <span className="text-[13px] font-bold text-gray-700">
                  {Number(product.rating).toFixed(1)}
                </span>
              </div>
            )}
            <p className="text-black text-[16px] font-bold ml-auto">
              ₩{product.price.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
