import { SupplierPricing } from '@/types'

// Generate supplier pricing for multiple suppliers selling the same products
// This demonstrates that different suppliers can offer different prices for the same product
export const mockSupplierPricing: SupplierPricing[] = [
    // TechPro Distributors Ltd (supplier_id: 1) - Electronics supplier
    {
        supplier_pricing_id: 1,
        supplier_id: 1,
        supplier_name: "TechPro Distributors Ltd",
        product_id: 1,
        sku: "ELEC-001",
        product_name: "Wireless Mouse",
        product_type: "sale",
        price: 18.99,
        effective_from: "2024-01-01"
    },
    {
        supplier_pricing_id: 2,
        supplier_id: 1,
        supplier_name: "TechPro Distributors Ltd",
        product_id: 4,
        sku: "ELEC-002",
        product_name: "Mechanical Keyboard",
        product_type: "sale",
        price: 24.99,
        effective_from: "2024-01-01"
    },
    {
        supplier_pricing_id: 3,
        supplier_id: 1,
        supplier_name: "TechPro Distributors Ltd",
        product_id: 6,
        sku: "ELEC-003",
        product_name: "USB-C Hub",
        product_type: "sale",
        price: 54.99,
        effective_from: "2024-01-01"
    },

    // Global Office Supplies (supplier_id: 2) - Office furniture and supplies
    {
        supplier_pricing_id: 4,
        supplier_id: 2,
        supplier_name: "Global Office Supplies",
        product_id: 2,
        sku: "FURN-045",
        product_name: "Office Chair",
        product_type: "sale",
        price: 189.99,
        effective_from: "2024-01-01"
    },
    {
        supplier_pricing_id: 5,
        supplier_id: 2,
        supplier_name: "Global Office Supplies",
        product_id: 5,
        sku: "FURN-046",
        product_name: "Standing Desk",
        product_type: "sale",
        price: 379.99,
        effective_from: "2024-01-01"
    },
    {
        supplier_pricing_id: 6,
        supplier_id: 2,
        supplier_name: "Global Office Supplies",
        product_id: 6,
        sku: "ELEC-003",
        product_name: "USB-C Hub",
        product_type: "sale",
        price: 1.26,
        effective_from: "2024-10-10"
    },

    // Premium Furniture Co (supplier_id: 3) - Furniture specialist
    {
        supplier_pricing_id: 7,
        supplier_id: 3,
        supplier_name: "Premium Furniture Co",
        product_id: 2,
        sku: "FURN-045",
        product_name: "Office Chair",
        product_type: "sale",
        price: 199.99,
        effective_from: "2024-01-01"
    },
    {
        supplier_pricing_id: 8,
        supplier_id: 3,
        supplier_name: "Premium Furniture Co",
        product_id: 5,
        sku: "FURN-046",
        product_name: "Standing Desk",
        product_type: "sale",
        price: 419.99,
        effective_from: "2024-01-01"
    },

    // Elite Electronics (supplier_id: 4) - Electronics and tech equipment
    {
        supplier_pricing_id: 9,
        supplier_id: 4,
        supplier_name: "Elite Electronics",
        product_id: 1,
        sku: "ELEC-001",
        product_name: "Wireless Mouse",
        product_type: "sale",
        price: 20.00,
        effective_from: "2024-01-01"
    },
    {
        supplier_pricing_id: 10,
        supplier_id: 4,
        supplier_name: "Elite Electronics",
        product_id: 4,
        sku: "ELEC-002",
        product_name: "Mechanical Keyboard",
        product_type: "sale",
        price: 27.99,
        effective_from: "2024-01-01"
    },
    {
        supplier_pricing_id: 11,
        supplier_id: 4,
        supplier_name: "Elite Electronics",
        product_id: 7,
        sku: "PROJ-001",
        product_name: "Professional Projector",
        product_type: "hire",
        daily_hire_rate: 45.00,
        effective_from: "2024-01-01"
    },
    {
        supplier_pricing_id: 12,
        supplier_id: 4,
        supplier_name: "Elite Electronics",
        product_id: 8,
        sku: "CAM-001",
        product_name: "DSLR Camera Kit",
        product_type: "hire",
        daily_hire_rate: 10.00,
        effective_from: "2024-11-01"
    },

    // Swift Logistics Partners (supplier_id: 5) - Event equipment
    {
        supplier_pricing_id: 13,
        supplier_id: 5,
        supplier_name: "Swift Logistics Partners",
        product_id: 7,
        sku: "PROJ-001",
        product_name: "Professional Projector",
        product_type: "hire",
        daily_hire_rate: 50.00,
        effective_from: "2024-01-01"
    },
    {
        supplier_pricing_id: 14,
        supplier_id: 5,
        supplier_name: "Swift Logistics Partners",
        product_id: 8,
        sku: "CAM-001",
        product_name: "DSLR Camera Kit",
        product_type: "hire",
        daily_hire_rate: 85.00,
        effective_from: "2024-01-01"
    },
    {
        supplier_pricing_id: 15,
        supplier_id: 5,
        supplier_name: "Swift Logistics Partners",
        product_id: 9,
        sku: "EVENT-001",
        product_name: "Event Tent 6x6m",
        product_type: "hire",
        daily_hire_rate: 125.00,
        effective_from: "2024-01-01"
    },

    // Northern Trade Supplies (supplier_id: 6) - General supplies (Inactive but has pricing)
    {
        supplier_pricing_id: 16,
        supplier_id: 6,
        supplier_name: "Northern Trade Supplies",
        product_id: 3,
        sku: "CLTH-102",
        product_name: "Cotton T-Shirt",
        product_type: "sale",
        price: 14.99,
        effective_from: "2024-01-01"
    },
    {
        supplier_pricing_id: 17,
        supplier_id: 6,
        supplier_name: "Northern Trade Supplies",
        product_id: 6,
        sku: "ELEC-003",
        product_name: "USB-C Hub",
        product_type: "sale",
        price: 49.99,
        effective_from: "2024-01-01"
    }
]
