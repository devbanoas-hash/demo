import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning";
  className?: string;
}

export function KPICard({
  title,
  value,
  change,
  changeLabel = "so với tháng trước",
  icon,
  variant = "default",
  className,
}: KPICardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover",
        variant === "primary" && "border-primary/20 bg-gradient-to-br from-purple-50 to-card",
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 transition-transform duration-300 group-hover:scale-110" />
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          </div>
          {icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              {icon}
            </div>
          )}
        </div>

        {change !== undefined && (
          <div className="mt-4 flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                isPositive && "bg-success/10 text-success",
                isNegative && "bg-destructive/10 text-destructive",
                !isPositive && !isNegative && "bg-muted text-muted-foreground"
              )}
            >
              {isPositive && <TrendingUp className="h-3 w-3" />}
              {isNegative && <TrendingDown className="h-3 w-3" />}
              {!isPositive && !isNegative && <Minus className="h-3 w-3" />}
              <span>{isPositive ? "+" : ""}{change}%</span>
            </div>
            <span className="text-xs text-muted-foreground">{changeLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
