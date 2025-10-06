import { http, HttpResponse, delay } from 'msw'
import { mockProducts } from './data/products'
import { mockMonthlyChartData, mockDailyChartData, mockRadarChartData, mockPieChartData } from './data/charts'
import { Product } from '@/types'

// In-memory storage for products (simulates a database)
let products = [...mockProducts]

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
]
