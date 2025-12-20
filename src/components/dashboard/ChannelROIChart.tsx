import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { channel: "Facebook Ads", roi: 320, cost: 25, leads: 180 },
  { channel: "Google Ads", roi: 280, cost: 35, leads: 150 },
  { channel: "TikTok", roi: 180, cost: 15, leads: 90 },
  { channel: "Zalo OA", roi: 420, cost: 8, leads: 120 },
  { channel: "Referral", roi: 550, cost: 5, leads: 80 },
];

interface ChannelROIChartProps {
  className?: string;
}

export function ChannelROIChart({ className }: ChannelROIChartProps) {
  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">ROI theo Kênh Marketing</h3>
          <p className="text-sm text-muted-foreground">Hiệu suất kênh - Tháng 12/2024</p>
        </div>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="channel"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              angle={-15}
              textAnchor="end"
              height={60}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "var(--shadow-md)",
              }}
              formatter={(value: number, name: string) => {
                if (name === "roi") return [`${value}%`, "ROI"];
                if (name === "cost") return [`${value} triệu`, "Chi phí"];
                return [`${value}`, "Leads"];
              }}
            />
            <Legend
              formatter={(value) => {
                if (value === "roi") return "ROI (%)";
                if (value === "cost") return "Chi phí (tr)";
                return "Leads";
              }}
            />
            <Bar dataKey="roi" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
