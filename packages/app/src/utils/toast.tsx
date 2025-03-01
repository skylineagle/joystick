import { Button } from "@/components/ui/button";
import {
  AlertCircleIcon,
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

/**
 * Show a loading toast with a spinner
 */
function loading(options: ToastOptions) {
  return baseToast.custom((t) => (
    <div className="bg-background text-foreground w-full rounded-md border px-4 py-3 shadow-lg sm:w-[var(--width)]">
      <div className="flex gap-2">
        <div className="flex grow gap-3">
          <Loader2Icon
            className="mt-0.5 shrink-0 text-blue-500 animate-spin"
            size={16}
            aria-hidden="true"
          />
          <div className="flex grow justify-between gap-12">
            <p className="text-sm">{options.message}</p>
            <div className="text-sm whitespace-nowrap">
              {options.action && (
                <>
                  <button
                    className="text-sm font-medium hover:underline"
                    onClick={options.action.onClick}
                  >
                    {options.action.label}
                  </button>
                  <span className="text-muted-foreground mx-1">·</span>
                </>
              )}
              {options.onUndo && (
                <button
                  className="text-sm font-medium hover:underline"
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
        <Button
          variant="ghost"
          className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
          onClick={() => baseToast.dismiss(t)}
          aria-label="Close banner"
        >
          <XIcon
            size={16}
            className="opacity-60 transition-opacity group-hover:opacity-100"
            aria-hidden="true"
          />
        </Button>
      </div>
    </div>
  ));
}

/**
 * Show either a success or error toast based on the success parameter
 */
function finish(options: ToastOptions & { success: boolean }) {
  return baseToast.custom((t) => (
    <div className="bg-background text-foreground w-full rounded-md border px-4 py-3 shadow-lg sm:w-[var(--width)]">
      <div className="flex gap-2">
        <div className="flex grow gap-3">
          {options.success ? (
            <CircleCheckIcon
              className="mt-0.5 shrink-0 text-emerald-500"
              size={16}
              aria-hidden="true"
            />
          ) : (
            <AlertCircleIcon
              className="mt-0.5 shrink-0 text-red-500"
              size={16}
              aria-hidden="true"
            />
          )}
          <div className="flex grow justify-between gap-12">
            <p className="text-sm">{options.message}</p>
            <div className="text-sm whitespace-nowrap">
              {options.action && (
                <>
                  <button
                    className="text-sm font-medium hover:underline"
                    onClick={options.action.onClick}
                  >
                    {options.action.label}
                  </button>
                  <span className="text-muted-foreground mx-1">·</span>
                </>
              )}
              {options.onUndo && (
                <button
                  className="text-sm font-medium hover:underline"
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
        <Button
          variant="ghost"
          className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
          onClick={() => baseToast.dismiss(t)}
          aria-label="Close banner"
        >
          <XIcon
            size={16}
            className="opacity-60 transition-opacity group-hover:opacity-100"
            aria-hidden="true"
          />
        </Button>
      </div>
    </div>
  ));
}

function success(options: ToastOptions) {
  return finish({ ...options, success: true });
}

function error(options: ToastOptions) {
  return finish({ ...options, success: false });
}

/**
 * Show an informational toast
 */
function info(options: ToastOptions) {
  return baseToast.custom((t) => (
    <div className="bg-background text-foreground w-full rounded-md border px-4 py-3 shadow-lg sm:w-[var(--width)]">
      <div className="flex gap-2">
        <div className="flex grow gap-3">
          <InfoIcon
            className="mt-0.5 shrink-0 text-blue-500"
            size={16}
            aria-hidden="true"
          />
          <div className="flex grow justify-between gap-12">
            <p className="text-sm">{options.message}</p>
            <div className="text-sm whitespace-nowrap">
              {options.action && (
                <>
                  <button
                    className="text-sm font-medium hover:underline"
                    onClick={options.action.onClick}
                  >
                    {options.action.label}
                  </button>
                  <span className="text-muted-foreground mx-1">·</span>
                </>
              )}
              {options.onUndo && (
                <button
                  className="text-sm font-medium hover:underline"
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
        <Button
          variant="ghost"
          className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
          onClick={() => baseToast.dismiss(t)}
          aria-label="Close banner"
        >
          <XIcon
            size={16}
            className="opacity-60 transition-opacity group-hover:opacity-100"
            aria-hidden="true"
          />
        </Button>
      </div>
    </div>
  ));
}

export const toast = {
  info,
  loading,
  finish,
  success,
  error,
};
