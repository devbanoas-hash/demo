import { useState } from "react";
import {
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  Activity,
  Percent,
  Wallet,
  Target,
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { PatientChart } from "@/components/dashboard/PatientChart";
import { ChannelROIChart } from "@/components/dashboard/ChannelROIChart";
import { ConversionFunnel } from "@/components/dashboard/ConversionFunnel";

const AnalyticalDashboard = () => {
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
            <h1 className="text-2xl font-bold text-foreground">Bảng điều khiển Phân tích</h1>
            <p className="text-muted-foreground">Phân tích xu hướng, KPI và hiệu suất tổng thể</p>
          </div>

          {/* KPI Cards with Efficient Cost */}
          <section className="mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Chi phí hiệu quả</h2>
              <span className="text-sm text-muted-foreground">Cập nhật: Hôm nay</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
              <KPICard
                title="Chi phí/Khách hàng (CAC)"
                value="1.2tr"
                change={-8.5}
                changeLabel="giảm so với tháng trước"
                icon={<Wallet className="h-5 w-5" />}
                variant="primary"
              />
              <KPICard
                title="Chi phí/Lead (CPL)"
                value="450k"
                change={-12.3}
                changeLabel="giảm so với tháng trước"
                icon={<Target className="h-5 w-5" />}
              />
              <KPICard
                title="Chi phí Marketing/DT"
                value="8.5%"
                change={-2.1}
                changeLabel="so với tháng trước"
                icon={<DollarSign className="h-5 w-5" />}
              />
              <KPICard
                title="Chi phí vận hành/Ca"
                value="890k"
                change={3.2}
                changeLabel="so với tháng trước"
                icon={<Activity className="h-5 w-5" />}
              />
            </div>
          </section>

          {/* Revenue & Performance KPIs */}
          <section className="mb-8 animate-fade-in" style={{ animationDelay: "0.05s" }}>
            <h2 className="text-lg font-semibold text-foreground mb-4">Doanh thu & Hiệu suất</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <KPICard
                title="Doanh thu tháng"
                value="890tr"
                change={12.5}
                icon={<DollarSign className="h-5 w-5" />}
                variant="primary"
              />
              <KPICard
                title="Lợi nhuận ròng"
                value="234tr"
                change={15.2}
                icon={<TrendingUp className="h-5 w-5" />}
              />
              <KPICard
                title="Bệnh nhân mới"
                value="234"
                change={8.2}
                icon={<Users className="h-5 w-5" />}
              />
              <KPICard
                title="Tỷ lệ Show-up"
                value="87%"
                change={3.4}
                icon={<Percent className="h-5 w-5" />}
              />
              <KPICard
                title="ROI Marketing"
                value="324%"
                change={15.8}
                icon={<TrendingUp className="h-5 w-5" />}
              />
              <KPICard
                title="LTV Trung bình"
                value="15.2tr"
                change={7.5}
                icon={<Users className="h-5 w-5" />}
              />
            </div>
          </section>

          {/* Charts Row 1 */}
          <section className="mb-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <RevenueChart />
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <PatientChart />
            </div>
          </section>

          {/* Charts Row 2 */}
          <section className="mb-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <ChannelROIChart />
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.25s" }}>
              <ConversionFunnel />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AnalyticalDashboard;
