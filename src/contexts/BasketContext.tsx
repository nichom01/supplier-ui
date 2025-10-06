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
                refreshBasket
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
