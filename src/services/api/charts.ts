import { ChartDataResponse } from "@/types"

const API_BASE_URL = '/api'

export const chartsApi = {
    // Get all chart data
    async getChartData(): Promise<ChartDataResponse> {
        const response = await fetch(`${API_BASE_URL}/charts`)
        if (!response.ok) {
            throw new Error('Failed to fetch chart data')
        }
        return response.json()
    },
}
