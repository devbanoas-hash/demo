import { cn } from "@/lib/utils";
import { AlertTriangle, Package, TrendingDown } from "lucide-react";

const inventoryAlerts = [
  {
    id: 1,
    item: "Thuốc tê Lidocain",
    current: 12,
    minimum: 50,
    unit: "ống",
    severity: "critical",
  },
  {
    id: 2,
    item: "Găng tay y tế (L)",
    current: 45,
    minimum: 100,
    unit: "đôi",
    severity: "warning",
  },
  {
    id: 3,
    item: "Mũi khoan kim cương",
    current: 8,
    minimum: 20,
    unit: "chiếc",
    severity: "critical",
  },
  {
    id: 4,
    item: "Composite A2",
    current: 3,
    minimum: 10,
    unit: "tuýp",
    severity: "critical",
  },
  {
    id: 5,
    item: "Khẩu trang y tế",
    current: 180,
    minimum: 200,
    unit: "chiếc",
    severity: "warning",
  },
];

interface InventoryAlertsProps {
  className?: string;
}

export function InventoryAlerts({ className }: InventoryAlertsProps) {
  const criticalCount = inventoryAlerts.filter((a) => a.severity === "critical").length;
  const warningCount = inventoryAlerts.filter((a) => a.severity === "warning").length;

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Cảnh báo Tồn kho</h3>
          <p className="text-sm text-muted-foreground">Vật tư cần bổ sung</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
            <AlertTriangle className="h-3 w-3" />
            {criticalCount} nghiêm trọng
          </span>
          <span className="flex items-center gap-1 rounded-full bg-warning/10 px-2 py-1 text-xs font-medium text-warning">
            {warningCount} cảnh báo
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {inventoryAlerts.map((alert) => {
          const percentage = Math.round((alert.current / alert.minimum) * 100);
          return (
            <div
              key={alert.id}
              className={cn(
                "rounded-lg border p-4 transition-colors",
                alert.severity === "critical" && "border-destructive/30 bg-destructive/5",
                alert.severity === "warning" && "border-warning/30 bg-warning/5"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      alert.severity === "critical" && "bg-destructive/20 text-destructive",
                      alert.severity === "warning" && "bg-warning/20 text-warning"
                    )}
                  >
                    <Package className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{alert.item}</p>
                    <p className="text-sm text-muted-foreground">
                      Còn: <span className="font-semibold">{alert.current}</span> / {alert.minimum}{" "}
                      {alert.unit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium">
                  <TrendingDown
                    className={cn(
                      "h-4 w-4",
                      alert.severity === "critical" ? "text-destructive" : "text-warning"
                    )}
                  />
                  <span
                    className={cn(
                      alert.severity === "critical" ? "text-destructive" : "text-warning"
                    )}
                  >
                    {percentage}%
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      alert.severity === "critical" && "bg-destructive",
                      alert.severity === "warning" && "bg-warning"
                    )}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="mt-4 w-full rounded-lg border border-primary bg-primary/5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10">
        Tạo đơn đặt hàng
      </button>
    </div>
  );
}
