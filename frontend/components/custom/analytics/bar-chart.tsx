"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface TrendDataPoint {
  t: string
  caseIn: number
  caseHandle: number
  avgRespSec: number | null
}

interface ChartBarMultipleProps {
  data: TrendDataPoint[]
  title?: string
  description?: string
}

const chartConfig = {
  caseIn: {
    label: "Case In",
    color: "var(--chart-1)",
  },
  caseHandle: {
    label: "Case Handle",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartBarMultiple({ data, title = "Trend", description = "" }: ChartBarMultipleProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full h-[200px]">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <YAxis />
            <XAxis
              dataKey="t"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="caseIn" fill="var(--color-caseIn)" radius={4} />
            <Bar dataKey="caseHandle" fill="var(--color-caseHandle)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
