import { Cart } from '@/types'

const API_BASE = '/api'

export const cartApi = {
    // Get current cart
    getCart: async (): Promise<Cart> => {
        const response = await fetch(`${API_BASE}/cart`)
        if (!response.ok) throw new Error('Failed to fetch cart')
        return response.json()
    },

    // Add item to cart
    addToCart: async (product_id: number, quantity: number): Promise<Cart> => {
        const response = await fetch(`${API_BASE}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id, quantity })
        })
        if (!response.ok) throw new Error('Failed to add to cart')
        return response.json()
    },

    // Update cart item quantity
    updateCartItem: async (product_id: number, quantity: number): Promise<Cart> => {
        const response = await fetch(`${API_BASE}/cart/${product_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity })
        })
        if (!response.ok) throw new Error('Failed to update cart item')
        return response.json()
    },

    // Remove item from cart
    removeFromCart: async (product_id: number): Promise<Cart> => {
        const response = await fetch(`${API_BASE}/cart/${product_id}`, {
            method: 'DELETE'
        })
        if (!response.ok) throw new Error('Failed to remove from cart')
        return response.json()
    },

    // Clear entire cart
    clearCart: async (): Promise<Cart> => {
        const response = await fetch(`${API_BASE}/cart`, {
            method: 'DELETE'
        })
        if (!response.ok) throw new Error('Failed to clear cart')
        return response.json()
    }
}
