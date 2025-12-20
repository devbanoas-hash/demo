import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const labOrders = [
  {
    id: "LAB-001",
    patient: "Nguyễn Văn A",
    type: "Khay niềng",
    lab: "OrthoLab",
    created: "10/12/2024",
    due: "17/12/2024",
    status: "in_progress",
  },
  {
    id: "LAB-002",
    patient: "Trần Thị B",
    type: "Răng sứ",
    lab: "DentalPro",
    created: "08/12/2024",
    due: "15/12/2024",
    status: "completed",
  },
  {
    id: "LAB-003",
    patient: "Lê Văn C",
    type: "Implant Crown",
    lab: "ImplantTech",
    created: "12/12/2024",
    due: "20/12/2024",
    status: "pending",
  },
  {
    id: "LAB-004",
    patient: "Phạm Thị D",
    type: "Hàm giả",
    lab: "OrthoLab",
    created: "05/12/2024",
    due: "12/12/2024",
    status: "delayed",
  },
  {
    id: "LAB-005",
    patient: "Hoàng Văn E",
    type: "Veneer",
    lab: "DentalPro",
    created: "11/12/2024",
    due: "18/12/2024",
    status: "in_progress",
  },
];

const statusConfig = {
  pending: { label: "Chờ xử lý", variant: "secondary" as const },
  in_progress: { label: "Đang làm", variant: "default" as const },
  completed: { label: "Hoàn thành", variant: "outline" as const },
  delayed: { label: "Trễ hạn", variant: "destructive" as const },
};

interface LabOrdersTableProps {
  className?: string;
}

export function LabOrdersTable({ className }: LabOrdersTableProps) {
  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Đơn Lab gần đây</h3>
          <p className="text-sm text-muted-foreground">Theo dõi trạng thái đơn hàng Lab</p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-purple transition-all hover:opacity-90">
          Xem tất cả
        </button>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Mã đơn
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Bệnh nhân
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Loại
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Lab
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Hạn
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {labOrders.map((order) => (
              <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-primary">{order.id}</td>
                <td className="px-4 py-3 text-sm text-foreground">{order.patient}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{order.type}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{order.lab}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{order.due}</td>
                <td className="px-4 py-3">
                  <Badge
                    variant={statusConfig[order.status].variant}
                    className={cn(
                      order.status === "completed" && "border-success text-success",
                      order.status === "in_progress" && "bg-primary"
                    )}
                  >
                    {statusConfig[order.status].label}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
