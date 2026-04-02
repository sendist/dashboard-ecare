"use client";

import { useMemo, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ChartBarMultiple } from "@/components/custom/analytics/bar-chart";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTrendData } from "@/hooks/use-trend-data";
import { cn } from "@/lib/utils";

function formatDateInput(date: Date): string {
    return date.toISOString().split("T")[0];
}

export default function AnalyticsPage() {
    const defaultDates = useMemo(() => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        return {
            startDate: formatDateInput(yesterday),
            endDate: formatDateInput(today),
        };
    }, []);

    const [startDateInput, setStartDateInput] = useState(defaultDates.startDate);
    const [endDateInput, setEndDateInput] = useState(defaultDates.endDate);
    const [appliedRange, setAppliedRange] = useState(defaultDates);

    const { trendData, loading, error } = useTrendData(appliedRange);

    const rangeError = startDateInput > endDateInput
        ? "Start date cannot be greater than end date."
        : null;

    const applyDateRange = () => {
        if (rangeError) return;
        setAppliedRange({ startDate: startDateInput, endDate: endDateInput });
    };

    const startDateSelected = startDateInput ? new Date(`${startDateInput}T00:00:00`) : undefined;
    const endDateSelected = endDateInput ? new Date(`${endDateInput}T00:00:00`) : undefined;

    const DateRangeControls = (
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end">
            <div className="grid gap-1">
                <label className="text-sm">Start date</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className={cn("w-55 justify-start text-left font-normal", !startDateSelected && "text-muted-foreground")}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDateSelected ? format(startDateSelected, "PPP") : "Pick a date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={startDateSelected}
                            onSelect={(date) => date && setStartDateInput(formatDateInput(date))}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="grid gap-1">
                <label className="text-sm">End date</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className={cn("w-55 justify-start text-left font-normal", !endDateSelected && "text-muted-foreground")}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDateSelected ? format(endDateSelected, "PPP") : "Pick a date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={endDateSelected}
                            onSelect={(date) => date && setEndDateInput(formatDateInput(date))}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <Button type="button" onClick={applyDateRange} disabled={Boolean(rangeError)}>Apply</Button>
        </div>
    );

    if (loading) {
        return (
            <div className="container px-4 pb-4">
                <h1 className="text-3xl mb-2">Analytics</h1>
                {DateRangeControls}
                {rangeError ? <p className="mb-2 text-sm text-destructive">{rangeError}</p> : null}
                <p className="text-muted-foreground">Loading trend data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container px-4 pb-4">
                <h1 className="text-3xl mb-2">Analytics</h1>
                {DateRangeControls}
                {rangeError ? <p className="mb-2 text-sm text-destructive">{rangeError}</p> : null}
                <p className="text-destructive">{error}</p>
            </div>
        );
    }

    return (
        <div className="container px-4 pb-4">
            <h1 className="text-3xl mb-2">Analytics</h1>
            {DateRangeControls}
            {rangeError ? <p className="mb-2 text-sm text-destructive">{rangeError}</p> : null}
            <div className="grid gap-4">
                {trendData?.series.map((series) => (
                    <ChartBarMultiple
                        key={`${series.tambahan}-${series.segment}`}
                        data={series.data}
                        title={`${series.tambahan} — ${series.segment}`}
                        description={`${trendData.meta.startDate} to ${trendData.meta.endDate}`}
                    />
                ))}
                {trendData?.series.length === 0 && (
                    <p className="text-muted-foreground">No trend data available for the selected period.</p>
                )}
            </div>
        </div>
    );
}