import { MonthlyChartData, DailyChartData, RadarChartData, PieChartData } from "@/types"

export const mockMonthlyChartData: MonthlyChartData[] = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
]

// Generate daily data for the last 3 months (90 days)
const generateDailyData = (): DailyChartData[] => {
    const data: DailyChartData[] = []
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 90)

    for (let i = 0; i < 90; i++) {
        const currentDate = new Date(startDate)
        currentDate.setDate(startDate.getDate() + i)

        data.push({
            date: currentDate.toISOString().split('T')[0],
            desktop: Math.floor(Math.random() * 400) + 100,
            mobile: Math.floor(Math.random() * 400) + 100,
        })
    }

    return data
}

export const mockDailyChartData: DailyChartData[] = generateDailyData()

export const mockRadarChartData: RadarChartData[] = [
    { category: "Performance", desktop: 186, mobile: 120 },
    { category: "Security", desktop: 305, mobile: 200 },
    { category: "Reliability", desktop: 237, mobile: 180 },
    { category: "Usability", desktop: 273, mobile: 190 },
    { category: "Efficiency", desktop: 209, mobile: 150 },
]

export const mockPieChartData: PieChartData[] = [
    { name: "NullPointer", value: 285, fill: "#2563eb" },
    { name: "Timeout", value: 200, fill: "#60a5fa" },
    { name: "Validation", value: 187, fill: "#10b981" },
    { name: "Network", value: 173, fill: "#f59e0b" },
    { name: "Database", value: 90, fill: "#ef4444" },
    { name: "Other", value: 65, fill: "#8b5cf6" },
]
