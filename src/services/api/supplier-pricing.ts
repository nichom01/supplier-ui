import { SupplierPricing, SupplierPricingUpdateRequest, BulkSupplierPricingUpdateRequest, SupplierPricingResponse } from '@/types'

const API_BASE_URL = '/api'

export const supplierPricingApi = {
    // Get all supplier pricing
    async getAllSupplierPricing(): Promise<SupplierPricing[]> {
        const response = await fetch(`${API_BASE_URL}/supplier-pricing`)
        if (!response.ok) {
            throw new Error('Failed to fetch supplier pricing')
        }
        const data: SupplierPricingResponse = await response.json()
        return data.pricing
    },

    // Get supplier pricing filtered by supplier
    async getSupplierPricingBySupplier(supplierId: number): Promise<SupplierPricing[]> {
        const response = await fetch(`${API_BASE_URL}/supplier-pricing?supplier_id=${supplierId}`)
        if (!response.ok) {
            throw new Error('Failed to fetch supplier pricing')
        }
        const data: SupplierPricingResponse = await response.json()
        return data.pricing
    },

    // Get pricing for a specific supplier and product
    async getSupplierProductPricing(supplierId: number, productId: number): Promise<SupplierPricing> {
        const response = await fetch(`${API_BASE_URL}/supplier-pricing/${supplierId}/${productId}`)
        if (!response.ok) {
            throw new Error('Failed to fetch supplier product pricing')
        }
        return response.json()
    },

    // Update a single supplier pricing record
    async updateSupplierPricing(supplierId: number, productId: number, update: SupplierPricingUpdateRequest): Promise<SupplierPricing> {
        const response = await fetch(`${API_BASE_URL}/supplier-pricing/${supplierId}/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(update)
        })
        if (!response.ok) {
            throw new Error('Failed to update supplier pricing')
        }
        return response.json()
    },

    // Bulk update supplier pricing
    async bulkUpdateSupplierPricing(updates: BulkSupplierPricingUpdateRequest): Promise<{
        success: number
        failed: number
        results: SupplierPricing[]
        errors: string[]
    }> {
        const response = await fetch(`${API_BASE_URL}/supplier-pricing/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates)
        })
        if (!response.ok) {
            throw new Error('Failed to bulk update supplier pricing')
        }
        return response.json()
    }
}
