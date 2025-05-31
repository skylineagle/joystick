import { Button } from "@/components/ui/button";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react";
import { toast as baseToast } from "sonner";

interface ToastOptions {
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onUndo?: () => void;
}

const ToastWrapper = ({
  children,
  onDismiss,
  variant = "default",
}: {
  children: React.ReactNode;
  onDismiss: () => void;
  variant?: "default" | "success" | "error" | "warning" | "info";
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "bg-green-50/90 dark:bg-green-950/80 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100";
      case "error":
        return "bg-red-50/90 dark:bg-red-950/80 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100";
      case "warning":
        return "bg-yellow-50/90 dark:bg-yellow-950/80 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100";
      case "info":
        return "bg-blue-50/90 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100";
      default:
        return "bg-background/90 text-foreground border";
    }
  };

  return (
    <div
      className={`w-full rounded-lg shadow-lg backdrop-blur-md px-4 py-3 sm:w-[var(--width)] ${getVariantStyles()}`}
    >
      <div className="flex gap-3">
        {children}
        <Button
          variant="ghost"
          className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
          onClick={onDismiss}
          aria-label="Close notification"
        >
          <XIcon
            size={16}
            className="opacity-60 transition-opacity group-hover:opacity-100"
            aria-hidden="true"
          />
        </Button>
      </div>
    </div>
  );
};

/**
 * Show a loading toast with a spinner
 */
function loading(options: ToastOptions) {
  return baseToast.custom(
    (t) => (
      <ToastWrapper onDismiss={() => baseToast.dismiss(t)}>
        <div className="flex grow gap-3">
          <Loader2Icon
            className="mt-0.5 shrink-0 text-primary animate-spin"
            size={16}
            aria-hidden="true"
          />
          <div className="flex grow justify-between gap-12">
            <p className="text-sm font-medium">{options.message}</p>
            <div className="text-sm whitespace-nowrap">
              {options.action && (
                <>
                  <button
                    className="text-sm font-medium hover:underline text-primary"
                    onClick={options.action.onClick}
                  >
                    {options.action.label}
                  </button>
                  <span className="text-muted-foreground mx-1">·</span>
                </>
              )}
              {options.onUndo && (
                <button
                  className="text-sm font-medium hover:underline text-primary"
                  onClick={() => {
                    options.onUndo?.();
                    baseToast.dismiss(t);
                  }}
                >
                  Undo
                </button>
              )}
            </div>
          </div>
        </div>
      </ToastWrapper>
    ),
    {
      duration: Infinity,
    }
  );
}

/**
 * Show either a success or error toast based on the success parameter
 */
function finish(options: ToastOptions & { success: boolean }) {
  if (options.success) {
    return success(options);
  } else {
    return error(options);
  }
}

function success(options: ToastOptions) {
  return baseToast.custom(
    (t) => (
      <ToastWrapper onDismiss={() => baseToast.dismiss(t)} variant="success">
        <div className="flex grow gap-3">
          <CircleCheckIcon
            className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
            size={16}
            aria-hidden="true"
          />
          <div className="flex grow justify-between gap-12">
            <div>
              <p className="text-sm font-medium">{options.message}</p>
            </div>
            <div className="text-sm whitespace-nowrap">
              {options.action && (
                <>
                  <button
                    className="text-sm font-medium hover:underline text-green-700 dark:text-green-300"
                    onClick={options.action.onClick}
                  >
                    {options.action.label}
                  </button>
                  <span className="text-green-600 dark:text-green-400 mx-1">
                    ·
                  </span>
                </>
              )}
              {options.onUndo && (
                <button
                  className="text-sm font-medium hover:underline text-green-700 dark:text-green-300"
                  onClick={() => {
                    options.onUndo?.();
                    baseToast.dismiss(t);
                  }}
                >
                  Undo
                </button>
              )}
            </div>
          </div>
        </div>
      </ToastWrapper>
    ),
    {
      duration: 3000,
    }
  );
}

function error(options: ToastOptions) {
  return baseToast.custom(
    (t) => (
      <ToastWrapper onDismiss={() => baseToast.dismiss(t)} variant="error">
        <div className="flex grow gap-3">
          <AlertCircleIcon
            className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
            size={16}
            aria-hidden="true"
          />
          <div className="flex grow justify-between gap-12">
            <div>
              <p className="text-sm font-medium">{options.message}</p>
            </div>
            <div className="text-sm whitespace-nowrap">
              {options.action && (
                <>
                  <button
                    className="text-sm font-medium hover:underline text-red-700 dark:text-red-300"
                    onClick={options.action.onClick}
                  >
                    {options.action.label}
                  </button>
                  <span className="text-red-600 dark:text-red-400 mx-1">·</span>
                </>
              )}
              {options.onUndo && (
                <button
                  className="text-sm font-medium hover:underline text-red-700 dark:text-red-300"
                  onClick={() => {
                    options.onUndo?.();
                    baseToast.dismiss(t);
                  }}
                >
                  Undo
                </button>
              )}
            </div>
          </div>
        </div>
      </ToastWrapper>
    ),
    {
      duration: Infinity,
    }
  );
}

function warning(options: ToastOptions) {
  return baseToast.custom(
    (t) => (
      <ToastWrapper onDismiss={() => baseToast.dismiss(t)} variant="warning">
        <div className="flex grow gap-3">
          <AlertTriangleIcon
            className="mt-0.5 shrink-0 text-yellow-600 dark:text-yellow-400"
            size={16}
            aria-hidden="true"
          />
          <div className="flex grow justify-between gap-12">
            <div>
              <p className="text-sm font-medium">{options.message}</p>
            </div>
            <div className="text-sm whitespace-nowrap">
              {options.action && (
                <>
                  <button
                    className="text-sm font-medium hover:underline text-yellow-700 dark:text-yellow-300"
                    onClick={options.action.onClick}
                  >
                    {options.action.label}
                  </button>
                  <span className="text-yellow-600 dark:text-yellow-400 mx-1">
                    ·
                  </span>
                </>
              )}
              {options.onUndo && (
                <button
                  className="text-sm font-medium hover:underline text-yellow-700 dark:text-yellow-300"
                  onClick={() => {
                    options.onUndo?.();
                    baseToast.dismiss(t);
                  }}
                >
                  Undo
                </button>
              )}
            </div>
          </div>
        </div>
      </ToastWrapper>
    ),
    {
      duration: Infinity,
    }
  );
}

function info(options: ToastOptions) {
  return baseToast.custom(
    (t) => (
      <ToastWrapper onDismiss={() => baseToast.dismiss(t)} variant="info">
        <div className="flex grow gap-3">
          <InfoIcon
            className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400"
            size={16}
            aria-hidden="true"
          />
          <div className="flex grow justify-between gap-12">
            <div>
              <p className="text-sm font-medium">{options.message}</p>
            </div>
            <div className="text-sm whitespace-nowrap">
              {options.action && (
                <>
                  <button
                    className="text-sm font-medium hover:underline text-blue-700 dark:text-blue-300"
                    onClick={options.action.onClick}
                  >
                    {options.action.label}
                  </button>
                  <span className="text-blue-600 dark:text-blue-400 mx-1">
                    ·
                  </span>
                </>
              )}
              {options.onUndo && (
                <button
                  className="text-sm font-medium hover:underline text-blue-700 dark:text-blue-300"
                  onClick={() => {
                    options.onUndo?.();
                    baseToast.dismiss(t);
                  }}
                >
                  Undo
                </button>
              )}
            </div>
          </div>
        </div>
      </ToastWrapper>
    ),
    {
      duration: 4000,
    }
  );
}

export const toast = {
  loading,
  success,
  error,
  info,
  warning,
  finish,
  dismiss: baseToast.dismiss,
};
