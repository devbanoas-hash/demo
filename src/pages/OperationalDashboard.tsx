import { useState } from "react";
import {
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  Armchair,
  Package,
  Stethoscope,
  Timer,
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { RealtimeStatus } from "@/components/dashboard/RealtimeStatus";
import { LabOrdersTable } from "@/components/dashboard/LabOrdersTable";
import { InventoryAlerts } from "@/components/dashboard/InventoryAlerts";
import { AppointmentTimeline } from "@/components/dashboard/AppointmentTimeline";

const chairStatus = [
  { room: "Phòng 1", chairs: [
    { id: "G1", status: "busy", patient: "Nguyễn Văn A", time: "09:00-10:30" },
    { id: "G2", status: "available", patient: null, time: null },
  ]},
  { room: "Phòng 2", chairs: [
    { id: "G3", status: "busy", patient: "Trần Thị B", time: "09:30-11:00" },
    { id: "G4", status: "maintenance", patient: null, time: null },
  ]},
  { room: "Phòng 3", chairs: [
    { id: "G5", status: "available", patient: null, time: null },
    { id: "G6", status: "busy", patient: "Lê Văn C", time: "10:00-11:30" },
  ]},
];

const latePatients = [
  { name: "Phạm Văn D", scheduled: "09:00", delay: 25, phone: "0901234567" },
  { name: "Hoàng Thị E", scheduled: "09:30", delay: 15, phone: "0912345678" },
  { name: "Vũ Văn F", scheduled: "10:00", delay: 10, phone: "0923456789" },
];

const activeDoctors = [
  { name: "BS. Nguyễn Văn A", status: "Đang khám", patient: "Trần Văn X", chair: "G1" },
  { name: "BS. Trần Thị B", status: "Đang khám", patient: "Lê Thị Y", chair: "G3" },
  { name: "BS. Lê Văn C", status: "Nghỉ giữa ca", patient: null, chair: null },
  { name: "BS. Phạm Thị D", status: "Đang khám", patient: "Nguyễn Văn Z", chair: "G6" },
];

const OperationalDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "busy": return "bg-destructive";
      case "available": return "bg-success";
      case "maintenance": return "bg-warning";
      default: return "bg-muted";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "busy": return "Đang sử dụng";
      case "available": return "Trống";
      case "maintenance": return "Bảo trì";
      default: return "N/A";
    }
  };

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
          {/* Page Title with Live Indicator */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Bảng điều khiển Vận hành</h1>
              <p className="text-muted-foreground">Realtime - Khách hàng, Lab, Ghế, Bác sĩ, Tồn kho</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-success/10 px-4 py-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
              </span>
              <span className="text-sm font-medium text-success">Live</span>
            </div>
          </div>

          {/* Realtime KPIs */}
          <section className="mb-8 animate-fade-in">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              <KPICard
                title="KH đang chờ"
                value="8"
                icon={<Users className="h-5 w-5" />}
                variant="primary"
              />
              <KPICard
                title="Thời gian chờ TB"
                value="12 phút"
                icon={<Clock className="h-5 w-5" />}
              />
              <KPICard
                title="Ghế đang sử dụng"
                value="4/6"
                icon={<Armchair className="h-5 w-5" />}
              />
              <KPICard
                title="Bác sĩ hoạt động"
                value="3/4"
                icon={<Stethoscope className="h-5 w-5" />}
              />
              <KPICard
                title="Cảnh báo tồn kho"
                value="5"
                change={-2}
                icon={<AlertTriangle className="h-5 w-5" />}
              />
            </div>
          </section>

          {/* Chair Status Heatmap */}
          <section className="mb-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <h3 className="font-semibold text-foreground mb-4">Trạng thái ghế theo phòng</h3>
              <div className="space-y-4">
                {chairStatus.map((room) => (
                  <div key={room.room} className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">{room.room}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {room.chairs.map((chair) => (
                        <div
                          key={chair.id}
                          className={`rounded-lg border p-3 transition-colors ${
                            chair.status === "busy" ? "border-destructive/30 bg-destructive/5" :
                            chair.status === "available" ? "border-success/30 bg-success/5" :
                            "border-warning/30 bg-warning/5"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-foreground">{chair.id}</span>
                            <span className={`h-2 w-2 rounded-full ${getStatusColor(chair.status)}`} />
                          </div>
                          <p className="text-xs text-muted-foreground">{getStatusLabel(chair.status)}</p>
                          {chair.patient && (
                            <p className="text-xs text-foreground mt-1">{chair.patient}</p>
                          )}
                          {chair.time && (
                            <p className="text-xs text-muted-foreground">{chair.time}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  <span>Trống</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-destructive" />
                  <span>Đang sử dụng</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-warning" />
                  <span>Bảo trì</span>
                </div>
              </div>
            </div>

            {/* Late Patients Alert */}
            <div className="rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <h3 className="font-semibold text-foreground">Khách hàng trễ hẹn</h3>
              </div>
              <div className="space-y-3">
                {latePatients.map((patient) => (
                  <div
                    key={patient.name}
                    className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning/5 p-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">Hẹn: {patient.scheduled}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-warning">+{patient.delay} phút</p>
                      <p className="text-xs text-muted-foreground">{patient.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Active Doctors & Realtime Status */}
          <section className="mb-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <h3 className="font-semibold text-foreground mb-4">Bác sĩ đang làm</h3>
              <div className="space-y-3">
                {activeDoctors.map((doctor) => (
                  <div
                    key={doctor.name}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        doctor.status === "Đang khám" ? "bg-primary/10" : "bg-muted"
                      }`}>
                        <Stethoscope className={`h-5 w-5 ${
                          doctor.status === "Đang khám" ? "text-primary" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{doctor.name}</p>
                        <p className="text-xs text-muted-foreground">{doctor.status}</p>
                      </div>
                    </div>
                    {doctor.patient && (
                      <div className="text-right">
                        <p className="text-sm text-foreground">{doctor.patient}</p>
                        <p className="text-xs text-muted-foreground">Ghế {doctor.chair}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <RealtimeStatus />
          </section>

          {/* Lab Orders & Inventory */}
          <section className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.25s" }}>
              <LabOrdersTable />
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <InventoryAlerts />
            </div>
          </section>

          {/* Appointments Timeline */}
          <section className="mt-8">
            <div className="rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.35s" }}>
              <AppointmentTimeline />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default OperationalDashboard;
