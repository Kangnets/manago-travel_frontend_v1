import Link from 'next/link';
import { Product } from '@/types/product';
import SafeImage from '@/components/ui/SafeImage';
import { IconLocation, IconStar } from '@/components/ui/Icons';

interface ProductCardType2Props {
  product: Product;
}

export default function ProductCardType2({ product }: ProductCardType2Props) {
  const hasDiscount = product.originalPrice != null && product.originalPrice > product.price;

  return (
    <Link href={`/products/${product.id}`} className="block w-full max-w-[530px]">
      <div className="w-full flex flex-col gap-6 group cursor-pointer">
        <div className="relative w-full aspect-[530/270] bg-primary-lightGray rounded-[20px] overflow-hidden">
          <SafeImage
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 600px) 100vw, 530px"
          />
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-black text-[18px] sm:text-[20px] md:text-[22px] font-pretendard font-semibold leading-tight line-clamp-2">
            {product.title}
          </h3>

          {product.rating != null && (
            <div className="flex items-center gap-1.5 text-primary-yellow">
              <IconStar className="w-4 h-4" />
              <span className="text-[16px] sm:text-[18px] font-pretendard font-medium">
                {Number(product.rating).toFixed(1)}
              </span>
            </div>
          )}

          <div className="flex items-end justify-between mt-4 sm:mt-5">
            <div className="flex items-center gap-1.5 text-primary-gray min-w-0">
              <IconLocation className="w-4 h-4 flex-shrink-0" />
              <span className="text-[14px] sm:text-[15px] font-pretendard font-medium truncate">
                {product.country} · {product.duration}
              </span>
            </div>
            <div className="flex flex-col items-end flex-shrink-0">
              {hasDiscount && (
                <p className="text-primary-gray text-[16px] sm:text-[18px] font-pretendard font-medium line-through">
                  ₩{product.originalPrice?.toLocaleString()}
                </p>
              )}
              <p className="text-black text-[20px] sm:text-[22px] font-pretendard font-semibold">
                ₩{product.price.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
