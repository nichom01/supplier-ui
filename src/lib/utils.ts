import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { appConfig } from "@/config/app"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | undefined): string {
  if (value === undefined) return '-'

  const { symbol, locale, code } = appConfig.currency

  // Use Intl.NumberFormat for proper currency formatting
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
  })

  return formatter.format(value)
}

export function getProductImageUrl(sku?: string, imageIndex?: number): string {
  // Import the no-image placeholder
  const noImageUrl = '/src/assets/images/products/no-image.svg'

  if (!sku) {
    return noImageUrl
  }

  // Build image path using SKU convention
  // Main image: SKU.jpg (e.g., ELEC-001.jpg)
  // Sub-images: SKU-N.jpg (e.g., ELEC-001-1.jpg, ELEC-001-2.jpg)
  const imageName = imageIndex ? `${sku}-${imageIndex}` : sku

  // Try common image extensions - browsers will display the first one that exists
  // For now, default to .jpg but the actual file could be .jpg, .png, .webp, etc.
  return `/src/assets/images/products/${imageName}.jpg`
}

export function getProductImageUrls(sku?: string, maxImages: number = 5): string[] {
  if (!sku) {
    return [getProductImageUrl()]
  }

  const urls: string[] = [getProductImageUrl(sku)]

  // Add potential sub-images
  for (let i = 1; i <= maxImages; i++) {
    urls.push(getProductImageUrl(sku, i))
  }

  return urls
}
