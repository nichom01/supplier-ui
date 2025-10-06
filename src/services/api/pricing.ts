import { DefaultPricing, PricingUpdateRequest, BulkPricingUpdateRequest, PricingResponse } from '@/types'

const API_BASE_URL = '/api'

export const pricingApi = {
    // Get all pricing
    async getAllPricing(): Promise<DefaultPricing[]> {
        const response = await fetch(`${API_BASE_URL}/pricing`)
        if (!response.ok) {
            throw new Error('Failed to fetch pricing')
        }
        const data: PricingResponse = await response.json()
        return data.pricing
    },

    // Get pricing for a specific product
    async getProductPricing(productId: number): Promise<DefaultPricing> {
        const response = await fetch(`${API_BASE_URL}/pricing/${productId}`)
        if (!response.ok) {
            throw new Error('Failed to fetch product pricing')
        }
        return response.json()
    },

    // Update a single pricing record
    async updatePricing(productId: number, update: PricingUpdateRequest): Promise<DefaultPricing> {
        const response = await fetch(`${API_BASE_URL}/pricing/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(update)
        })
        if (!response.ok) {
            throw new Error('Failed to update pricing')
        }
        return response.json()
    },

    // Bulk update pricing
    async bulkUpdatePricing(updates: BulkPricingUpdateRequest): Promise<{
        success: number
        failed: number
        results: DefaultPricing[]
        errors: string[]
    }> {
        const response = await fetch(`${API_BASE_URL}/pricing/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates)
        })
        if (!response.ok) {
            throw new Error('Failed to bulk update pricing')
        }
        return response.json()
    }
}
