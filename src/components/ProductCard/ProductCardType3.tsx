import Link from 'next/link';
import { Product } from '@/types/product';
import SafeImage from '@/components/ui/SafeImage';
import { IconStar } from '@/components/ui/Icons';

interface ProductCardType3Props {
  product: Product;
}

export default function ProductCardType3({ product }: ProductCardType3Props) {
  return (
    <Link href={`/products/${product.id}`} className="block w-full max-w-[308px]">
      <div className="w-full flex flex-col gap-3 group cursor-pointer">
        <div className="relative w-full aspect-[308/157] bg-primary-lightGray rounded-[16px] overflow-hidden">
          <SafeImage
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="308px"
          />
        </div>

        <div className="flex flex-col gap-0.5">
          <h3 className="text-black text-[15px] sm:text-[16px] font-pretendard font-semibold leading-tight line-clamp-2">
            {product.title}
          </h3>
          <div className="flex items-center justify-between gap-2">
            {product.rating != null && (
              <div className="flex items-center gap-1 text-primary-yellow">
                <IconStar className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-[14px] font-pretendard font-medium">
                  {Number(product.rating).toFixed(1)}
                </span>
              </div>
            )}
            <p className="text-black text-[16px] sm:text-[18px] font-pretendard font-semibold tracking-tight ml-auto">
              ₩{product.price.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
