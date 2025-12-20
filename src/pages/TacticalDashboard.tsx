import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Users,
  Target,
  Phone,
  Star,
  ThumbsUp,
  Clock,
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from "recharts";

const channelData = [
  { week: "T1", facebook: 45, google: 32, zalo: 28, tiktok: 15 },
  { week: "T2", facebook: 52, google: 38, zalo: 32, tiktok: 22 },
  { week: "T3", facebook: 48, google: 42, zalo: 35, tiktok: 28 },
  { week: "T4", facebook: 58, google: 45, zalo: 38, tiktok: 32 },
];

const costData = [
  { channel: "Facebook", ads: 25, content: 8, tools: 5 },
  { channel: "Google", ads: 32, content: 5, tools: 8 },
  { channel: "Zalo", ads: 15, content: 10, tools: 3 },
  { channel: "TikTok", ads: 18, content: 12, tools: 4 },
];

const conversionData = [
  { stage: "Lead", value: 1200, rate: 100 },
  { stage: "Booking", value: 720, rate: 60 },
  { stage: "Show", value: 540, rate: 75 },
  { stage: "Close", value: 378, rate: 70 },
];

const doctorPerformance = [
  { name: "BS. Nguyễn Văn A", patients: 45, satisfaction: 4.8, revenue: 180 },
  { name: "BS. Trần Thị B", patients: 38, satisfaction: 4.9, revenue: 165 },
  { name: "BS. Lê Văn C", patients: 42, satisfaction: 4.7, revenue: 172 },
  { name: "BS. Phạm Thị D", patients: 35, satisfaction: 4.6, revenue: 145 },
];

const TacticalDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
      >
        <DashboardHeader onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main className="p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Bảng điều khiển Chiến thuật</h1>
            <p className="text-muted-foreground">Marketing, Sale/CSKH và hiệu suất Bác sĩ</p>
          </div>

          {/* Marketing KPIs */}
          <section className="mb-8 animate-fade-in">
            <h2 className="text-lg font-semibold text-foreground mb-4">KPI Marketing</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="CPL Trung bình"
                value="450k"
                change={-12.3}
                changeLabel="giảm so với tuần trước"
                icon={<Target className="h-5 w-5" />}
                variant="primary"
              />
              <KPICard
                title="CAC Trung bình"
                value="1.2tr"
                change={-8.5}
                changeLabel="giảm so với tuần trước"
                icon={<DollarSign className="h-5 w-5" />}
              />
              <KPICard
                title="ROI Facebook"
                value="385%"
                change={18.2}
                changeLabel="so với tuần trước"
                icon={<TrendingUp className="h-5 w-5" />}
              />
              <KPICard
                title="Tổng Lead"
                value="1,234"
                change={22.5}
                changeLabel="so với tuần trước"
                icon={<Users className="h-5 w-5" />}
              />
            </div>
          </section>

          {/* Charts Row */}
          <section className="mb-8 grid gap-6 lg:grid-cols-2">
            {/* Channel Performance */}
            <div className="rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <h3 className="font-semibold text-foreground mb-4">ROI theo kênh (Tuần)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={channelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="facebook" stroke="#6A1B9A" strokeWidth={2} name="Facebook" />
                  <Line type="monotone" dataKey="google" stroke="#8E24AA" strokeWidth={2} name="Google" />
                  <Line type="monotone" dataKey="zalo" stroke="#AB47BC" strokeWidth={2} name="Zalo" />
                  <Line type="monotone" dataKey="tiktok" stroke="#CE93D8" strokeWidth={2} name="TikTok" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Cost by Channel */}
            <div className="rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <h3 className="font-semibold text-foreground mb-4">Chi phí theo kênh</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={costData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v}tr`} />
                  <YAxis type="category" dataKey="channel" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="ads" stackId="a" fill="#6A1B9A" name="Quảng cáo" />
                  <Bar dataKey="content" stackId="a" fill="#AB47BC" name="Nội dung" />
                  <Bar dataKey="tools" stackId="a" fill="#CE93D8" name="Công cụ" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Sale/CSKH KPIs */}
          <section className="mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-lg font-semibold text-foreground mb-4">Sale/CSKH</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Tỷ lệ Booking"
                value="60%"
                change={5.2}
                icon={<Phone className="h-5 w-5" />}
                variant="primary"
              />
              <KPICard
                title="Tỷ lệ Show-up"
                value="75%"
                change={3.8}
                icon={<Clock className="h-5 w-5" />}
              />
              <KPICard
                title="Tỷ lệ Close"
                value="70%"
                change={2.5}
                icon={<Target className="h-5 w-5" />}
              />
              <KPICard
                title="CSAT Score"
                value="4.7/5"
                change={0.2}
                icon={<Star className="h-5 w-5" />}
              />
            </div>
          </section>

          {/* Conversion Funnel */}
          <section className="mb-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.25s" }}>
              <h3 className="font-semibold text-foreground mb-4">Phễu chuyển đổi</h3>
              <div className="space-y-4">
                {conversionData.map((stage, index) => (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{stage.stage}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-foreground">{stage.value.toLocaleString()}</span>
                        {index > 0 && (
                          <span className="text-xs text-muted-foreground">({stage.rate}%)</span>
                        )}
                      </div>
                    </div>
                    <div className="h-8 rounded bg-muted overflow-hidden">
                      <div
                        className="h-full rounded transition-all duration-500 flex items-center justify-center text-xs font-medium text-primary-foreground"
                        style={{
                          width: `${(stage.value / 1200) * 100}%`,
                          background: `linear-gradient(90deg, #6A1B9A ${100 - index * 20}%, #AB47BC)`,
                        }}
                      >
                        {stage.value.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CSAT/NPS Gauge */}
            <div className="rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <h3 className="font-semibold text-foreground mb-4">CSAT & NPS</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="hsl(var(--muted))" strokeWidth="12" fill="none" />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#6A1B9A"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${(4.7 / 5) * 352} 352`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-bold text-foreground">4.7</span>
                      <span className="text-xs text-muted-foreground">/5.0</span>
                    </div>
                  </div>
                  <p className="mt-2 font-medium text-foreground">CSAT</p>
                </div>
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="hsl(var(--muted))" strokeWidth="12" fill="none" />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#8E24AA"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${((72 + 100) / 200) * 352} 352`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-bold text-foreground">+72</span>
                      <span className="text-xs text-muted-foreground">NPS</span>
                    </div>
                  </div>
                  <p className="mt-2 font-medium text-foreground">NPS Score</p>
                </div>
              </div>
            </div>
          </section>

          {/* Doctor Performance */}
          <section className="mb-8">
            <div className="rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.35s" }}>
              <h3 className="font-semibold text-foreground mb-4">Hiệu suất Bác sĩ</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Bác sĩ</th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-muted-foreground">Số BN/tháng</th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-muted-foreground">Đánh giá</th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-muted-foreground">Doanh thu (tr)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorPerformance.map((doctor) => (
                      <tr key={doctor.name} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-medium text-foreground">{doctor.name}</td>
                        <td className="py-3 px-4 text-right text-foreground">{doctor.patients}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-foreground">
                            <Star className="h-4 w-4 fill-warning text-warning" />
                            {doctor.satisfaction}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-foreground">{doctor.revenue}tr</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default TacticalDashboard;
