import { cn } from "@/lib/utils";
import { Users, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

const realtimeData = {
  patientsToday: 45,
  currentlyWaiting: 8,
  inTreatment: 12,
  completed: 25,
  averageWaitTime: "18 phút",
  lateAppointments: 3,
};

const chairStatus = [
  { id: 1, room: "Phòng 1", status: "busy", doctor: "BS. Nguyễn Văn A", patient: "Trần Thị B", service: "Niềng răng" },
  { id: 2, room: "Phòng 2", status: "busy", doctor: "BS. Lê Thị C", patient: "Hoàng Văn D", service: "Implant" },
  { id: 3, room: "Phòng 3", status: "available", doctor: "BS. Phạm Văn E", patient: null, service: null },
  { id: 4, room: "Phòng 4", status: "busy", doctor: "BS. Trần Văn F", patient: "Ngô Thị G", service: "Tẩy trắng" },
  { id: 5, room: "Phòng 5", status: "cleaning", doctor: null, patient: null, service: null },
  { id: 6, room: "Phòng 6", status: "available", doctor: "BS. Đỗ Thị H", patient: null, service: null },
];

interface RealtimeStatusProps {
  className?: string;
}

export function RealtimeStatus({ className }: RealtimeStatusProps) {
  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Trạng thái Thời gian thực</h3>
          <p className="text-sm text-muted-foreground">Cập nhật lúc 14:32</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
          </span>
          <span className="text-xs font-medium text-success">Live</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="flex items-center gap-3 rounded-lg bg-primary/10 p-3">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Đang chờ</p>
            <p className="text-xl font-bold text-primary">{realtimeData.currentlyWaiting}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-chart-3/10 p-3">
          <CheckCircle2 className="h-5 w-5 text-chart-3" />
          <div>
            <p className="text-xs text-muted-foreground">Đang điều trị</p>
            <p className="text-xl font-bold text-chart-3">{realtimeData.inTreatment}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-success/10 p-3">
          <Clock className="h-5 w-5 text-success" />
          <div>
            <p className="text-xs text-muted-foreground">TG chờ TB</p>
            <p className="text-lg font-bold text-success">{realtimeData.averageWaitTime}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-warning/10 p-3">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <div>
            <p className="text-xs text-muted-foreground">Trễ hẹn</p>
            <p className="text-xl font-bold text-warning">{realtimeData.lateAppointments}</p>
          </div>
        </div>
      </div>

      {/* Chair Status */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">Trạng thái Ghế điều trị</h4>
        <div className="space-y-2">
          {chairStatus.map((chair) => (
            <div
              key={chair.id}
              className={cn(
                "flex items-center justify-between rounded-lg border p-3 transition-colors",
                chair.status === "busy" && "border-primary/30 bg-primary/5",
                chair.status === "available" && "border-success/30 bg-success/5",
                chair.status === "cleaning" && "border-warning/30 bg-warning/5"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    chair.status === "busy" && "bg-primary animate-pulse",
                    chair.status === "available" && "bg-success",
                    chair.status === "cleaning" && "bg-warning"
                  )}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{chair.room}</p>
                  {chair.doctor && (
                    <p className="text-xs text-muted-foreground">{chair.doctor}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                {chair.status === "busy" && (
                  <>
                    <p className="text-sm font-medium text-primary">{chair.service}</p>
                    <p className="text-xs text-muted-foreground">{chair.patient}</p>
                  </>
                )}
                {chair.status === "available" && (
                  <span className="text-xs font-medium text-success">Sẵn sàng</span>
                )}
                {chair.status === "cleaning" && (
                  <span className="text-xs font-medium text-warning">Đang dọn</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
