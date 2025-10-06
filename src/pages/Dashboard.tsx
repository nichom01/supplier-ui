"use client"

import { Bar, BarChart, XAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { useMemo, useEffect, useState } from "react"
import { chartsApi } from "@/services/api"
import { MonthlyChartData, DailyChartData, RadarChartData, PieChartData } from "@/types"

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig

const pieChartConfig = {
  NullPointer: {
    label: "NullPointer",
    color: "#2563eb",
  },
  Timeout: {
    label: "Timeout",
    color: "#60a5fa",
  },
  Validation: {
    label: "Validation",
    color: "#10b981",
  },
  Network: {
    label: "Network",
    color: "#f59e0b",
  },
  Database: {
    label: "Database",
    color: "#ef4444",
  },
  Other: {
    label: "Other",
    color: "#8b5cf6",
  },
} satisfies ChartConfig

export default function Dashboard() {
  const [chartData, setChartData] = useState<MonthlyChartData[]>([])
  const [dailyChartData, setDailyChartData] = useState<DailyChartData[]>([])
  const [radarChartData, setRadarChartData] = useState<RadarChartData[]>([])
  const [pieChartData, setPieChartData] = useState<PieChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const data = await chartsApi.getChartData()
        setChartData(data.monthly)
        setDailyChartData(data.daily)
        setRadarChartData(data.radar)
        setPieChartData(data.pie)
      } catch (error) {
        console.error('Failed to fetch chart data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [])

  const totalDesktop = useMemo(
    () => dailyChartData.reduce((acc, curr) => acc + curr.desktop, 0),
    [dailyChartData]
  )

  const totalMobile = useMemo(
    () => dailyChartData.reduce((acc, curr) => acc + curr.mobile, 0),
    [dailyChartData]
  )

  if (loading) {
    return (
      <>
        <PageHeader>
          <PageHeaderHeading>Dashboard</PageHeaderHeading>
        </PageHeader>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading chart data...</p>
        </div>
      </>
    )
  }

  return (
    <>
        <PageHeader>
            <PageHeaderHeading>Dashboard</PageHeaderHeading>
        </PageHeader>

        <Card className="w-full shadow-lg mb-6">
          <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
            <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
              <CardTitle>Bar Chart - Interactive</CardTitle>
              <CardDescription>
                Showing total visitors for the last 3 months
              </CardDescription>
            </div>
            <div className="flex">
              <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
                <span className="text-xs text-muted-foreground">
                  Desktop
                </span>
                <span className="text-3xl font-bold leading-none">
                  {totalDesktop.toLocaleString()}
                </span>
              </div>
              <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
                <span className="text-xs text-muted-foreground">
                  Mobile
                </span>
                <span className="text-3xl font-bold leading-none">
                  {totalMobile.toLocaleString()}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:p-6">
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <BarChart
                accessibilityLayer
                data={dailyChartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[150px]"
                      nameKey="visitors"
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      }}
                    />
                  }
                />
                <Bar dataKey="desktop" fill="var(--color-desktop)" />
                <Bar dataKey="mobile" fill="var(--color-mobile)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="shadow-lg">
              <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <RadarChart data={radarChartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Radar
                    dataKey="desktop"
                    stroke="var(--color-desktop)"
                    fill="var(--color-desktop)"
                    fillOpacity={0.6}
                  />
                  <Radar
                    dataKey="mobile"
                    stroke="var(--color-mobile)"
                    fill="var(--color-mobile)"
                    fillOpacity={0.6}
                  />
              </RadarChart>
              </ChartContainer>
          </Card>
          <Card className="shadow-md">
              <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <LineChart data={chartData}>
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="desktop"
                    stroke="var(--color-desktop)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="mobile"
                    stroke="var(--color-mobile)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
              </LineChart>
              </ChartContainer>
          </Card>
          <Card>
              <ChartContainer config={pieChartConfig} className="min-h-[200px] w-full">
              <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.name}: ${((entry.value / pieChartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend />
              </PieChart>
              </ChartContainer>
          </Card>
        </div>
    </>
  )
}
