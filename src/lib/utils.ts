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
