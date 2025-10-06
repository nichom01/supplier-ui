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
    price?: number  // Added for sales order functionality
}

// Customer types
export type Customer = {
    customer_id?: number
    name: string
    contact_person: string
    email: string
    phone: string
    shipping_address_name: string
    shipping_address_line1: string
    shipping_address_line2: string
    shipping_address_line3: string
    shipping_address_line4: string
    shipping_address_line5: string
    shipping_address_postcode: string
    billing_address_name: string
    billing_address_line1: string
    billing_address_line2: string
    billing_address_line3: string
    billing_address_line4: string
    billing_address_line5: string
    billing_address_postcode: string
    customer_type: string
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

export type CustomersResponse = {
    customers: Customer[]
}

export type ChartDataResponse = {
    monthly: MonthlyChartData[]
    daily: DailyChartData[]
    radar: RadarChartData[]
    pie: PieChartData[]
}

// Sales Order types
export type SalesOrder = {
    sales_order_id?: number
    customer_id: number
    order_date: string
    requested_delivery_date: string
    status: 'draft' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
    total_amount: number
    payment_terms: string
    shipping_method: string
    warehouse_id: number
}

export type SalesOrderLine = {
    line_id?: number
    sales_order_id?: number
    product_id: number
    quantity_ordered: number
    quantity_allocated: number
    quantity_shipped: number
    unit_price: number
    status: 'pending' | 'allocated' | 'shipped' | 'delivered'
}

// Shopping Cart types
export type CartItem = {
    product: Product
    quantity: number
}

export type Cart = {
    items: CartItem[]
    total: number
}

// Sales Order API Response types
export type SalesOrdersResponse = {
    orders: SalesOrder[]
}

export type SalesOrderWithLines = SalesOrder & {
    lines: SalesOrderLine[]
}
