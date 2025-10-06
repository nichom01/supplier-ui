import { PurchaseOrder, POLineItem } from "@/types"

export const mockPurchaseOrders: PurchaseOrder[] = [
    {
        po_id: 1,
        supplier_id: 1,
        order_date: "2025-10-01T09:00:00Z",
        delivery_date: "2025-10-15T00:00:00Z",
        status: "confirmed",
        total_amount: 299.94
    },
    {
        po_id: 2,
        supplier_id: 2,
        order_date: "2025-10-03T11:30:00Z",
        delivery_date: "2025-10-17T00:00:00Z",
        status: "pending",
        total_amount: 749.97
    },
    {
        po_id: 3,
        supplier_id: 3,
        order_date: "2025-10-04T14:00:00Z",
        delivery_date: "2025-10-20T00:00:00Z",
        status: "confirmed",
        total_amount: 1249.95
    },
    {
        po_id: 4,
        supplier_id: 1,
        order_date: "2025-10-05T10:15:00Z",
        delivery_date: "2025-10-18T00:00:00Z",
        status: "received",
        total_amount: 179.96
    }
]

export const mockPOLineItems: POLineItem[] = [
    // PO 1 lines (TechPro Distributors - Wireless Mouse & Keyboard)
    {
        line_item_id: 1,
        po_id: 1,
        product_id: 1, // Wireless Mouse
        quantity_ordered: 10,
        unit_price: 29.99,
        status: "confirmed"
    },
    // PO 2 lines (Global Office Supplies - Office Chairs)
    {
        line_item_id: 2,
        po_id: 2,
        product_id: 2, // Office Chair
        quantity_ordered: 3,
        unit_price: 249.99,
        status: "pending"
    },
    // PO 3 lines (Premium Furniture - Office Chair & Standing Desk)
    {
        line_item_id: 3,
        po_id: 3,
        product_id: 2, // Office Chair
        quantity_ordered: 2,
        unit_price: 249.99,
        status: "confirmed"
    },
    {
        line_item_id: 4,
        po_id: 3,
        product_id: 5, // Standing Desk
        quantity_ordered: 1,
        unit_price: 749.97,
        status: "confirmed"
    },
    // PO 4 lines (TechPro Distributors - Keyboards & Mice)
    {
        line_item_id: 5,
        po_id: 4,
        product_id: 4, // Mechanical Keyboard
        quantity_ordered: 2,
        unit_price: 89.98,
        status: "received"
    }
]
