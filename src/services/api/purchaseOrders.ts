import { PurchaseOrder, PurchaseOrderWithLines, PurchaseOrdersResponse } from '@/types'

const API_BASE = '/api'

export type CreatePurchaseOrderRequest = {
    supplier_id: number
    delivery_date: string
    lines: {
        product_id: number
        quantity_ordered: number
        unit_price: number
    }[]
}

export const purchaseOrdersApi = {
    // Get all purchase orders
    getAll: async (): Promise<PurchaseOrdersResponse> => {
        const response = await fetch(`${API_BASE}/purchase-orders`)
        if (!response.ok) throw new Error('Failed to fetch purchase orders')
        return response.json()
    },

    // Get single purchase order with lines
    getById: async (id: number): Promise<PurchaseOrderWithLines> => {
        const response = await fetch(`${API_BASE}/purchase-orders/${id}`)
        if (!response.ok) throw new Error('Failed to fetch purchase order')
        return response.json()
    },

    // Create purchase order
    create: async (data: CreatePurchaseOrderRequest): Promise<PurchaseOrderWithLines> => {
        const response = await fetch(`${API_BASE}/purchase-orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to create purchase order')
        }
        return response.json()
    },

    // Update purchase order status
    updateStatus: async (id: number, status: PurchaseOrder['status']): Promise<PurchaseOrder> => {
        const response = await fetch(`${API_BASE}/purchase-orders/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        })
        if (!response.ok) throw new Error('Failed to update purchase order')
        return response.json()
    }
}
