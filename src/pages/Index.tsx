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
import { RealtimeStatus } from "@/components/dashboard/RealtimeStatus";
import { LabOrdersTable } from "@/components/dashboard/LabOrdersTable";
import { InventoryAlerts } from "@/components/dashboard/InventoryAlerts";
import { AppointmentTimeline } from "@/components/dashboard/AppointmentTimeline";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
      >
        <DashboardHeader onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main className="p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Tổng quan</h1>
            <p className="text-muted-foreground">Dashboard chính - Theo dõi hiệu suất phòng khám</p>
          </div>

          {/* Efficient Cost KPI Cards */}
          <section className="mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Chi phí hiệu quả</h2>
              <span className="text-sm text-muted-foreground">Cập nhật: Hôm nay</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

          {/* Main KPI Cards */}
          <section className="mb-8 animate-fade-in" style={{ animationDelay: "0.05s" }}>
            <h2 className="text-lg font-semibold text-foreground mb-4">Chỉ số chính</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <KPICard
                title="Doanh thu tháng"
                value="890tr"
                change={12.5}
                icon={<DollarSign className="h-5 w-5" />}
                variant="primary"
              />
              <KPICard
                title="Bệnh nhân mới"
                value="234"
                change={8.2}
                icon={<Users className="h-5 w-5" />}
              />
              <KPICard
                title="Lịch hẹn hôm nay"
                value="45"
                change={-2.1}
                icon={<Calendar className="h-5 w-5" />}
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
                title="Hiệu suất ghế"
                value="78%"
                change={5.2}
                icon={<Activity className="h-5 w-5" />}
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
          <section className="mb-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <ChannelROIChart />
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.25s" }}>
              <ConversionFunnel />
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <RealtimeStatus />
            </div>
          </section>

          {/* Bottom Section */}
          <section className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.35s" }}>
              <LabOrdersTable />
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <InventoryAlerts />
            </div>
          </section>

          {/* Appointments Timeline */}
          <section className="mt-8">
            <div className="rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.45s" }}>
              <AppointmentTimeline />
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Nguồn dữ liệu:</span>
              <span className="rounded bg-muted px-2 py-1">CRM</span>
              <span className="rounded bg-muted px-2 py-1">MISA</span>
              <span className="rounded bg-muted px-2 py-1">EMR</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <span>Cập nhật realtime</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Index;
