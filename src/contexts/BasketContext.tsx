import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Basket } from '@/types'
import { basketApi } from '@/services/api'

type BasketContextType = {
    basket: Basket
    isLoading: boolean
    error: string | null
    addToBasket: (product_id: number, quantity: number, hire_start_date?: string, hire_end_date?: string, asset_id?: number) => Promise<void>
    updateQuantity: (product_id: number, quantity: number) => Promise<void>
    removeItem: (product_id: number) => Promise<void>
    clearBasket: () => Promise<void>
    refreshBasket: () => Promise<void>
    updateLineDiscount: (product_id: number, discount_type?: 'percentage' | 'fixed', discount_value?: number) => Promise<void>
    updateOrderDiscount: (discount_type?: 'percentage' | 'fixed', discount_value?: number) => Promise<void>
}

const BasketContext = createContext<BasketContextType | undefined>(undefined)

export function BasketProvider({ children }: { children: ReactNode }) {
    const [basket, setBasket] = useState<Basket>({ items: [], total: 0 })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Load basket on mount
    useEffect(() => {
        refreshBasket()
    }, [])

    const refreshBasket = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await basketApi.getBasket()
            setBasket(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load basket')
        } finally {
            setIsLoading(false)
        }
    }

    const addToBasket = async (
        product_id: number,
        quantity: number,
        hire_start_date?: string,
        hire_end_date?: string,
        asset_id?: number
    ) => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await basketApi.addToBasket(product_id, quantity, hire_start_date, hire_end_date, asset_id)
            setBasket(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add to basket')
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const updateQuantity = async (product_id: number, quantity: number) => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await basketApi.updateBasketItem(product_id, quantity)
            setBasket(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update basket')
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const removeItem = async (product_id: number) => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await basketApi.removeFromBasket(product_id)
            setBasket(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove item')
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const clearBasket = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await basketApi.clearBasket()
            setBasket(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to clear basket')
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const updateLineDiscount = async (product_id: number, discount_type?: 'percentage' | 'fixed', discount_value?: number) => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await basketApi.updateLineDiscount(product_id, discount_type, discount_value)
            setBasket(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update discount')
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const updateOrderDiscount = async (discount_type?: 'percentage' | 'fixed', discount_value?: number) => {
        try {
            setIsLoading(true)
            setError(null)
            console.log('Updating order discount:', { discount_type, discount_value })
            const data = await basketApi.updateOrderDiscount(discount_type, discount_value)
            console.log('Order discount response:', data)
            setBasket(data)
        } catch (err) {
            console.error('Error updating order discount:', err)
            setError(err instanceof Error ? err.message : 'Failed to update order discount')
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <BasketContext.Provider
            value={{
                basket,
                isLoading,
                error,
                addToBasket,
                updateQuantity,
                removeItem,
                clearBasket,
                refreshBasket,
                updateLineDiscount,
                updateOrderDiscount
            }}
        >
            {children}
        </BasketContext.Provider>
    )
}

export function useBasket() {
    const context = useContext(BasketContext)
    if (context === undefined) {
        throw new Error('useBasket must be used within a BasketProvider')
    }
    return context
}
