import { Product, ProductsResponse } from "@/types"

const API_BASE_URL = '/api'

export const productsApi = {
    // Get all products
    async getAll(): Promise<Product[]> {
        const response = await fetch(`${API_BASE_URL}/products`)
        if (!response.ok) {
            throw new Error('Failed to fetch products')
        }
        const data: ProductsResponse = await response.json()
        return data.products
    },

    // Get single product by ID
    async getById(id: number): Promise<Product> {
        const response = await fetch(`${API_BASE_URL}/products/${id}`)
        if (!response.ok) {
            throw new Error(`Failed to fetch product ${id}`)
        }
        return response.json()
    },

    // Create new product
    async create(product: Omit<Product, 'product_id'>): Promise<Product> {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product),
        })
        if (!response.ok) {
            throw new Error('Failed to create product')
        }
        return response.json()
    },

    // Update existing product
    async update(id: number, product: Product): Promise<Product> {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product),
        })
        if (!response.ok) {
            throw new Error(`Failed to update product ${id}`)
        }
        return response.json()
    },

    // Delete product
    async delete(id: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'DELETE',
        })
        if (!response.ok) {
            throw new Error(`Failed to delete product ${id}`)
        }
    },
}
