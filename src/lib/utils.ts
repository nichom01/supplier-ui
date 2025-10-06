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

export function getProductImageUrl(imagePath?: string): string {
  // Import the no-image placeholder
  const noImageUrl = '/src/assets/images/products/no-image.svg'

  if (!imagePath) {
    return noImageUrl
  }

  // Return the path to the image - Vite will handle it
  return `/src/assets/images/products/${imagePath}`
}
