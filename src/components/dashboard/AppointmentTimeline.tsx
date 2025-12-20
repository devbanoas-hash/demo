import { cn } from "@/lib/utils";
import { Clock, User, Stethoscope } from "lucide-react";

const appointments = [
  {
    id: 1,
    time: "14:30",
    patient: "Nguyễn Thị Mai",
    service: "Niềng răng - Tái khám",
    doctor: "BS. Trần Văn Minh",
    room: "Phòng 1",
    status: "upcoming",
    duration: "30 phút",
  },
  {
    id: 2,
    time: "15:00",
    patient: "Lê Hoàng Nam",
    service: "Implant - Đặt trụ",
    doctor: "BS. Nguyễn Thị Hoa",
    room: "Phòng 2",
    status: "upcoming",
    duration: "90 phút",
  },
  {
    id: 3,
    time: "15:30",
    patient: "Phạm Văn Đức",
    service: "Trám răng",
    doctor: "BS. Lê Minh Tuấn",
    room: "Phòng 3",
    status: "upcoming",
    duration: "45 phút",
  },
  {
    id: 4,
    time: "16:00",
    patient: "Trần Thị Lan",
    service: "Tẩy trắng răng",
    doctor: "BS. Phạm Thị Nga",
    room: "Phòng 4",
    status: "upcoming",
    duration: "60 phút",
  },
  {
    id: 5,
    time: "16:30",
    patient: "Hoàng Minh Quân",
    service: "Nhổ răng khôn",
    doctor: "BS. Trần Văn Minh",
    room: "Phòng 1",
    status: "upcoming",
    duration: "45 phút",
  },
];

interface AppointmentTimelineProps {
  className?: string;
}

export function AppointmentTimeline({ className }: AppointmentTimelineProps) {
  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Lịch hẹn sắp tới</h3>
          <p className="text-sm text-muted-foreground">Chiều nay - 5 cuộc hẹn</p>
        </div>
        <button className="text-sm font-medium text-primary hover:underline">
          Xem lịch đầy đủ →
        </button>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[52px] top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-4">
          {appointments.map((apt, index) => (
            <div
              key={apt.id}
              className={cn(
                "relative flex gap-4 rounded-lg border bg-card p-4 transition-all hover:shadow-card-hover",
                index === 0 && "border-primary/30 bg-primary/5"
              )}
            >
              {/* Time */}
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-primary">{apt.time}</span>
                <div
                  className={cn(
                    "mt-2 h-3 w-3 rounded-full border-2 z-10",
                    index === 0
                      ? "border-primary bg-primary"
                      : "border-muted-foreground bg-card"
                  )}
                />
                <span className="mt-1 text-xs text-muted-foreground">{apt.duration}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-medium text-foreground">{apt.patient}</h4>
                    <p className="text-sm text-primary font-medium">{apt.service}</p>
                  </div>
                  <span className="shrink-0 rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {apt.room}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Stethoscope className="h-3 w-3" />
                    {apt.doctor}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
