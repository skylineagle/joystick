import { cn } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";

interface TaskResultProps {
  result: string | object;
}

export function TaskResult({ result }: TaskResultProps) {
  if (!result) return null;

  const isSuccess =
    typeof result === "string" ? !result.includes("error") : true;

  let output;
  if (typeof result === "object" && result !== null && "output" in result) {
    output = result.output;
  } else {
    output = result;
  }

  const renderOutput = () => {
    if (typeof output === "object" && output !== null) {
      return (
        <div className="space-y-2">
          {Object.entries(output).map(([key, value]) => (
            <div key={key} className="flex items-start gap-3">
              <span className="text-sm font-medium min-w-20">{key}:</span>
              <span className="text-sm flex-1">
                {typeof value === "object"
                  ? JSON.stringify(value, null, 2)
                  : String(value)}
              </span>
            </div>
          ))}
        </div>
      );
    }

    return <div className="text-sm">{String(output)}</div>;
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border transition-all duration-200",
        {
          "bg-green-50/50 border-green-200/60 dark:bg-green-950/20 dark:border-green-800/40":
            isSuccess,
          "bg-red-50/50 border-red-200/60 dark:bg-red-950/20 dark:border-red-800/40":
            !isSuccess,
        }
      )}
    >
      {isSuccess ? (
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">{renderOutput()}</div>
    </div>
  );
}
