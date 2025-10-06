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
    price?: number  // For sale products - price per unit
    product_type: 'sale' | 'hire'  // Determines if product is for sale or hire
    daily_hire_rate?: number  // For hire products - daily rental rate
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
    quantity_ordered: number  // For hire products, this represents days
    quantity_allocated: number
    quantity_shipped: number
    unit_price: number  // For hire products, this is the daily rate
    status: 'pending' | 'allocated' | 'shipped' | 'delivered'
    line_type?: 'sale' | 'hire'  // Determines if this is a sale or hire line
    asset_id?: number  // For hire products, links to specific asset
    hire_start_date?: string  // For hire products, start date of rental
    hire_end_date?: string  // For hire products, end date of rental
}

// Asset types (for hire products)
export type Asset = {
    asset_id?: number
    product_id: number
    asset_tag: string
    serial_number?: string
    status: 'available' | 'on_hire' | 'maintenance' | 'retired'
    purchase_date: string
    condition: 'new' | 'good' | 'fair' | 'poor'
}

export type AssetAvailability = {
    asset_id: number
    date: string
    is_available: boolean
    sales_order_id?: number  // If booked, which order
}

// Shopping Cart types
export type BasketItem = {
    product: Product
    quantity: number
    hire_start_date?: string  // For hire products
    hire_end_date?: string  // For hire products
    asset_id?: number  // For hire products, selected asset
}

export type Basket = {
    items: BasketItem[]
    total: number
}

// Sales Order API Response types
export type SalesOrdersResponse = {
    orders: SalesOrder[]
}

export type SalesOrderWithLines = SalesOrder & {
    lines: SalesOrderLine[]
}

// Authentication types
export type UserRole = 'user' | 'employee' | 'admin'

export type User = {
    user_id: number
    email: string
    name: string
    role: UserRole
}

export type AuthCredentials = {
    email: string
    password: string
}

export type SignUpData = {
    email: string
    password: string
    name: string
}

export type AuthResponse = {
    user: User
    token: string
}

export type AuthError = {
    message: string
}
