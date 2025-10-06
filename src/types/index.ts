// Product types
export type Product = {
    product_id?: number
    sku: string
    name: string
    description: string
    weight: number
    volume: number
    category: string
    unit_of_measure: string
}

// Chart data types
export type MonthlyChartData = {
    month: string
    desktop: number
    mobile: number
}

export type DailyChartData = {
    date: string
    desktop: number
    mobile: number
}

export type RadarChartData = {
    category: string
    desktop: number
    mobile: number
}

export type PieChartData = {
    name: string
    value: number
    fill: string
}

// API Response types
export type ProductsResponse = {
    products: Product[]
}

export type ChartDataResponse = {
    monthly: MonthlyChartData[]
    daily: DailyChartData[]
    radar: RadarChartData[]
    pie: PieChartData[]
}
