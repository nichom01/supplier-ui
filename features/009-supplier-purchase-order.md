Supplier purchase orders
------------------------

This should be implemented in a similar way to customer sales orders with the exception of the supplier must be selected first and then products added to
the basket as a purchase order can only be for one supplier and hence once the supplier is selected then the products must be filtered by that supplier.

the data structure should be as follows:

PURCHASE_ORDER {
        int po_id PK
        int supplier_id FK
        datetime order_date
        datetime deliver_date
        string status
        float total_amount
    }

    PO_LINE_ITEM {
        int line_item_id PK
        int po_id FK
        int product_id FK
        int quantity_ordered
        float unit_price
        string status
    }

    