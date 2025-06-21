import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { memo } from "react";

export interface AxisControlProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  isLoading: boolean;
  label: string;
}

export const AxisControl = memo(
  ({ value, min, max, onChange, isLoading, label }: AxisControlProps) => {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">{label}</Label>
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            min={min}
            max={max}
            className="w-16 h-6 text-xs"
            disabled={isLoading}
          />
        </div>
        <Slider
          value={[value]}
          onValueChange={([value]) => {
            onChange(value);
          }}
          min={min}
          max={max}
          step={1}
          className="w-full"
          disabled={isLoading}
        />
      </div>
    );
  }
);
