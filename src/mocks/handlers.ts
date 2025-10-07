import { http, HttpResponse, delay } from 'msw'
import { mockProducts } from './data/products'
import { mockCustomers } from './data/customers'
import { mockSalesOrders, mockSalesOrderLines } from './data/salesOrders'
import { mockPurchaseOrders, mockPOLineItems } from './data/purchaseOrders'
import { mockMonthlyChartData, mockDailyChartData, mockRadarChartData, mockPieChartData } from './data/charts'
import { mockAssets, mockAssetAvailability } from './data/assets'
import { mockUsers, mockPasswords } from './data/users'
import { mockPricing } from './data/pricing'
import { mockSuppliers } from './data/suppliers'
import { mockSupplierPricing } from './data/supplier-pricing'
import { Product, Customer, SalesOrder, SalesOrderLine, PurchaseOrder, POLineItem, BasketItem, User, AuthCredentials, SignUpData, DefaultPricing, PricingUpdateRequest, BulkPricingUpdateRequest, Supplier, SupplierPricing, SupplierPricingUpdateRequest, BulkSupplierPricingUpdateRequest } from '@/types'

// In-memory storage for products (simulates a database)
let products = [...mockProducts]

// In-memory storage for customers (simulates a database)
let customers = [...mockCustomers]

// In-memory storage for sales orders
let salesOrders = [...mockSalesOrders]
let salesOrderLines = [...mockSalesOrderLines]

// In-memory storage for purchase orders
let purchaseOrders = [...mockPurchaseOrders]
let poLineItems = [...mockPOLineItems]

// In-memory storage for shopping basket (session-based, would typically use cookies/sessions)
let basket: BasketItem[] = []
let basketOrderDiscount: { type?: 'percentage' | 'fixed', value?: number } = {}

// In-memory storage for assets
let assets = [...mockAssets]
let assetAvailability = [...mockAssetAvailability]

// In-memory storage for users
let users = [...mockUsers]
const passwords = { ...mockPasswords }

// In-memory storage for pricing
let pricing = [...mockPricing]

// In-memory storage for suppliers (simulates a database)
let suppliers = [...mockSuppliers]

// In-memory storage for supplier pricing
let supplierPricing = [...mockSupplierPricing]

// In-memory session storage (token -> user_id)
const sessions: Record<string, number> = {}

// Helper to generate simple token
function generateToken(userId: number): string {
    const token = `token_${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}`
    sessions[token] = userId
    return token
}

// Helper to validate token
function validateToken(token: string | null): User | null {
    if (!token) return null
    const userId = sessions[token]
    if (!userId) return null
    return users.find(u => u.user_id === userId) || null
}

export const handlers = [
    // Authentication endpoints
    // Sign in
    http.post('/api/auth/signin', async ({ request }) => {
        await delay(500)
        const { email, password } = await request.json() as AuthCredentials

        const user = users.find(u => u.email === email)
        if (!user || passwords[email] !== password) {
            return HttpResponse.json(
                { message: 'Invalid email or password' },
                { status: 401 }
            )
        }

        const token = generateToken(user.user_id)
        return HttpResponse.json({ user, token })
    }),

    // Sign up
    http.post('/api/auth/signup', async ({ request }) => {
        await delay(600)
        const { email, password, name } = await request.json() as SignUpData

        // Check if user already exists
        if (users.find(u => u.email === email)) {
            return HttpResponse.json(
                { message: 'Email already registered' },
                { status: 409 }
            )
        }

        // Create new user with 'user' role by default
        const newUser: User = {
            user_id: Math.max(...users.map(u => u.user_id)) + 1,
            email,
            name,
            role: 'user'
        }

        users.push(newUser)
        passwords[email] = password

        const token = generateToken(newUser.user_id)
        return HttpResponse.json({ user: newUser, token }, { status: 201 })
    }),

    // Sign out
    http.post('/api/auth/signout', async ({ request }) => {
        await delay(200)
        const authHeader = request.headers.get('Authorization')
        const token = authHeader?.replace('Bearer ', '')

        if (token && sessions[token]) {
            delete sessions[token]
        }

        return new HttpResponse(null, { status: 204 })
    }),

    // Get current user (verify token)
    http.get('/api/auth/me', async ({ request }) => {
        await delay(300)
        const authHeader = request.headers.get('Authorization')
        const token = authHeader?.replace('Bearer ', '') || null

        const user = validateToken(token)
        if (!user) {
            return HttpResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        return HttpResponse.json({ user })
    }),

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

    // Shopping Basket endpoints
    // Get basket
    http.get('/api/basket', async () => {
        await delay(200)

        // Calculate subtotal with line discounts
        const subtotal = basket.reduce((sum, item) => {
            const unitPrice = item.product.product_type === 'hire'
                ? (item.product.daily_hire_rate || 0)
                : (item.product.price || 0)
            let lineTotal = unitPrice * item.quantity

            // Apply line discount
            if (item.discount_type && item.discount_value) {
                if (item.discount_type === 'percentage') {
                    lineTotal = lineTotal * (1 - item.discount_value / 100)
                } else {
                    lineTotal = lineTotal - item.discount_value
                }
            }

            return sum + Math.max(0, lineTotal)
        }, 0)

        // Apply order-level discount
        let total = subtotal
        if (basketOrderDiscount.type && basketOrderDiscount.value) {
            if (basketOrderDiscount.type === 'percentage') {
                total = total * (1 - basketOrderDiscount.value / 100)
            } else {
                total = total - basketOrderDiscount.value
            }
        }

        return HttpResponse.json({
            items: basket,
            total: Math.max(0, total),
            order_discount_type: basketOrderDiscount.type,
            order_discount_value: basketOrderDiscount.value
        })
    }),

    // Add to basket
    http.post('/api/basket', async ({ request }) => {
        await delay(300)
        const {
            product_id,
            quantity,
            hire_start_date,
            hire_end_date,
            asset_id
        } = await request.json() as {
            product_id: number
            quantity: number
            hire_start_date?: string
            hire_end_date?: string
            asset_id?: number
        }

        const product = products.find(p => p.product_id === product_id)
        if (!product) {
            return new HttpResponse(null, { status: 404 })
        }

        // For hire products, prevent double-booking the same asset
        if (product.product_type === 'hire' && asset_id && hire_start_date && hire_end_date) {
            const conflictingItem = basket.find(item => {
                if (item.asset_id !== asset_id) return false
                if (!item.hire_start_date || !item.hire_end_date) return false

                // Check for date overlap
                const existingStart = new Date(item.hire_start_date)
                const existingEnd = new Date(item.hire_end_date)
                const newStart = new Date(hire_start_date)
                const newEnd = new Date(hire_end_date)

                // Dates overlap if: start is before existing end AND end is after existing start
                return newStart <= existingEnd && newEnd >= existingStart
            })

            if (conflictingItem) {
                return HttpResponse.json(
                    { error: 'This asset is already booked for overlapping dates in your basket' },
                    { status: 409 }
                )
            }

            // Also update the mock availability to mark these dates as unavailable
            const start = new Date(hire_start_date)
            const end = new Date(hire_end_date)
            const currentDate = new Date(start)

            while (currentDate <= end) {
                const dateStr = currentDate.toISOString().split('T')[0]
                // Add to availability list as unavailable (but without sales_order_id yet)
                if (!assetAvailability.find(av => av.asset_id === asset_id && av.date === dateStr)) {
                    assetAvailability.push({
                        asset_id,
                        date: dateStr,
                        is_available: false
                    })
                }
                currentDate.setDate(currentDate.getDate() + 1)
            }
        }

        // For sale products, check if already in basket
        const existingItem = basket.find(item =>
            item.product.product_id === product_id &&
            product.product_type === 'sale'
        )

        if (existingItem && product.product_type === 'sale') {
            // For sale products, increase quantity
            existingItem.quantity += quantity
        } else {
            // For hire products or new items, add new basket item
            basket.push({
                product,
                quantity,
                hire_start_date,
                hire_end_date,
                asset_id
            })
        }

        // Calculate total (considering both sale and hire products)
        const total = basket.reduce((sum, item) => {
            if (item.product.product_type === 'hire') {
                return sum + (item.product.daily_hire_rate || 0) * item.quantity
            } else {
                return sum + (item.product.price || 0) * item.quantity
            }
        }, 0)

        return HttpResponse.json({ items: basket, total })
    }),

    // Update order-level discount (must come before :productId routes)
    http.put('/api/basket/discount', async ({ request }) => {
        await delay(300)
        const { discount_type, discount_value } = await request.json() as {
            discount_type?: 'percentage' | 'fixed'
            discount_value?: number
        }

        basketOrderDiscount = {
            type: discount_type,
            value: discount_value
        }

        // Recalculate total
        const subtotal = basket.reduce((sum, item) => {
            const unitPrice = item.product.product_type === 'hire'
                ? (item.product.daily_hire_rate || 0)
                : (item.product.price || 0)
            let lineTotal = unitPrice * item.quantity

            if (item.discount_type && item.discount_value) {
                if (item.discount_type === 'percentage') {
                    lineTotal = lineTotal * (1 - item.discount_value / 100)
                } else {
                    lineTotal = lineTotal - item.discount_value
                }
            }

            return sum + Math.max(0, lineTotal)
        }, 0)

        let total = subtotal
        if (discount_type && discount_value) {
            if (discount_type === 'percentage') {
                total = total * (1 - discount_value / 100)
            } else {
                total = total - discount_value
            }
        }

        return HttpResponse.json({
            items: basket,
            total: Math.max(0, total),
            order_discount_type: discount_type,
            order_discount_value: discount_value
        })
    }),

    // Update line item discount (must come before :productId routes)
    http.put('/api/basket/:productId/discount', async ({ params, request }) => {
        await delay(300)
        const { productId } = params
        const { discount_type, discount_value } = await request.json() as {
            discount_type?: 'percentage' | 'fixed'
            discount_value?: number
        }

        const itemIndex = basket.findIndex(item => item.product.product_id === Number(productId))

        if (itemIndex === -1) {
            return new HttpResponse(null, { status: 404 })
        }

        // Update discount
        basket[itemIndex] = {
            ...basket[itemIndex],
            discount_type,
            discount_value
        }

        // Recalculate total
        const subtotal = basket.reduce((sum, item) => {
            const unitPrice = item.product.product_type === 'hire'
                ? (item.product.daily_hire_rate || 0)
                : (item.product.price || 0)
            let lineTotal = unitPrice * item.quantity

            if (item.discount_type && item.discount_value) {
                if (item.discount_type === 'percentage') {
                    lineTotal = lineTotal * (1 - item.discount_value / 100)
                } else {
                    lineTotal = lineTotal - item.discount_value
                }
            }

            return sum + Math.max(0, lineTotal)
        }, 0)

        let total = subtotal
        if (basketOrderDiscount.type && basketOrderDiscount.value) {
            if (basketOrderDiscount.type === 'percentage') {
                total = total * (1 - basketOrderDiscount.value / 100)
            } else {
                total = total - basketOrderDiscount.value
            }
        }

        return HttpResponse.json({
            items: basket,
            total: Math.max(0, total),
            order_discount_type: basketOrderDiscount.type,
            order_discount_value: basketOrderDiscount.value
        })
    }),

    // Update basket item
    http.put('/api/basket/:productId', async ({ params, request }) => {
        await delay(300)
        const { productId } = params
        const { quantity } = await request.json() as { quantity: number }

        const itemIndex = basket.findIndex(item => item.product.product_id === Number(productId))

        if (itemIndex === -1) {
            return new HttpResponse(null, { status: 404 })
        }

        if (quantity <= 0) {
            basket.splice(itemIndex, 1)
        } else {
            basket[itemIndex].quantity = quantity
        }

        const total = basket.reduce((sum, item) => {
            if (item.product.product_type === 'hire') {
                return sum + (item.product.daily_hire_rate || 0) * item.quantity
            } else {
                return sum + (item.product.price || 0) * item.quantity
            }
        }, 0)
        return HttpResponse.json({ items: basket, total })
    }),

    // Remove from basket
    http.delete('/api/basket/:productId', async ({ params }) => {
        await delay(300)
        const { productId } = params

        const itemIndex = basket.findIndex(item => item.product.product_id === Number(productId))

        if (itemIndex === -1) {
            return new HttpResponse(null, { status: 404 })
        }

        basket.splice(itemIndex, 1)

        const total = basket.reduce((sum, item) => {
            if (item.product.product_type === 'hire') {
                return sum + (item.product.daily_hire_rate || 0) * item.quantity
            } else {
                return sum + (item.product.price || 0) * item.quantity
            }
        }, 0)
        return HttpResponse.json({ items: basket, total })
    }),

    // Clear basket
    http.delete('/api/basket', async () => {
        await delay(200)
        basket = []
        basketOrderDiscount = {}
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

    // Create sales order from basket
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

        if (basket.length === 0) {
            return HttpResponse.json({ error: 'Basket is empty' }, { status: 400 })
        }

        // Create order
        const newOrderId = Math.max(0, ...salesOrders.map(o => o.sales_order_id || 0)) + 1

        // Calculate total with line discounts
        const subtotal = basket.reduce((sum, item) => {
            const unitPrice = item.product.product_type === 'hire'
                ? (item.product.daily_hire_rate || 0)
                : (item.product.price || 0)
            let lineTotal = unitPrice * item.quantity

            // Apply line discount
            if (item.discount_type && item.discount_value) {
                if (item.discount_type === 'percentage') {
                    lineTotal = lineTotal * (1 - item.discount_value / 100)
                } else {
                    lineTotal = lineTotal - item.discount_value
                }
            }

            return sum + Math.max(0, lineTotal)
        }, 0)

        // Apply order-level discount
        let total = subtotal
        if (basketOrderDiscount.type && basketOrderDiscount.value) {
            if (basketOrderDiscount.type === 'percentage') {
                total = total * (1 - basketOrderDiscount.value / 100)
            } else {
                total = total - basketOrderDiscount.value
            }
        }

        const newOrder: SalesOrder = {
            sales_order_id: newOrderId,
            customer_id,
            order_date: new Date().toISOString(),
            requested_delivery_date,
            status: 'pending',
            total_amount: Math.max(0, total),
            payment_terms,
            shipping_method,
            warehouse_id,
            order_discount_type: basketOrderDiscount.type,
            order_discount_value: basketOrderDiscount.value
        }

        salesOrders.push(newOrder)

        // Create order lines
        const newLines: SalesOrderLine[] = basket.map((item, index) => ({
            line_id: Math.max(0, ...salesOrderLines.map(l => l.line_id || 0)) + index + 1,
            sales_order_id: newOrderId,
            product_id: item.product.product_id!,
            quantity_ordered: item.quantity,
            quantity_allocated: 0,
            quantity_shipped: 0,
            unit_price: item.product.product_type === 'hire'
                ? (item.product.daily_hire_rate || 0)
                : (item.product.price || 0),
            status: 'pending',
            line_type: item.product.product_type,
            asset_id: item.asset_id,
            hire_start_date: item.hire_start_date,
            hire_end_date: item.hire_end_date,
            discount_type: item.discount_type,
            discount_value: item.discount_value
        }))

        salesOrderLines.push(...newLines)

        // Clear basket and discounts
        basket = []
        basketOrderDiscount = {}

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

    // Asset endpoints
    // IMPORTANT: More specific routes must come before parameterized routes

    // Check availability for a product between dates
    http.get('/api/assets/availability', async ({ request }) => {
        await delay(300)
        const url = new URL(request.url)
        const productId = Number(url.searchParams.get('product_id'))
        const startDate = url.searchParams.get('start_date')
        const endDate = url.searchParams.get('end_date')

        if (!productId || !startDate || !endDate) {
            return HttpResponse.json({ error: 'Missing required parameters' }, { status: 400 })
        }

        // Get all assets for the product
        const productAssets = assets.filter(a => a.product_id === productId)

        // Filter to available assets (check if any date in range is unavailable)
        const availableAssets = productAssets.filter(asset => {
            // Check if asset is generally available
            if (asset.status !== 'available') {
                return false
            }

            // Check availability calendar for date range
            const start = new Date(startDate)
            const end = new Date(endDate)

            for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
                const dateStr = date.toISOString().split('T')[0]
                const unavailable = assetAvailability.find(
                    av => av.asset_id === asset.asset_id && av.date === dateStr && !av.is_available
                )
                if (unavailable) {
                    return false
                }
            }

            return true
        })

        return HttpResponse.json({ available_assets: availableAssets })
    }),

    // Get availability calendar for a specific asset
    http.get('/api/assets/:id/availability', async ({ params, request }) => {
        await delay(200)
        const { id } = params
        const url = new URL(request.url)
        const startDate = url.searchParams.get('start_date')
        const endDate = url.searchParams.get('end_date')

        const asset = assets.find(a => a.asset_id === Number(id))
        if (!asset) {
            return new HttpResponse(null, { status: 404 })
        }

        // Filter availability data for this asset and date range
        let availability = assetAvailability.filter(av => av.asset_id === Number(id))

        if (startDate && endDate) {
            availability = availability.filter(av => av.date >= startDate && av.date <= endDate)
        }

        return HttpResponse.json({ availability })
    }),

    // Get all assets for a product
    http.get('/api/assets', async ({ request }) => {
        await delay(200)
        const url = new URL(request.url)
        const productId = url.searchParams.get('product_id')

        if (productId) {
            const filteredAssets = assets.filter(a => a.product_id === Number(productId))
            return HttpResponse.json({ assets: filteredAssets })
        }

        return HttpResponse.json({ assets })
    }),

    // Get single asset (MUST be last among asset routes)
    http.get('/api/assets/:id', async ({ params }) => {
        await delay(200)
        const { id } = params
        const asset = assets.find(a => a.asset_id === Number(id))

        if (!asset) {
            return new HttpResponse(null, { status: 404 })
        }

        return HttpResponse.json(asset)
    }),

    // Pricing endpoints
    // Get all pricing
    http.get('/api/pricing', async () => {
        await delay(300)
        return HttpResponse.json({ pricing })
    }),

    // Get pricing for a specific product
    http.get('/api/pricing/:productId', async ({ params }) => {
        await delay(200)
        const { productId } = params
        const productPricing = pricing.find(p => p.product_id === Number(productId))

        if (!productPricing) {
            return new HttpResponse(null, { status: 404 })
        }

        return HttpResponse.json(productPricing)
    }),

    // Update a single pricing record
    http.put('/api/pricing/:productId', async ({ request, params }) => {
        await delay(400)
        const { productId } = params
        const update = await request.json() as PricingUpdateRequest

        // Find the current active pricing (one without effective_to date)
        const index = pricing.findIndex(p => p.product_id === Number(productId) && !p.effective_to)
        if (index === -1) {
            return HttpResponse.json(
                { message: 'Active pricing not found for this product' },
                { status: 404 }
            )
        }

        // Archive old pricing by setting effective_to
        pricing[index].effective_to = new Date().toISOString().split('T')[0]

        // Create new pricing entry
        const product = products.find(p => p.product_id === Number(productId))
        if (!product) {
            return HttpResponse.json(
                { message: 'Product not found' },
                { status: 404 }
            )
        }

        const newPricing: DefaultPricing = {
            pricing_id: Math.max(...pricing.map(p => p.pricing_id || 0)) + 1,
            product_id: Number(productId),
            sku: product.sku,
            product_name: product.name,
            product_type: product.product_type,
            price: update.price,
            daily_hire_rate: update.daily_hire_rate,
            effective_from: update.effective_from || new Date().toISOString().split('T')[0]
        }

        pricing.push(newPricing)

        // Also update the product's price
        if (update.price !== undefined) {
            product.price = update.price
        }
        if (update.daily_hire_rate !== undefined) {
            product.daily_hire_rate = update.daily_hire_rate
        }

        return HttpResponse.json(newPricing)
    }),

    // Bulk update pricing
    http.post('/api/pricing/bulk', async ({ request }) => {
        await delay(600)
        const { updates } = await request.json() as BulkPricingUpdateRequest

        const today = new Date().toISOString().split('T')[0]
        const results: DefaultPricing[] = []
        const errors: string[] = []

        for (const update of updates) {
            // Find the current active pricing (one without effective_to date)
            const index = pricing.findIndex(p => p.product_id === update.product_id && !p.effective_to)
            const product = products.find(p => p.product_id === update.product_id)

            if (index === -1 || !product) {
                errors.push(`Product ID ${update.product_id} not found or no active pricing`)
                continue
            }

            // Archive old pricing by setting effective_to date
            pricing[index].effective_to = today

            // Create new pricing entry
            const newPricing: DefaultPricing = {
                pricing_id: Math.max(...pricing.map(p => p.pricing_id || 0)) + 1,
                product_id: update.product_id,
                sku: product.sku,
                product_name: product.name,
                product_type: product.product_type,
                price: update.price,
                daily_hire_rate: update.daily_hire_rate,
                effective_from: update.effective_from || today
            }

            pricing.push(newPricing)
            results.push(newPricing)

            // Update product pricing
            if (update.price !== undefined) {
                product.price = update.price
            }
            if (update.daily_hire_rate !== undefined) {
                product.daily_hire_rate = update.daily_hire_rate
            }
        }

        return HttpResponse.json({
            success: results.length,
            failed: errors.length,
            results,
            errors
        })
    }),

    // Supplier endpoints
    // Get all suppliers
    http.get('/api/suppliers', async () => {
        await delay(300)
        return HttpResponse.json({ suppliers })
    }),

    // Get single supplier
    http.get('/api/suppliers/:id', async ({ params }) => {
        await delay(200)
        const { id } = params
        const supplier = suppliers.find(s => s.supplier_id === Number(id))

        if (!supplier) {
            return new HttpResponse(null, { status: 404 })
        }

        return HttpResponse.json(supplier)
    }),

    // Create supplier
    http.post('/api/suppliers', async ({ request }) => {
        await delay(400)
        const newSupplier = await request.json() as Supplier

        const supplierWithId = {
            ...newSupplier,
            supplier_id: Math.max(0, ...suppliers.map(s => s.supplier_id || 0)) + 1
        }

        suppliers.push(supplierWithId)
        return HttpResponse.json(supplierWithId, { status: 201 })
    }),

    // Update supplier
    http.put('/api/suppliers/:id', async ({ params, request }) => {
        await delay(400)
        const { id } = params
        const updatedSupplier = await request.json() as Supplier

        const index = suppliers.findIndex(s => s.supplier_id === Number(id))

        if (index === -1) {
            return new HttpResponse(null, { status: 404 })
        }

        suppliers[index] = { ...updatedSupplier, supplier_id: Number(id) }
        return HttpResponse.json(suppliers[index])
    }),

    // Delete supplier
    http.delete('/api/suppliers/:id', async ({ params }) => {
        await delay(300)
        const { id } = params

        const index = suppliers.findIndex(s => s.supplier_id === Number(id))

        if (index === -1) {
            return new HttpResponse(null, { status: 404 })
        }

        suppliers.splice(index, 1)
        return new HttpResponse(null, { status: 204 })
    }),

    // Supplier Pricing endpoints
    // Get all supplier pricing (optionally filtered by supplier)
    http.get('/api/supplier-pricing', async ({ request }) => {
        await delay(300)
        const url = new URL(request.url)
        const supplierId = url.searchParams.get('supplier_id')

        if (supplierId) {
            const filtered = supplierPricing.filter(p => p.supplier_id === Number(supplierId) && !p.effective_to)
            return HttpResponse.json({ pricing: filtered })
        }

        // Return only active pricing (no effective_to date)
        const activePricing = supplierPricing.filter(p => !p.effective_to)
        return HttpResponse.json({ pricing: activePricing })
    }),

    // Get pricing for a specific supplier and product
    http.get('/api/supplier-pricing/:supplierId/:productId', async ({ params }) => {
        await delay(200)
        const { supplierId, productId } = params
        const pricing = supplierPricing.find(
            p => p.supplier_id === Number(supplierId) &&
                 p.product_id === Number(productId) &&
                 !p.effective_to
        )

        if (!pricing) {
            return new HttpResponse(null, { status: 404 })
        }

        return HttpResponse.json(pricing)
    }),

    // Update a single supplier pricing record
    http.put('/api/supplier-pricing/:supplierId/:productId', async ({ request, params }) => {
        await delay(400)
        const { supplierId, productId } = params
        const update = await request.json() as SupplierPricingUpdateRequest

        // Find the current active pricing (one without effective_to date)
        const index = supplierPricing.findIndex(
            p => p.supplier_id === Number(supplierId) &&
                 p.product_id === Number(productId) &&
                 !p.effective_to
        )

        if (index === -1) {
            return HttpResponse.json(
                { message: 'Active supplier pricing not found' },
                { status: 404 }
            )
        }

        // Archive old pricing by setting effective_to
        supplierPricing[index].effective_to = new Date().toISOString().split('T')[0]

        // Get supplier and product info
        const supplier = suppliers.find(s => s.supplier_id === Number(supplierId))
        const product = products.find(p => p.product_id === Number(productId))

        if (!supplier || !product) {
            return HttpResponse.json(
                { message: 'Supplier or product not found' },
                { status: 404 }
            )
        }

        // Create new pricing entry
        const newPricing: SupplierPricing = {
            supplier_pricing_id: Math.max(...supplierPricing.map(p => p.supplier_pricing_id || 0)) + 1,
            supplier_id: Number(supplierId),
            supplier_name: supplier.name,
            product_id: Number(productId),
            sku: product.sku,
            product_name: product.name,
            product_type: product.product_type,
            price: update.price,
            daily_hire_rate: update.daily_hire_rate,
            effective_from: update.effective_from || new Date().toISOString().split('T')[0]
        }

        supplierPricing.push(newPricing)
        return HttpResponse.json(newPricing)
    }),

    // Bulk update supplier pricing
    http.post('/api/supplier-pricing/bulk', async ({ request }) => {
        await delay(600)
        const { updates } = await request.json() as BulkSupplierPricingUpdateRequest

        const today = new Date().toISOString().split('T')[0]
        const results: SupplierPricing[] = []
        const errors: string[] = []

        for (const update of updates) {
            // Find supplier
            const supplier = suppliers.find(s => s.supplier_id === update.supplier_id)
            if (!supplier) {
                errors.push(`Supplier ID ${update.supplier_id} not found`)
                continue
            }

            // Find product by ID or SKU
            let product = update.product_id
                ? products.find(p => p.product_id === update.product_id)
                : products.find(p => p.sku === update.sku)

            if (!product) {
                const identifier = update.sku || `Product ID ${update.product_id}`
                errors.push(`Product ${identifier} not found`)
                continue
            }

            // Find the current active pricing (one without effective_to date)
            const index = supplierPricing.findIndex(
                p => p.supplier_id === update.supplier_id &&
                     p.product_id === product!.product_id &&
                     !p.effective_to
            )

            // If active pricing exists, archive it
            if (index !== -1) {
                supplierPricing[index].effective_to = today
            }

            // Create new pricing entry
            const newPricing: SupplierPricing = {
                supplier_pricing_id: Math.max(...supplierPricing.map(p => p.supplier_pricing_id || 0)) + 1,
                supplier_id: update.supplier_id,
                supplier_name: supplier.name,
                product_id: product.product_id!,
                sku: product.sku,
                product_name: product.name,
                product_type: product.product_type,
                price: update.price,
                daily_hire_rate: update.daily_hire_rate,
                effective_from: update.effective_from || today
            }

            supplierPricing.push(newPricing)
            results.push(newPricing)
        }

        return HttpResponse.json({
            success: results.length,
            failed: errors.length,
            results,
            errors
        })
    }),

    // Purchase Order endpoints
    // Get all purchase orders
    http.get('/api/purchase-orders', async () => {
        await delay(300)
        return HttpResponse.json({ orders: purchaseOrders })
    }),

    // Get single purchase order with lines and supplier name
    http.get('/api/purchase-orders/:id', async ({ params }) => {
        await delay(200)
        const { id } = params
        const order = purchaseOrders.find(o => o.po_id === Number(id))

        if (!order) {
            return new HttpResponse(null, { status: 404 })
        }

        const lines = poLineItems.filter(l => l.po_id === Number(id))
        const supplier = suppliers.find(s => s.supplier_id === order.supplier_id)

        return HttpResponse.json({
            ...order,
            lines,
            supplier_name: supplier?.name
        })
    }),

    // Create purchase order
    http.post('/api/purchase-orders', async ({ request }) => {
        await delay(500)
        const { supplier_id, delivery_date, lines } = await request.json() as {
            supplier_id: number
            delivery_date: string
            lines: { product_id: number, quantity_ordered: number, unit_price: number }[]
        }

        if (!lines || lines.length === 0) {
            return HttpResponse.json({ error: 'No line items provided' }, { status: 400 })
        }

        // Verify supplier exists
        const supplier = suppliers.find(s => s.supplier_id === supplier_id)
        if (!supplier) {
            return HttpResponse.json({ error: 'Supplier not found' }, { status: 404 })
        }

        // Create order
        const newOrderId = Math.max(0, ...purchaseOrders.map(o => o.po_id || 0)) + 1

        const total = lines.reduce((sum, line) => sum + (line.quantity_ordered * line.unit_price), 0)

        const newOrder: PurchaseOrder = {
            po_id: newOrderId,
            supplier_id,
            order_date: new Date().toISOString(),
            delivery_date,
            status: 'pending',
            total_amount: total
        }

        purchaseOrders.push(newOrder)

        // Create order lines
        const newLines: POLineItem[] = lines.map((line, index) => ({
            line_item_id: Math.max(0, ...poLineItems.map(l => l.line_item_id || 0)) + index + 1,
            po_id: newOrderId,
            product_id: line.product_id,
            quantity_ordered: line.quantity_ordered,
            unit_price: line.unit_price,
            status: 'pending'
        }))

        poLineItems.push(...newLines)

        return HttpResponse.json({
            ...newOrder,
            lines: newLines,
            supplier_name: supplier.name
        }, { status: 201 })
    }),

    // Update purchase order status
    http.patch('/api/purchase-orders/:id', async ({ params, request }) => {
        await delay(400)
        const { id } = params
        const updates = await request.json() as Partial<PurchaseOrder>

        const index = purchaseOrders.findIndex(o => o.po_id === Number(id))

        if (index === -1) {
            return new HttpResponse(null, { status: 404 })
        }

        purchaseOrders[index] = { ...purchaseOrders[index], ...updates }
        return HttpResponse.json(purchaseOrders[index])
    }),
]
