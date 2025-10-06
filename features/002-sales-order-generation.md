Sales order generation
----------------------

This process should replicate the amazon process whereby you:


1. search the product list to retrieve a product list
2. select a product to go into detailed product page
3. add to basket
4. iterate through 1-3 adding further products and qty
5. select the basket
6. submit order
7. complete stage 2 - selecting / inputting the customer and address
8. create sales order and lines

data structure as follows:

SALES_ORDER {
        int sales_order_id PK
        int customer_id FK
        datetime order_date
        datetime requested_delivery_date
        string status
        float total_amount
        string payment_terms
        string shipping_method
        int warehouse_id FK
    }

    SALES_ORDER_LINE {
        int line_id PK
        int sales_order_id FK
        int product_id FK
        int quantity_ordered
        int quantity_allocated
        int quantity_shipped
        float unit_price
        string status
    }

