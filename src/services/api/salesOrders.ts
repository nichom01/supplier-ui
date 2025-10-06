import { SalesOrder, SalesOrderWithLines, SalesOrdersResponse } from '@/types'

const API_BASE = '/api'

export type CreateSalesOrderRequest = {
    customer_id: number
    requested_delivery_date: string
    payment_terms: string
    shipping_method: string
    warehouse_id: number
}

export const salesOrdersApi = {
    // Get all sales orders
    getAll: async (): Promise<SalesOrdersResponse> => {
        const response = await fetch(`${API_BASE}/sales-orders`)
        if (!response.ok) throw new Error('Failed to fetch sales orders')
        return response.json()
    },

    // Get single sales order with lines
    getById: async (id: number): Promise<SalesOrderWithLines> => {
        const response = await fetch(`${API_BASE}/sales-orders/${id}`)
        if (!response.ok) throw new Error('Failed to fetch sales order')
        return response.json()
    },

    // Create sales order from cart
    create: async (data: CreateSalesOrderRequest): Promise<SalesOrderWithLines> => {
        const response = await fetch(`${API_BASE}/sales-orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to create sales order')
        }
        return response.json()
    },

    // Update sales order status
    updateStatus: async (id: number, status: SalesOrder['status']): Promise<SalesOrder> => {
        const response = await fetch(`${API_BASE}/sales-orders/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        })
        if (!response.ok) throw new Error('Failed to update sales order')
        return response.json()
    }
}
