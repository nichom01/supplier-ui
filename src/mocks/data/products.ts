import { Product } from "@/types"

export const mockProducts: Product[] = [
    {
        product_id: 1,
        sku: "ELEC-001",
        name: "Wireless Mouse",
        description: "Ergonomic wireless mouse with 2.4GHz connectivity",
        weight: 0.15,
        volume: 0.5,
        category: "Electronics",
        unit_of_measure: "piece"
    },
    {
        product_id: 2,
        sku: "FURN-045",
        name: "Office Chair",
        description: "Adjustable office chair with lumbar support",
        weight: 12.5,
        volume: 2.3,
        category: "Furniture",
        unit_of_measure: "piece"
    },
    {
        product_id: 3,
        sku: "CLTH-102",
        name: "Cotton T-Shirt",
        description: "100% organic cotton t-shirt, various sizes",
        weight: 0.2,
        volume: 0.1,
        category: "Clothing",
        unit_of_measure: "piece"
    }
]
