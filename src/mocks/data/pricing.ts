import { DefaultPricing } from '@/types'

export const mockPricing: DefaultPricing[] = [
    {
        pricing_id: 1,
        product_id: 1,
        sku: "WGT-001",
        product_name: "Wireless Gaming Mouse",
        product_type: "sale",
        price: 29.99,
        effective_from: "2024-01-01"
    },
    {
        pricing_id: 2,
        product_id: 2,
        sku: "CHR-002",
        product_name: "Ergonomic Office Chair",
        product_type: "sale",
        price: 249.99,
        effective_from: "2024-01-01"
    },
    {
        pricing_id: 3,
        product_id: 3,
        sku: "TST-001",
        product_name: "Premium Cotton T-Shirt",
        product_type: "sale",
        price: 19.99,
        effective_from: "2024-01-01"
    },
    {
        pricing_id: 4,
        product_id: 4,
        sku: "LMP-001",
        product_name: "LED Desk Lamp",
        product_type: "sale",
        price: 89.99,
        effective_from: "2024-01-01"
    },
    {
        pricing_id: 5,
        product_id: 5,
        sku: "DSK-001",
        product_name: "Standing Desk",
        product_type: "sale",
        price: 499.99,
        effective_from: "2024-01-01"
    },
    {
        pricing_id: 6,
        product_id: 6,
        sku: "KBD-001",
        product_name: "Mechanical Keyboard",
        product_type: "sale",
        price: 39.99,
        effective_from: "2024-01-01"
    },
    {
        pricing_id: 7,
        product_id: 7,
        sku: "PROJ-001",
        product_name: "Professional Projector",
        product_type: "hire",
        daily_hire_rate: 75.00,
        effective_from: "2024-01-01"
    },
    {
        pricing_id: 8,
        product_id: 8,
        sku: "CAM-001",
        product_name: "DSLR Camera Kit",
        product_type: "hire",
        daily_hire_rate: 120.00,
        effective_from: "2024-01-01"
    },
    {
        pricing_id: 9,
        product_id: 9,
        sku: "EVENT-001",
        product_name: "Event Tent 6x6m",
        product_type: "hire",
        daily_hire_rate: 200.00,
        effective_from: "2024-01-01"
    }
]
