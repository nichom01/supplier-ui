import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Cart } from '@/types'
import { cartApi } from '@/services/api'

type CartContextType = {
    cart: Cart
    isLoading: boolean
    error: string | null
    addToCart: (product_id: number, quantity: number) => Promise<void>
    updateQuantity: (product_id: number, quantity: number) => Promise<void>
    removeItem: (product_id: number) => Promise<void>
    clearCart: () => Promise<void>
    refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<Cart>({ items: [], total: 0 })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Load cart on mount
    useEffect(() => {
        refreshCart()
    }, [])

    const refreshCart = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await cartApi.getCart()
            setCart(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load cart')
        } finally {
            setIsLoading(false)
        }
    }

    const addToCart = async (product_id: number, quantity: number) => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await cartApi.addToCart(product_id, quantity)
            setCart(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add to cart')
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const updateQuantity = async (product_id: number, quantity: number) => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await cartApi.updateCartItem(product_id, quantity)
            setCart(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update cart')
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const removeItem = async (product_id: number) => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await cartApi.removeFromCart(product_id)
            setCart(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove item')
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const clearCart = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await cartApi.clearCart()
            setCart(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to clear cart')
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <CartContext.Provider
            value={{
                cart,
                isLoading,
                error,
                addToCart,
                updateQuantity,
                removeItem,
                clearCart,
                refreshCart
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
