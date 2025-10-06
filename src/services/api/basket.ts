import { Basket } from '@/types'

const API_BASE = '/api'

export const basketApi = {
    // Get current basket
    getBasket: async (): Promise<Basket> => {
        const response = await fetch(`${API_BASE}/basket`)
        if (!response.ok) throw new Error('Failed to fetch basket')
        return response.json()
    },

    // Add item to basket
    addToBasket: async (
        product_id: number,
        quantity: number,
        hire_start_date?: string,
        hire_end_date?: string,
        asset_id?: number
    ): Promise<Basket> => {
        const response = await fetch(`${API_BASE}/basket`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product_id,
                quantity,
                hire_start_date,
                hire_end_date,
                asset_id
            })
        })
        if (!response.ok) throw new Error('Failed to add to basket')
        return response.json()
    },

    // Update basket item quantity
    updateBasketItem: async (product_id: number, quantity: number): Promise<Basket> => {
        const response = await fetch(`${API_BASE}/basket/${product_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity })
        })
        if (!response.ok) throw new Error('Failed to update basket item')
        return response.json()
    },

    // Remove item from basket
    removeFromBasket: async (product_id: number): Promise<Basket> => {
        const response = await fetch(`${API_BASE}/basket/${product_id}`, {
            method: 'DELETE'
        })
        if (!response.ok) throw new Error('Failed to remove from basket')
        return response.json()
    },

    // Clear entire basket
    clearBasket: async (): Promise<Basket> => {
        const response = await fetch(`${API_BASE}/basket`, {
            method: 'DELETE'
        })
        if (!response.ok) throw new Error('Failed to clear basket')
        return response.json()
    }
}
