import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp } from "lucide-react";

interface SpendingDataPoint {
  date: string;
  amount: number;
  category?: string;
  day: string;
}

interface SpendingChartProps {
  data?: SpendingDataPoint[];
  showAverage?: boolean;
  title?: string;
  lineColor?: string;
}

const categoryColors = {
  food: "hsl(var(--category-food))",
  transport: "hsl(var(--category-transport))",
  entertainment: "hsl(var(--category-entertainment))",
  shopping: "hsl(var(--category-shopping))",
  bills: "hsl(var(--category-bills))",
  other: "hsl(var(--category-other))",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium text-foreground">{`${label}`}</p>
        <p className="text-sm text-muted-foreground mb-2">{data.date}</p>
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: data.category
                ? categoryColors[data.category as keyof typeof categoryColors]
                : "hsl(var(--primary))",
            }}
          />
          <span className="text-sm font-medium text-success">
            ${payload[0].value.toFixed(2)}
          </span>
        </div>
        {data.category && (
          <p className="text-xs text-muted-foreground mt-1 capitalize">
            Category: {data.category}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <div className="bg-muted rounded-full p-6 mb-4">
      <BarChart3 className="h-12 w-12 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-medium text-foreground mb-2">No spending data yet</h3>
    <p className="text-sm text-muted-foreground max-w-sm">
      Start adding your expenses to see your spending patterns here!
    </p>
  </div>
);

export const SpendingChart = ({ data = [], showAverage = true, title, lineColor = "#ffffff" }: SpendingChartProps) => {
  const { chartData, averageSpending } = useMemo(() => {
    if (!data.length) {
      // Generate empty data for the last 7 days
      const today = new Date();
      const emptyData = [];
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        emptyData.push({
          day: dayNames[date.getDay()],
          date: date.toLocaleDateString(),
          amount: 0,
        });
      }
      
      return { chartData: emptyData, averageSpending: 0 };
    }

    const avg = data.reduce((sum, item) => sum + item.amount, 0) / data.length;
    return { chartData: data, averageSpending: avg };
  }, [data]);

  const hasData = data.length > 0 && data.some(item => item.amount > 0);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span>{title || "Daily Spending (Last 7 Days)"}</span>
          {hasData && showAverage && (
            <div className="flex items-center space-x-1 text-sm text-muted-foreground ml-auto">
              <TrendingUp className="h-4 w-4" />
              <span>Avg: ${averageSpending.toFixed(2)}</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <EmptyState />
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--chart-grid))" 
                  opacity={0.3}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {showAverage && averageSpending > 0 && (
                  <ReferenceLine
                    y={averageSpending}
                    stroke="hsl(var(--chart-average))"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    opacity={0.7}
                  />
                )}
                
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke={lineColor}
                  strokeWidth={3}
                  dot={{ 
                    r: 6, 
                    fill: "#ffffff",
                    strokeWidth: 2,
                    stroke: "hsl(var(--primary))"
                  }}
                  activeDot={{ 
                    r: 8, 
                    fill: "#ffffff",
                    strokeWidth: 2,
                    stroke: "hsl(var(--primary))"
                  }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};