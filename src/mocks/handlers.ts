import { http, HttpResponse, delay } from 'msw'
import { mockProducts } from './data/products'
import { mockCustomers } from './data/customers'
import { mockSalesOrders, mockSalesOrderLines } from './data/salesOrders'
import { mockMonthlyChartData, mockDailyChartData, mockRadarChartData, mockPieChartData } from './data/charts'
import { Product, Customer, SalesOrder, SalesOrderLine, CartItem } from '@/types'

// In-memory storage for products (simulates a database)
let products = [...mockProducts]

// In-memory storage for customers (simulates a database)
let customers = [...mockCustomers]

// In-memory storage for sales orders
let salesOrders = [...mockSalesOrders]
let salesOrderLines = [...mockSalesOrderLines]

// In-memory storage for shopping cart (session-based, would typically use cookies/sessions)
let cart: CartItem[] = []

export const handlers = [
    // Get all products
    http.get('/api/products', async () => {
        await delay(300) // Simulate network delay
        return HttpResponse.json({ products })
    }),

    // Get single product
    http.get('/api/products/:id', async ({ params }) => {
        await delay(200)
        const { id } = params
        const product = products.find(p => p.product_id === Number(id))

        if (!product) {
            return new HttpResponse(null, { status: 404 })
        }

        return HttpResponse.json(product)
    }),

    // Create product
    http.post('/api/products', async ({ request }) => {
        await delay(400)
        const newProduct = await request.json() as Product

        const productWithId = {
            ...newProduct,
            product_id: Math.max(0, ...products.map(p => p.product_id || 0)) + 1
        }

        products.push(productWithId)
        return HttpResponse.json(productWithId, { status: 201 })
    }),

    // Update product
    http.put('/api/products/:id', async ({ params, request }) => {
        await delay(400)
        const { id } = params
        const updatedProduct = await request.json() as Product

        const index = products.findIndex(p => p.product_id === Number(id))

        if (index === -1) {
            return new HttpResponse(null, { status: 404 })
        }

        products[index] = { ...updatedProduct, product_id: Number(id) }
        return HttpResponse.json(products[index])
    }),

    // Delete product
    http.delete('/api/products/:id', async ({ params }) => {
        await delay(300)
        const { id } = params

        const index = products.findIndex(p => p.product_id === Number(id))

        if (index === -1) {
            return new HttpResponse(null, { status: 404 })
        }

        products.splice(index, 1)
        return new HttpResponse(null, { status: 204 })
    }),

    // Get chart data
    http.get('/api/charts', async () => {
        await delay(500)
        return HttpResponse.json({
            monthly: mockMonthlyChartData,
            daily: mockDailyChartData,
            radar: mockRadarChartData,
            pie: mockPieChartData
        })
    }),

    // Get all customers
    http.get('/api/customers', async () => {
        await delay(300) // Simulate network delay
        return HttpResponse.json({ customers })
    }),

    // Get single customer
    http.get('/api/customers/:id', async ({ params }) => {
        await delay(200)
        const { id } = params
        const customer = customers.find(c => c.customer_id === Number(id))

        if (!customer) {
            return new HttpResponse(null, { status: 404 })
        }

        return HttpResponse.json(customer)
    }),

    // Create customer
    http.post('/api/customers', async ({ request }) => {
        await delay(400)
        const newCustomer = await request.json() as Customer

        const customerWithId = {
            ...newCustomer,
            customer_id: Math.max(0, ...customers.map(c => c.customer_id || 0)) + 1
        }

        customers.push(customerWithId)
        return HttpResponse.json(customerWithId, { status: 201 })
    }),

    // Update customer
    http.put('/api/customers/:id', async ({ params, request }) => {
        await delay(400)
        const { id } = params
        const updatedCustomer = await request.json() as Customer

        const index = customers.findIndex(c => c.customer_id === Number(id))

        if (index === -1) {
            return new HttpResponse(null, { status: 404 })
        }

        customers[index] = { ...updatedCustomer, customer_id: Number(id) }
        return HttpResponse.json(customers[index])
    }),

    // Delete customer
    http.delete('/api/customers/:id', async ({ params }) => {
        await delay(300)
        const { id } = params

        const index = customers.findIndex(c => c.customer_id === Number(id))

        if (index === -1) {
            return new HttpResponse(null, { status: 404 })
        }

        customers.splice(index, 1)
        return new HttpResponse(null, { status: 204 })
    }),

    // Shopping Cart endpoints
    // Get cart
    http.get('/api/cart', async () => {
        await delay(200)
        const total = cart.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0)
        return HttpResponse.json({ items: cart, total })
    }),

    // Add to cart
    http.post('/api/cart', async ({ request }) => {
        await delay(300)
        const { product_id, quantity } = await request.json() as { product_id: number, quantity: number }

        const product = products.find(p => p.product_id === product_id)
        if (!product) {
            return new HttpResponse(null, { status: 404 })
        }

        const existingItem = cart.find(item => item.product.product_id === product_id)

        if (existingItem) {
            existingItem.quantity += quantity
        } else {
            cart.push({ product, quantity })
        }

        const total = cart.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0)
        return HttpResponse.json({ items: cart, total })
    }),

    // Update cart item
    http.put('/api/cart/:productId', async ({ params, request }) => {
        await delay(300)
        const { productId } = params
        const { quantity } = await request.json() as { quantity: number }

        const itemIndex = cart.findIndex(item => item.product.product_id === Number(productId))

        if (itemIndex === -1) {
            return new HttpResponse(null, { status: 404 })
        }

        if (quantity <= 0) {
            cart.splice(itemIndex, 1)
        } else {
            cart[itemIndex].quantity = quantity
        }

        const total = cart.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0)
        return HttpResponse.json({ items: cart, total })
    }),

    // Remove from cart
    http.delete('/api/cart/:productId', async ({ params }) => {
        await delay(300)
        const { productId } = params

        const itemIndex = cart.findIndex(item => item.product.product_id === Number(productId))

        if (itemIndex === -1) {
            return new HttpResponse(null, { status: 404 })
        }

        cart.splice(itemIndex, 1)

        const total = cart.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0)
        return HttpResponse.json({ items: cart, total })
    }),

    // Clear cart
    http.delete('/api/cart', async () => {
        await delay(200)
        cart = []
        return HttpResponse.json({ items: [], total: 0 })
    }),

    // Sales Order endpoints
    // Get all sales orders
    http.get('/api/sales-orders', async () => {
        await delay(300)
        return HttpResponse.json({ orders: salesOrders })
    }),

    // Get single sales order with lines
    http.get('/api/sales-orders/:id', async ({ params }) => {
        await delay(200)
        const { id } = params
        const order = salesOrders.find(o => o.sales_order_id === Number(id))

        if (!order) {
            return new HttpResponse(null, { status: 404 })
        }

        const lines = salesOrderLines.filter(l => l.sales_order_id === Number(id))
        return HttpResponse.json({ ...order, lines })
    }),

    // Create sales order from cart
    http.post('/api/sales-orders', async ({ request }) => {
        await delay(500)
        const { customer_id, requested_delivery_date, payment_terms, shipping_method, warehouse_id } =
            await request.json() as {
                customer_id: number
                requested_delivery_date: string
                payment_terms: string
                shipping_method: string
                warehouse_id: number
            }

        if (cart.length === 0) {
            return HttpResponse.json({ error: 'Cart is empty' }, { status: 400 })
        }

        // Create order
        const newOrderId = Math.max(0, ...salesOrders.map(o => o.sales_order_id || 0)) + 1
        const total = cart.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0)

        const newOrder: SalesOrder = {
            sales_order_id: newOrderId,
            customer_id,
            order_date: new Date().toISOString(),
            requested_delivery_date,
            status: 'pending',
            total_amount: total,
            payment_terms,
            shipping_method,
            warehouse_id
        }

        salesOrders.push(newOrder)

        // Create order lines
        const newLines: SalesOrderLine[] = cart.map((item, index) => ({
            line_id: Math.max(0, ...salesOrderLines.map(l => l.line_id || 0)) + index + 1,
            sales_order_id: newOrderId,
            product_id: item.product.product_id!,
            quantity_ordered: item.quantity,
            quantity_allocated: 0,
            quantity_shipped: 0,
            unit_price: item.product.price || 0,
            status: 'pending'
        }))

        salesOrderLines.push(...newLines)

        // Clear cart
        cart = []

        return HttpResponse.json({ ...newOrder, lines: newLines }, { status: 201 })
    }),

    // Update sales order status
    http.patch('/api/sales-orders/:id', async ({ params, request }) => {
        await delay(400)
        const { id } = params
        const updates = await request.json() as Partial<SalesOrder>

        const index = salesOrders.findIndex(o => o.sales_order_id === Number(id))

        if (index === -1) {
            return new HttpResponse(null, { status: 404 })
        }

        salesOrders[index] = { ...salesOrders[index], ...updates }
        return HttpResponse.json(salesOrders[index])
    }),
]
