"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "A multiple bar chart"

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartData2 = [
                {
                    "t": "2026-02-18T00:00:00.000Z",
                    "caseIn": 42,
                    "caseHandle": 41,
                    "avgRespSec": 174
                },
                {
                    "t": "2026-02-18T00:15:00.000Z",
                    "caseIn": 24,
                    "caseHandle": 22,
                    "avgRespSec": 214
                },
                {
                    "t": "2026-02-18T00:30:00.000Z",
                    "caseIn": 28,
                    "caseHandle": 27,
                    "avgRespSec": 160
                },
                {
                    "t": "2026-02-18T00:45:00.000Z",
                    "caseIn": 36,
                    "caseHandle": 34,
                    "avgRespSec": 177
                },
                {
                    "t": "2026-02-18T01:00:00.000Z",
                    "caseIn": 29,
                    "caseHandle": 27,
                    "avgRespSec": 168
                },
                {
                    "t": "2026-02-18T01:15:00.000Z",
                    "caseIn": 38,
                    "caseHandle": 38,
                    "avgRespSec": 221
                },
                {
                    "t": "2026-02-18T01:30:00.000Z",
                    "caseIn": 38,
                    "caseHandle": 36,
                    "avgRespSec": 274
                },
                {
                    "t": "2026-02-18T01:45:00.000Z",
                    "caseIn": 34,
                    "caseHandle": 31,
                    "avgRespSec": 240
                },
                {
                    "t": "2026-02-18T02:00:00.000Z",
                    "caseIn": 31,
                    "caseHandle": 31,
                    "avgRespSec": 226
                },
                {
                    "t": "2026-02-18T02:15:00.000Z",
                    "caseIn": 34,
                    "caseHandle": 33,
                    "avgRespSec": 253
                },
                {
                    "t": "2026-02-18T02:30:00.000Z",
                    "caseIn": 36,
                    "caseHandle": 35,
                    "avgRespSec": 167
                },
                {
                    "t": "2026-02-18T02:45:00.000Z",
                    "caseIn": 43,
                    "caseHandle": 43,
                    "avgRespSec": 176
                },
                {
                    "t": "2026-02-18T03:00:00.000Z",
                    "caseIn": 49,
                    "caseHandle": 48,
                    "avgRespSec": 155
                },
                {
                    "t": "2026-02-18T03:15:00.000Z",
                    "caseIn": 41,
                    "caseHandle": 41,
                    "avgRespSec": 225
                },
                {
                    "t": "2026-02-18T03:30:00.000Z",
                    "caseIn": 48,
                    "caseHandle": 46,
                    "avgRespSec": 236
                },
                {
                    "t": "2026-02-18T03:45:00.000Z",
                    "caseIn": 38,
                    "caseHandle": 35,
                    "avgRespSec": 251
                },
                {
                    "t": "2026-02-18T04:00:00.000Z",
                    "caseIn": 33,
                    "caseHandle": 32,
                    "avgRespSec": 322
                },
                {
                    "t": "2026-02-18T04:15:00.000Z",
                    "caseIn": 40,
                    "caseHandle": 39,
                    "avgRespSec": 157
                },
                {
                    "t": "2026-02-18T04:30:00.000Z",
                    "caseIn": 40,
                    "caseHandle": 40,
                    "avgRespSec": 170
                },
                {
                    "t": "2026-02-18T04:45:00.000Z",
                    "caseIn": 43,
                    "caseHandle": 39,
                    "avgRespSec": 363
                },
                {
                    "t": "2026-02-18T05:00:00.000Z",
                    "caseIn": 46,
                    "caseHandle": 43,
                    "avgRespSec": 514
                },
                {
                    "t": "2026-02-18T05:15:00.000Z",
                    "caseIn": 42,
                    "caseHandle": 38,
                    "avgRespSec": 473
                },
                {
                    "t": "2026-02-18T05:30:00.000Z",
                    "caseIn": 46,
                    "caseHandle": 42,
                    "avgRespSec": 218
                },
                {
                    "t": "2026-02-18T05:45:00.000Z",
                    "caseIn": 48,
                    "caseHandle": 46,
                    "avgRespSec": 215
                },
                {
                    "t": "2026-02-18T06:00:00.000Z",
                    "caseIn": 41,
                    "caseHandle": 40,
                    "avgRespSec": 185
                },
                {
                    "t": "2026-02-18T06:15:00.000Z",
                    "caseIn": 40,
                    "caseHandle": 39,
                    "avgRespSec": 232
                },
                {
                    "t": "2026-02-18T06:30:00.000Z",
                    "caseIn": 39,
                    "caseHandle": 38,
                    "avgRespSec": 406
                },
                {
                    "t": "2026-02-18T06:45:00.000Z",
                    "caseIn": 45,
                    "caseHandle": 40,
                    "avgRespSec": 272
                },
                {
                    "t": "2026-02-18T07:00:00.000Z",
                    "caseIn": 29,
                    "caseHandle": 29,
                    "avgRespSec": 229
                },
                {
                    "t": "2026-02-18T07:15:00.000Z",
                    "caseIn": 35,
                    "caseHandle": 35,
                    "avgRespSec": 212
                },
                {
                    "t": "2026-02-18T07:30:00.000Z",
                    "caseIn": 37,
                    "caseHandle": 37,
                    "avgRespSec": 208
                },
                {
                    "t": "2026-02-18T07:45:00.000Z",
                    "caseIn": 38,
                    "caseHandle": 38,
                    "avgRespSec": 186
                },
                {
                    "t": "2026-02-18T08:00:00.000Z",
                    "caseIn": 38,
                    "caseHandle": 36,
                    "avgRespSec": 229
                },
                {
                    "t": "2026-02-18T08:15:00.000Z",
                    "caseIn": 52,
                    "caseHandle": 51,
                    "avgRespSec": 279
                },
                {
                    "t": "2026-02-18T08:30:00.000Z",
                    "caseIn": 39,
                    "caseHandle": 37,
                    "avgRespSec": 337
                },
                {
                    "t": "2026-02-18T08:45:00.000Z",
                    "caseIn": 41,
                    "caseHandle": 40,
                    "avgRespSec": 203
                },
                {
                    "t": "2026-02-18T09:00:00.000Z",
                    "caseIn": 38,
                    "caseHandle": 38,
                    "avgRespSec": 190
                },
                {
                    "t": "2026-02-18T09:15:00.000Z",
                    "caseIn": 31,
                    "caseHandle": 31,
                    "avgRespSec": 238
                },
                {
                    "t": "2026-02-18T09:30:00.000Z",
                    "caseIn": 38,
                    "caseHandle": 38,
                    "avgRespSec": 164
                },
                {
                    "t": "2026-02-18T09:45:00.000Z",
                    "caseIn": 53,
                    "caseHandle": 52,
                    "avgRespSec": 240
                },
                {
                    "t": "2026-02-18T10:00:00.000Z",
                    "caseIn": 40,
                    "caseHandle": 39,
                    "avgRespSec": 238
                },
                {
                    "t": "2026-02-18T10:15:00.000Z",
                    "caseIn": 44,
                    "caseHandle": 43,
                    "avgRespSec": 221
                },
                {
                    "t": "2026-02-18T10:30:00.000Z",
                    "caseIn": 53,
                    "caseHandle": 52,
                    "avgRespSec": 216
                },
                {
                    "t": "2026-02-18T10:45:00.000Z",
                    "caseIn": 41,
                    "caseHandle": 41,
                    "avgRespSec": 264
                },
                {
                    "t": "2026-02-18T11:00:00.000Z",
                    "caseIn": 47,
                    "caseHandle": 47,
                    "avgRespSec": 224
                },
                {
                    "t": "2026-02-18T11:15:00.000Z",
                    "caseIn": 48,
                    "caseHandle": 47,
                    "avgRespSec": 213
                },
                {
                    "t": "2026-02-18T11:30:00.000Z",
                    "caseIn": 48,
                    "caseHandle": 44,
                    "avgRespSec": 240
                },
                {
                    "t": "2026-02-18T11:45:00.000Z",
                    "caseIn": 37,
                    "caseHandle": 36,
                    "avgRespSec": 244
                },
                {
                    "t": "2026-02-18T12:00:00.000Z",
                    "caseIn": 34,
                    "caseHandle": 33,
                    "avgRespSec": 232
                },
                {
                    "t": "2026-02-18T12:15:00.000Z",
                    "caseIn": 48,
                    "caseHandle": 46,
                    "avgRespSec": 305
                },
                {
                    "t": "2026-02-18T12:30:00.000Z",
                    "caseIn": 51,
                    "caseHandle": 48,
                    "avgRespSec": 310
                },
                {
                    "t": "2026-02-18T12:45:00.000Z",
                    "caseIn": 45,
                    "caseHandle": 43,
                    "avgRespSec": 213
                },
                {
                    "t": "2026-02-18T13:00:00.000Z",
                    "caseIn": 49,
                    "caseHandle": 48,
                    "avgRespSec": 221
                },
                {
                    "t": "2026-02-18T13:15:00.000Z",
                    "caseIn": 45,
                    "caseHandle": 41,
                    "avgRespSec": 333
                },
                {
                    "t": "2026-02-18T13:30:00.000Z",
                    "caseIn": 46,
                    "caseHandle": 44,
                    "avgRespSec": 340
                },
                {
                    "t": "2026-02-18T13:45:00.000Z",
                    "caseIn": 39,
                    "caseHandle": 38,
                    "avgRespSec": 211
                },
                {
                    "t": "2026-02-18T14:00:00.000Z",
                    "caseIn": 44,
                    "caseHandle": 44,
                    "avgRespSec": 206
                },
                {
                    "t": "2026-02-18T14:15:00.000Z",
                    "caseIn": 49,
                    "caseHandle": 49,
                    "avgRespSec": 182
                },
                {
                    "t": "2026-02-18T14:30:00.000Z",
                    "caseIn": 42,
                    "caseHandle": 42,
                    "avgRespSec": 132
                },
                {
                    "t": "2026-02-18T14:45:00.000Z",
                    "caseIn": 59,
                    "caseHandle": 59,
                    "avgRespSec": 176
                },
                {
                    "t": "2026-02-18T15:00:00.000Z",
                    "caseIn": 54,
                    "caseHandle": 54,
                    "avgRespSec": 168
                },
                {
                    "t": "2026-02-18T15:15:00.000Z",
                    "caseIn": 44,
                    "caseHandle": 43,
                    "avgRespSec": 172
                },
                {
                    "t": "2026-02-18T15:30:00.000Z",
                    "caseIn": 44,
                    "caseHandle": 44,
                    "avgRespSec": 239
                },
                {
                    "t": "2026-02-18T15:45:00.000Z",
                    "caseIn": 47,
                    "caseHandle": 46,
                    "avgRespSec": 229
                },
                {
                    "t": "2026-02-18T16:00:00.000Z",
                    "caseIn": 46,
                    "caseHandle": 45,
                    "avgRespSec": 326
                },
                {
                    "t": "2026-02-18T16:15:00.000Z",
                    "caseIn": 48,
                    "caseHandle": 48,
                    "avgRespSec": 189
                },
                {
                    "t": "2026-02-18T16:30:00.000Z",
                    "caseIn": 29,
                    "caseHandle": 29,
                    "avgRespSec": 161
                },
                {
                    "t": "2026-02-18T16:45:00.000Z",
                    "caseIn": 25,
                    "caseHandle": 25,
                    "avgRespSec": 207
                }
            ]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartBarMultiple() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bar Chart - Multiple</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full h-[200px]">
          <BarChart accessibilityLayer data={chartData2}>
            <CartesianGrid vertical={false} />
            <YAxis />
            <XAxis
              dataKey="t"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
        const date = new Date(value);
        return date.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })} }
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="caseIn" fill="var(--color-desktop)" radius={4} />
            <Bar dataKey="caseHandle" fill="var(--color-mobile)" radius={4} />
            {/* <Bar dataKey="avgRespSec" fill="var(--color-chart-3)" radius={4} /> */}
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}
