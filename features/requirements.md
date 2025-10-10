# Backend API Requirements

## Overview

This document outlines the complete backend API requirements for the Supplier UI application. The backend should provide RESTful APIs to support product management, customer management, sales orders, purchase orders, asset tracking, pricing management, and authentication.

---

## Technology Stack Recommendations

- **Language**: Node.js (TypeScript) / Python / Go / Java
- **Framework**: Express.js / FastAPI / Gin / Spring Boot
- **Database**: PostgreSQL (recommended) / MySQL / MongoDB
- **Authentication**: JWT-based token authentication
- **Image Storage**: S3-compatible object storage or local filesystem
- **API Documentation**: OpenAPI/Swagger

---

## Database Schema

### 1. Products Table

```sql
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    weight DECIMAL(10,2),
    volume DECIMAL(10,2),
    category VARCHAR(100),
    unit_of_measure VARCHAR(50),
    product_type VARCHAR(10) CHECK (product_type IN ('sale', 'hire')),
    price DECIMAL(10,2),
    daily_hire_rate DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sku (sku),
    INDEX idx_category (category),
    INDEX idx_product_type (product_type)
);
```

### 2. Customers Table

```sql
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    shipping_address_name VARCHAR(255),
    shipping_address_line1 VARCHAR(255),
    shipping_address_line2 VARCHAR(255),
    shipping_address_line3 VARCHAR(255),
    shipping_address_line4 VARCHAR(255),
    shipping_address_line5 VARCHAR(255),
    shipping_address_postcode VARCHAR(20),
    billing_address_name VARCHAR(255),
    billing_address_line1 VARCHAR(255),
    billing_address_line2 VARCHAR(255),
    billing_address_line3 VARCHAR(255),
    billing_address_line4 VARCHAR(255),
    billing_address_line5 VARCHAR(255),
    billing_address_postcode VARCHAR(20),
    customer_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_customer_type (customer_type)
);
```

### 3. Sales Orders Table

```sql
CREATE TABLE sales_orders (
    sales_order_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(customer_id),
    order_date TIMESTAMP NOT NULL,
    requested_delivery_date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('draft', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL,
    payment_terms VARCHAR(100),
    shipping_method VARCHAR(100),
    warehouse_id INTEGER,
    order_discount_type VARCHAR(10) CHECK (order_discount_type IN ('percentage', 'fixed')),
    order_discount_value DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_customer_id (customer_id),
    INDEX idx_status (status),
    INDEX idx_order_date (order_date)
);
```

### 4. Sales Order Lines Table

```sql
CREATE TABLE sales_order_lines (
    line_id SERIAL PRIMARY KEY,
    sales_order_id INTEGER NOT NULL REFERENCES sales_orders(sales_order_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    quantity_ordered DECIMAL(10,2) NOT NULL,
    quantity_allocated DECIMAL(10,2) DEFAULT 0,
    quantity_shipped DECIMAL(10,2) DEFAULT 0,
    unit_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'allocated', 'shipped', 'delivered')),
    line_type VARCHAR(10) CHECK (line_type IN ('sale', 'hire')),
    asset_id INTEGER REFERENCES assets(asset_id),
    hire_start_date DATE,
    hire_end_date DATE,
    discount_type VARCHAR(10) CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sales_order_id (sales_order_id),
    INDEX idx_product_id (product_id),
    INDEX idx_asset_id (asset_id)
);
```

### 5. Assets Table (for hire products)

```sql
CREATE TABLE assets (
    asset_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    asset_tag VARCHAR(100) UNIQUE NOT NULL,
    serial_number VARCHAR(100),
    status VARCHAR(20) CHECK (status IN ('available', 'on_hire', 'maintenance', 'retired')),
    purchase_date DATE NOT NULL,
    condition VARCHAR(10) CHECK (condition IN ('new', 'good', 'fair', 'poor')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product_id (product_id),
    INDEX idx_asset_tag (asset_tag),
    INDEX idx_status (status)
);
```

### 6. Asset Availability Table

```sql
CREATE TABLE asset_availability (
    availability_id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES assets(asset_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    sales_order_id INTEGER REFERENCES sales_orders(sales_order_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (asset_id, date),
    INDEX idx_asset_id_date (asset_id, date),
    INDEX idx_date (date)
);
```

### 7. Users Table

```sql
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('user', 'employee', 'admin')) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);
```

### 8. Sessions Table (for JWT token management)

```sql
CREATE TABLE sessions (
    session_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);
```

### 9. Default Pricing Table

```sql
CREATE TABLE default_pricing (
    pricing_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    price DECIMAL(10,2),
    daily_hire_rate DECIMAL(10,2),
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product_id (product_id),
    INDEX idx_effective_dates (product_id, effective_from, effective_to)
);
```

### 10. Suppliers Table

```sql
CREATE TABLE suppliers (
    supplier_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_info TEXT,
    address_name VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    address_line3 VARCHAR(255),
    address_line4 VARCHAR(255),
    address_line5 VARCHAR(255),
    address_postcode VARCHAR(20),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status)
);
```

### 11. Supplier Pricing Table

```sql
CREATE TABLE supplier_pricing (
    supplier_pricing_id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(supplier_id),
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    price DECIMAL(10,2),
    daily_hire_rate DECIMAL(10,2),
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_supplier_product (supplier_id, product_id),
    INDEX idx_effective_dates (supplier_id, product_id, effective_from, effective_to)
);
```

### 12. Purchase Orders Table

```sql
CREATE TABLE purchase_orders (
    po_id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(supplier_id),
    order_date TIMESTAMP NOT NULL,
    delivery_date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('draft', 'pending', 'confirmed', 'received', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_supplier_id (supplier_id),
    INDEX idx_status (status),
    INDEX idx_order_date (order_date)
);
```

### 13. Purchase Order Line Items Table

```sql
CREATE TABLE po_line_items (
    line_item_id SERIAL PRIMARY KEY,
    po_id INTEGER NOT NULL REFERENCES purchase_orders(po_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    quantity_ordered DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'received', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_po_id (po_id),
    INDEX idx_product_id (product_id)
);
```

---

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "user_id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "token": "jwt_token_here"
}
```

**Error Responses:**
- `409 Conflict`: Email already registered
- `400 Bad Request`: Invalid input data

---

#### POST `/api/auth/signin`
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "user": {
    "user_id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "token": "jwt_token_here"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials

---

#### POST `/api/auth/signout`
Invalidate current session token.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (204):** No content

---

#### GET `/api/auth/me`
Get current authenticated user information.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "user": {
    "user_id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired token

---

### Product Endpoints

#### GET `/api/products`
Retrieve all products.

**Query Parameters:**
- `product_type` (optional): Filter by 'sale' or 'hire'
- `category` (optional): Filter by category
- `search` (optional): Search by SKU or name

**Response (200):**
```json
{
  "products": [
    {
      "product_id": 1,
      "sku": "PROD-001",
      "name": "Product Name",
      "description": "Product description",
      "weight": 10.5,
      "volume": 5.2,
      "category": "Category A",
      "unit_of_measure": "each",
      "product_type": "sale",
      "price": 99.99,
      "daily_hire_rate": null
    }
  ]
}
```

---

#### GET `/api/products/:id`
Retrieve a single product by ID.

**Response (200):**
```json
{
  "product_id": 1,
  "sku": "PROD-001",
  "name": "Product Name",
  "description": "Product description",
  "weight": 10.5,
  "volume": 5.2,
  "category": "Category A",
  "unit_of_measure": "each",
  "product_type": "sale",
  "price": 99.99,
  "daily_hire_rate": null
}
```

**Error Responses:**
- `404 Not Found`: Product does not exist

---

#### POST `/api/products`
Create a new product.

**Request Body:**
```json
{
  "sku": "PROD-002",
  "name": "New Product",
  "description": "Description",
  "weight": 5.0,
  "volume": 2.5,
  "category": "Category B",
  "unit_of_measure": "each",
  "product_type": "hire",
  "daily_hire_rate": 25.00
}
```

**Response (201):** Returns created product with `product_id`

**Error Responses:**
- `400 Bad Request`: Invalid input data
- `409 Conflict`: SKU already exists

---

#### PUT `/api/products/:id`
Update an existing product.

**Request Body:** Same as POST (partial updates allowed)

**Response (200):** Returns updated product

**Error Responses:**
- `404 Not Found`: Product does not exist
- `400 Bad Request`: Invalid input data

---

#### DELETE `/api/products/:id`
Delete a product.

**Response (204):** No content

**Error Responses:**
- `404 Not Found`: Product does not exist
- `409 Conflict`: Product is referenced in orders

---

### Customer Endpoints

#### GET `/api/customers`
Retrieve all customers.

**Query Parameters:**
- `customer_type` (optional): Filter by customer type
- `search` (optional): Search by name or email

**Response (200):**
```json
{
  "customers": [
    {
      "customer_id": 1,
      "name": "Customer Name",
      "contact_person": "John Doe",
      "email": "customer@example.com",
      "phone": "+1234567890",
      "shipping_address_name": "Warehouse",
      "shipping_address_line1": "123 Street",
      "shipping_address_line2": "",
      "shipping_address_line3": "",
      "shipping_address_line4": "City",
      "shipping_address_line5": "State",
      "shipping_address_postcode": "12345",
      "billing_address_name": "Office",
      "billing_address_line1": "456 Avenue",
      "billing_address_line2": "",
      "billing_address_line3": "",
      "billing_address_line4": "City",
      "billing_address_line5": "State",
      "billing_address_postcode": "12345",
      "customer_type": "retail"
    }
  ]
}
```

---

#### GET `/api/customers/:id`
Retrieve a single customer by ID.

**Response (200):** Returns customer object

**Error Responses:**
- `404 Not Found`: Customer does not exist

---

#### POST `/api/customers`
Create a new customer.

**Request Body:** Customer object (same structure as GET response)

**Response (201):** Returns created customer with `customer_id`

---

#### PUT `/api/customers/:id`
Update an existing customer.

**Request Body:** Customer object (partial updates allowed)

**Response (200):** Returns updated customer

---

#### DELETE `/api/customers/:id`
Delete a customer.

**Response (204):** No content

**Error Responses:**
- `404 Not Found`: Customer does not exist
- `409 Conflict`: Customer has orders

---

### Sales Order Endpoints

#### GET `/api/sales-orders`
Retrieve all sales orders.

**Query Parameters:**
- `customer_id` (optional): Filter by customer
- `status` (optional): Filter by status
- `from_date` (optional): Filter by order date (start)
- `to_date` (optional): Filter by order date (end)

**Response (200):**
```json
{
  "orders": [
    {
      "sales_order_id": 1,
      "customer_id": 1,
      "order_date": "2025-01-15T10:30:00Z",
      "requested_delivery_date": "2025-01-20",
      "status": "pending",
      "total_amount": 1250.00,
      "payment_terms": "Net 30",
      "shipping_method": "Standard",
      "warehouse_id": 1,
      "order_discount_type": "percentage",
      "order_discount_value": 10
    }
  ]
}
```

---

#### GET `/api/sales-orders/:id`
Retrieve a single sales order with line items.

**Response (200):**
```json
{
  "sales_order_id": 1,
  "customer_id": 1,
  "order_date": "2025-01-15T10:30:00Z",
  "requested_delivery_date": "2025-01-20",
  "status": "pending",
  "total_amount": 1250.00,
  "payment_terms": "Net 30",
  "shipping_method": "Standard",
  "warehouse_id": 1,
  "order_discount_type": "percentage",
  "order_discount_value": 10,
  "lines": [
    {
      "line_id": 1,
      "sales_order_id": 1,
      "product_id": 10,
      "quantity_ordered": 5,
      "quantity_allocated": 0,
      "quantity_shipped": 0,
      "unit_price": 250.00,
      "status": "pending",
      "line_type": "sale",
      "discount_type": "fixed",
      "discount_value": 10.00
    }
  ]
}
```

---

#### POST `/api/sales-orders`
Create a new sales order from basket.

**Request Body:**
```json
{
  "customer_id": 1,
  "requested_delivery_date": "2025-01-20",
  "payment_terms": "Net 30",
  "shipping_method": "Standard",
  "warehouse_id": 1
}
```

**Note:** This endpoint should retrieve basket items from session/context and convert them to order lines.

**Response (201):** Returns created order with lines

---

#### PATCH `/api/sales-orders/:id`
Update sales order status or other fields.

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Response (200):** Returns updated order

---

### Shopping Basket Endpoints

#### GET `/api/basket`
Retrieve current user's basket.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "items": [
    {
      "product": {
        "product_id": 10,
        "sku": "PROD-010",
        "name": "Product Name",
        "product_type": "sale",
        "price": 100.00
      },
      "quantity": 2,
      "discount_type": "percentage",
      "discount_value": 5
    }
  ],
  "total": 190.00,
  "order_discount_type": "fixed",
  "order_discount_value": 10.00
}
```

---

#### POST `/api/basket`
Add item to basket.

**Request Body:**
```json
{
  "product_id": 10,
  "quantity": 2,
  "hire_start_date": "2025-02-01",
  "hire_end_date": "2025-02-05",
  "asset_id": 5
}
```

**Response (200):** Returns updated basket

**Error Responses:**
- `404 Not Found`: Product not found
- `409 Conflict`: Asset already booked for those dates

---

#### PUT `/api/basket/:productId`
Update basket item quantity.

**Request Body:**
```json
{
  "quantity": 5
}
```

**Response (200):** Returns updated basket

---

#### PUT `/api/basket/:productId/discount`
Update line item discount.

**Request Body:**
```json
{
  "discount_type": "percentage",
  "discount_value": 10
}
```

**Response (200):** Returns updated basket

---

#### PUT `/api/basket/discount`
Update order-level discount.

**Request Body:**
```json
{
  "discount_type": "fixed",
  "discount_value": 25.00
}
```

**Response (200):** Returns updated basket

---

#### DELETE `/api/basket/:productId`
Remove item from basket.

**Response (200):** Returns updated basket

---

#### DELETE `/api/basket`
Clear entire basket.

**Response (200):** Returns empty basket

---

### Asset Endpoints

#### GET `/api/assets`
Retrieve all assets or filter by product.

**Query Parameters:**
- `product_id` (optional): Filter by product
- `status` (optional): Filter by status

**Response (200):**
```json
{
  "assets": [
    {
      "asset_id": 1,
      "product_id": 5,
      "asset_tag": "AST-001",
      "serial_number": "SN123456",
      "status": "available",
      "purchase_date": "2024-01-01",
      "condition": "good"
    }
  ]
}
```

---

#### GET `/api/assets/:id`
Retrieve single asset.

**Response (200):** Returns asset object

---

#### GET `/api/assets/availability`
Check availability of assets for a product between dates.

**Query Parameters:**
- `product_id` (required)
- `start_date` (required): YYYY-MM-DD
- `end_date` (required): YYYY-MM-DD

**Response (200):**
```json
{
  "available_assets": [
    {
      "asset_id": 1,
      "product_id": 5,
      "asset_tag": "AST-001",
      "serial_number": "SN123456",
      "status": "available",
      "purchase_date": "2024-01-01",
      "condition": "good"
    }
  ]
}
```

---

#### GET `/api/assets/:id/availability`
Get availability calendar for a specific asset.

**Query Parameters:**
- `start_date` (optional): YYYY-MM-DD
- `end_date` (optional): YYYY-MM-DD

**Response (200):**
```json
{
  "availability": [
    {
      "asset_id": 1,
      "date": "2025-02-01",
      "is_available": true,
      "sales_order_id": null
    },
    {
      "asset_id": 1,
      "date": "2025-02-02",
      "is_available": false,
      "sales_order_id": 123
    }
  ]
}
```

---

### Pricing Endpoints

#### GET `/api/pricing`
Retrieve all active default pricing.

**Response (200):**
```json
{
  "pricing": [
    {
      "pricing_id": 1,
      "product_id": 10,
      "sku": "PROD-010",
      "product_name": "Product Name",
      "product_type": "sale",
      "price": 100.00,
      "effective_from": "2025-01-01",
      "effective_to": null
    }
  ]
}
```

---

#### GET `/api/pricing/:productId`
Retrieve pricing for a specific product.

**Response (200):** Returns pricing object

---

#### PUT `/api/pricing/:productId`
Update pricing for a product (creates new pricing record and archives old).

**Request Body:**
```json
{
  "product_id": 10,
  "price": 120.00,
  "effective_from": "2025-02-01"
}
```

**Response (200):** Returns new pricing record

---

#### POST `/api/pricing/bulk`
Bulk update pricing for multiple products.

**Request Body:**
```json
{
  "updates": [
    {
      "product_id": 10,
      "price": 120.00,
      "effective_from": "2025-02-01"
    },
    {
      "product_id": 15,
      "daily_hire_rate": 35.00,
      "effective_from": "2025-02-01"
    }
  ]
}
```

**Response (200):**
```json
{
  "success": 2,
  "failed": 0,
  "results": [...],
  "errors": []
}
```

---

### Supplier Endpoints

#### GET `/api/suppliers`
Retrieve all suppliers.

**Query Parameters:**
- `status` (optional): Filter by status

**Response (200):**
```json
{
  "suppliers": [
    {
      "supplier_id": 1,
      "name": "Supplier Co.",
      "contact_info": "contact@supplier.com",
      "address_name": "Main Office",
      "address_line1": "123 Supplier St",
      "address_line2": "",
      "address_line3": "",
      "address_line4": "City",
      "address_line5": "State",
      "address_postcode": "12345",
      "status": "active"
    }
  ]
}
```

---

#### GET `/api/suppliers/:id`
Retrieve single supplier.

**Response (200):** Returns supplier object

---

#### POST `/api/suppliers`
Create a new supplier.

**Request Body:** Supplier object

**Response (201):** Returns created supplier

---

#### PUT `/api/suppliers/:id`
Update supplier.

**Request Body:** Supplier object (partial updates allowed)

**Response (200):** Returns updated supplier

---

#### DELETE `/api/suppliers/:id`
Delete supplier.

**Response (204):** No content

---

### Supplier Pricing Endpoints

#### GET `/api/supplier-pricing`
Retrieve all active supplier pricing.

**Query Parameters:**
- `supplier_id` (optional): Filter by supplier

**Response (200):**
```json
{
  "pricing": [
    {
      "supplier_pricing_id": 1,
      "supplier_id": 1,
      "supplier_name": "Supplier Co.",
      "product_id": 10,
      "sku": "PROD-010",
      "product_name": "Product Name",
      "product_type": "sale",
      "price": 80.00,
      "effective_from": "2025-01-01",
      "effective_to": null
    }
  ]
}
```

---

#### GET `/api/supplier-pricing/:supplierId/:productId`
Retrieve pricing for specific supplier and product.

**Response (200):** Returns pricing object

---

#### PUT `/api/supplier-pricing/:supplierId/:productId`
Update supplier pricing.

**Request Body:**
```json
{
  "supplier_id": 1,
  "product_id": 10,
  "price": 85.00,
  "effective_from": "2025-02-01"
}
```

**Response (200):** Returns new pricing record

---

#### POST `/api/supplier-pricing/bulk`
Bulk update supplier pricing.

**Request Body:**
```json
{
  "updates": [
    {
      "supplier_id": 1,
      "sku": "PROD-010",
      "price": 85.00,
      "effective_from": "2025-02-01"
    }
  ]
}
```

**Response (200):**
```json
{
  "success": 1,
  "failed": 0,
  "results": [...],
  "errors": []
}
```

---

### Purchase Order Endpoints

#### GET `/api/purchase-orders`
Retrieve all purchase orders.

**Query Parameters:**
- `supplier_id` (optional): Filter by supplier
- `status` (optional): Filter by status

**Response (200):**
```json
{
  "orders": [
    {
      "po_id": 1,
      "supplier_id": 1,
      "order_date": "2025-01-10T14:00:00Z",
      "delivery_date": "2025-01-25",
      "status": "pending",
      "total_amount": 850.00
    }
  ]
}
```

---

#### GET `/api/purchase-orders/:id`
Retrieve single purchase order with lines.

**Response (200):**
```json
{
  "po_id": 1,
  "supplier_id": 1,
  "order_date": "2025-01-10T14:00:00Z",
  "delivery_date": "2025-01-25",
  "status": "pending",
  "total_amount": 850.00,
  "supplier_name": "Supplier Co.",
  "lines": [
    {
      "line_item_id": 1,
      "po_id": 1,
      "product_id": 10,
      "quantity_ordered": 10,
      "unit_price": 85.00,
      "status": "pending"
    }
  ]
}
```

---

#### POST `/api/purchase-orders`
Create a new purchase order.

**Request Body:**
```json
{
  "supplier_id": 1,
  "delivery_date": "2025-01-25",
  "lines": [
    {
      "product_id": 10,
      "quantity_ordered": 10,
      "unit_price": 85.00
    }
  ]
}
```

**Response (201):** Returns created order with lines

---

#### PATCH `/api/purchase-orders/:id`
Update purchase order status.

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Response (200):** Returns updated order

---

### Chart Data Endpoints

#### GET `/api/charts`
Retrieve chart/analytics data.

**Response (200):**
```json
{
  "monthly": [
    {
      "month": "January",
      "desktop": 186,
      "mobile": 80
    }
  ],
  "daily": [
    {
      "date": "2024-01-01",
      "desktop": 222,
      "mobile": 150
    }
  ],
  "radar": [
    {
      "category": "Sales",
      "desktop": 80,
      "mobile": 45
    }
  ],
  "pie": [
    {
      "name": "Chrome",
      "value": 275,
      "fill": "#8884d8"
    }
  ]
}
```

---

## Image Management

### Image Storage Convention

Images are stored following a SKU-based naming convention:
- Primary image: `{SKU}.jpg`
- Additional images: `{SKU}-1.jpg`, `{SKU}-2.jpg`, `{SKU}-3.jpg`, etc.

### Recommended Implementation

1. **Storage Location**: Use S3-compatible object storage (AWS S3, MinIO, DigitalOcean Spaces) or local filesystem with CDN
2. **Upload Endpoint**: `POST /api/products/:sku/images`
3. **Delete Endpoint**: `DELETE /api/products/:sku/images/:index`
4. **Image Access**: Direct URLs following pattern: `https://cdn.example.com/products/{SKU}.jpg`

### Image Upload Endpoint

#### POST `/api/products/:sku/images`
Upload product image(s).

**Request:**
- Content-Type: `multipart/form-data`
- Body: File upload(s)

**Query Parameters:**
- `index` (optional): Specific index for the image (0 for primary, 1-9 for additional)

**Response (201):**
```json
{
  "urls": [
    "https://cdn.example.com/products/PROD-001.jpg",
    "https://cdn.example.com/products/PROD-001-1.jpg"
  ]
}
```

---

## Security Requirements

### Authentication & Authorization

1. **JWT Tokens**: Use secure JWT tokens with expiration (recommended: 24 hours)
2. **Password Hashing**: Use bcrypt or Argon2 for password hashing
3. **Role-Based Access Control**:
   - `user`: Can view products, create orders
   - `employee`: Can manage products, customers, pricing
   - `admin`: Full access to all resources

### API Security

1. **HTTPS Only**: All API communication must use HTTPS in production
2. **Rate Limiting**: Implement rate limiting (e.g., 100 requests/minute per IP)
3. **CORS**: Configure CORS to allow only trusted frontend origins
4. **Input Validation**: Validate all inputs to prevent SQL injection, XSS
5. **SQL Injection Prevention**: Use parameterized queries/ORM

---

## Error Handling

All error responses should follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Standard HTTP Status Codes

- `200 OK`: Successful GET, PUT, PATCH
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Constraint violation (duplicate SKU, etc.)
- `422 Unprocessable Entity`: Validation errors
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## Performance Requirements

1. **Response Times**:
   - GET requests: < 200ms (avg)
   - POST/PUT requests: < 500ms (avg)
   - Complex queries: < 1s (max)

2. **Pagination**: Implement pagination for list endpoints
   - Default page size: 50 items
   - Max page size: 200 items
   - Include `total`, `page`, `limit` in responses

3. **Caching**: Implement caching for frequently accessed data
   - Product lists
   - Pricing data
   - Customer lists

4. **Database Indexing**: All foreign keys and frequently queried columns should have indexes

---

## Testing Requirements

1. **Unit Tests**: 80%+ code coverage
2. **Integration Tests**: Test all API endpoints
3. **Load Testing**: Support at least 100 concurrent users
4. **Security Testing**: Regular vulnerability scans

---

## Deployment Considerations

1. **Environment Variables**:
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Secret for JWT token signing
   - `AWS_S3_BUCKET`: S3 bucket for image storage (if using S3)
   - `CORS_ORIGIN`: Allowed frontend origin(s)
   - `PORT`: API server port

2. **Database Migrations**: Use migration tool (e.g., Alembic, Flyway, Knex)

3. **Logging**: Implement structured logging (JSON format) with levels (DEBUG, INFO, WARN, ERROR)

4. **Monitoring**: Health check endpoint at `GET /health`

---

## Optional Enhancements

1. **WebSocket Support**: Real-time updates for order status, inventory changes
2. **File Exports**: CSV/Excel export for products, orders, pricing
3. **Email Notifications**: Order confirmations, status updates
4. **Audit Trail**: Log all data modifications with user and timestamp
5. **Advanced Search**: Full-text search for products and customers
6. **Inventory Management**: Track stock levels for sale products
7. **Reporting APIs**: Sales reports, inventory reports, customer analytics
8. **Webhooks**: Notify external systems of order events

---

## API Versioning

Recommendation: Use URL versioning
- Current: `/api/v1/products`
- Future: `/api/v2/products`

---

## Documentation

1. **OpenAPI/Swagger**: Generate interactive API documentation
2. **Postman Collection**: Provide Postman collection for testing
3. **README**: Setup instructions, environment variables, development guide
4. **Architecture Diagram**: Document system architecture and data flow
