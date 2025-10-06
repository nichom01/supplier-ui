import { Asset, AssetAvailability } from "@/types"

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

export const assetsApi = {
    // Get all assets for a product
    getByProductId: async (productId: number): Promise<Asset[]> => {
        const response = await fetch(`${API_BASE}/assets?product_id=${productId}`)
        if (!response.ok) {
            throw new Error('Failed to fetch assets')
        }
        const data = await response.json()
        return data.assets
    },

    // Get a specific asset
    getById: async (assetId: number): Promise<Asset> => {
        const response = await fetch(`${API_BASE}/assets/${assetId}`)
        if (!response.ok) {
            throw new Error('Failed to fetch asset')
        }
        return response.json()
    },

    // Check availability for a product between dates
    checkAvailability: async (
        productId: number,
        startDate: string,
        endDate: string
    ): Promise<{ available_assets: Asset[] }> => {
        const response = await fetch(
            `${API_BASE}/assets/availability?product_id=${productId}&start_date=${startDate}&end_date=${endDate}`
        )
        if (!response.ok) {
            throw new Error('Failed to check availability')
        }
        return response.json()
    },

    // Get availability calendar for a specific asset
    getAssetAvailability: async (
        assetId: number,
        startDate: string,
        endDate: string
    ): Promise<AssetAvailability[]> => {
        const response = await fetch(
            `${API_BASE}/assets/${assetId}/availability?start_date=${startDate}&end_date=${endDate}`
        )
        if (!response.ok) {
            throw new Error('Failed to fetch asset availability')
        }
        const data = await response.json()
        return data.availability
    }
}
