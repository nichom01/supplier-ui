import { SalesOrder, SalesOrderLine } from "@/types"

export const mockSalesOrders: SalesOrder[] = [
    {
        sales_order_id: 1,
        customer_id: 1,
        order_date: "2025-10-01T10:30:00Z",
        requested_delivery_date: "2025-10-10T00:00:00Z",
        status: "confirmed",
        total_amount: 379.97,
        payment_terms: "Net 30",
        shipping_method: "Standard Ground",
        warehouse_id: 1
    },
    {
        sales_order_id: 2,
        customer_id: 2,
        order_date: "2025-10-03T14:15:00Z",
        requested_delivery_date: "2025-10-12T00:00:00Z",
        status: "pending",
        total_amount: 89.99,
        payment_terms: "Net 30",
        shipping_method: "Express",
        warehouse_id: 1
    }
]

export const mockSalesOrderLines: SalesOrderLine[] = [
    // Order 1 lines
    {
        line_id: 1,
        sales_order_id: 1,
        product_id: 1,
        quantity_ordered: 3,
        quantity_allocated: 3,
        quantity_shipped: 3,
        unit_price: 29.99,
        status: "delivered"
    },
    {
        line_id: 2,
        sales_order_id: 1,
        product_id: 2,
        quantity_ordered: 1,
        quantity_allocated: 1,
        quantity_shipped: 1,
        unit_price: 249.99,
        status: "delivered"
    },
    {
        line_id: 3,
        sales_order_id: 1,
        product_id: 3,
        quantity_ordered: 5,
        quantity_allocated: 5,
        quantity_shipped: 5,
        unit_price: 19.99,
        status: "delivered"
    },
    // Order 2 lines
    {
        line_id: 4,
        sales_order_id: 2,
        product_id: 4,
        quantity_ordered: 1,
        quantity_allocated: 0,
        quantity_shipped: 0,
        unit_price: 89.99,
        status: "pending"
    }
]
