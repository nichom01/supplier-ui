Customer data maintenance
-------------------------

in the exact style of product maintenance could you create a customer maintenance page using the following fields:

CUSTOMER {
        int customer_id PK
        string name
        string contact_person
        string email
        string phone
        string shipping_address
        string billing_address
        string customer_type
    }

    and to start with all address fields will be held on this record:

    address name
    line 1-5
    postcode
