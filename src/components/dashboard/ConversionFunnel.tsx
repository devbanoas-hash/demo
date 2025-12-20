import { cn } from "@/lib/utils";

const funnelData = [
  { stage: "Lead", value: 1000, percentage: 100 },
  { stage: "Booking", value: 680, percentage: 68 },
  { stage: "Show-up", value: 520, percentage: 52 },
  { stage: "Consultation", value: 420, percentage: 42 },
  { stage: "Close", value: 280, percentage: 28 },
];

interface ConversionFunnelProps {
  className?: string;
}

export function ConversionFunnel({ className }: ConversionFunnelProps) {
  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Phễu Chuyển đổi</h3>
        <p className="text-sm text-muted-foreground">Từ Lead đến Close - T12/2024</p>
      </div>
      <div className="space-y-3">
        {funnelData.map((item, index) => (
          <div key={item.stage} className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-foreground">{item.stage}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-primary">{item.value}</span>
                <span className="text-xs text-muted-foreground">({item.percentage}%)</span>
              </div>
            </div>
            <div className="h-8 w-full rounded-lg bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-lg transition-all duration-500 ease-out flex items-center justify-end pr-3",
                  index === 0 && "bg-primary",
                  index === 1 && "bg-purple-500",
                  index === 2 && "bg-purple-400",
                  index === 3 && "bg-purple-300",
                  index === 4 && "bg-chart-3"
                )}
                style={{ width: `${item.percentage}%` }}
              >
                {item.percentage > 30 && (
                  <span className="text-xs font-medium text-primary-foreground">
                    {item.percentage}%
                  </span>
                )}
              </div>
            </div>
            {index < funnelData.length - 1 && (
              <div className="flex items-center justify-center py-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>↓</span>
                  <span>
                    {Math.round(
                      ((funnelData[index + 1].value / item.value) * 100)
                    )}
                    % chuyển đổi
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
