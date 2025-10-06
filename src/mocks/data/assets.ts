import { Asset, AssetAvailability } from "@/types"

export const mockAssets: Asset[] = [
    // Projector assets (product_id: 7)
    {
        asset_id: 1,
        product_id: 7,
        asset_tag: "PROJ-001-A",
        serial_number: "PRJ2024001",
        status: "available",
        purchase_date: "2024-01-15T00:00:00Z",
        condition: "new"
    },
    {
        asset_id: 2,
        product_id: 7,
        asset_tag: "PROJ-001-B",
        serial_number: "PRJ2024002",
        status: "available",
        purchase_date: "2024-02-20T00:00:00Z",
        condition: "new"
    },
    {
        asset_id: 3,
        product_id: 7,
        asset_tag: "PROJ-001-C",
        serial_number: "PRJ2023015",
        status: "available",
        purchase_date: "2023-11-10T00:00:00Z",
        condition: "good"
    },
    // Camera assets (product_id: 8)
    {
        asset_id: 4,
        product_id: 8,
        asset_tag: "CAM-001-A",
        serial_number: "CAM2024005",
        status: "available",
        purchase_date: "2024-03-01T00:00:00Z",
        condition: "new"
    },
    {
        asset_id: 5,
        product_id: 8,
        asset_tag: "CAM-001-B",
        serial_number: "CAM2023020",
        status: "available",
        purchase_date: "2023-12-15T00:00:00Z",
        condition: "good"
    },
    // Event Tent assets (product_id: 9)
    {
        asset_id: 6,
        product_id: 9,
        asset_tag: "TENT-001-A",
        serial_number: "TNT2024010",
        status: "available",
        purchase_date: "2024-04-01T00:00:00Z",
        condition: "new"
    },
    {
        asset_id: 7,
        product_id: 9,
        asset_tag: "TENT-001-B",
        serial_number: "TNT2023025",
        status: "on_hire",
        purchase_date: "2023-10-05T00:00:00Z",
        condition: "good"
    },
    {
        asset_id: 8,
        product_id: 9,
        asset_tag: "TENT-001-C",
        serial_number: "TNT2024015",
        status: "available",
        purchase_date: "2024-05-10T00:00:00Z",
        condition: "new"
    }
]

// Helper function to generate availability for assets
// For simplicity, we'll mark specific dates as unavailable for testing
export const mockAssetAvailability: AssetAvailability[] = [
    // Asset 7 (TENT-001-B) is on hire from Oct 10-15, 2025
    {
        asset_id: 7,
        date: "2025-10-10",
        is_available: false,
        sales_order_id: 3
    },
    {
        asset_id: 7,
        date: "2025-10-11",
        is_available: false,
        sales_order_id: 3
    },
    {
        asset_id: 7,
        date: "2025-10-12",
        is_available: false,
        sales_order_id: 3
    },
    {
        asset_id: 7,
        date: "2025-10-13",
        is_available: false,
        sales_order_id: 3
    },
    {
        asset_id: 7,
        date: "2025-10-14",
        is_available: false,
        sales_order_id: 3
    },
    {
        asset_id: 7,
        date: "2025-10-15",
        is_available: false,
        sales_order_id: 3
    }
]
