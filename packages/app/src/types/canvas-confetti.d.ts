declare module "canvas-confetti" {
  interface ConfettiOptions {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: {
      x?: number;
      y?: number;
    };
    colors?: string[];
    shapes?: string[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }

  interface CreateConfettiOptions {
    resize?: boolean;
    useWorker?: boolean;
    disableForReducedMotion?: boolean;
  }

  interface ConfettiFunction {
    (options?: ConfettiOptions): Promise<null>;
    reset: () => void;
  }

  interface ConfettiModule {
    (options?: ConfettiOptions): Promise<null>;
    create: (
      canvas: HTMLCanvasElement,
      options?: CreateConfettiOptions
    ) => ConfettiFunction;
    reset: () => void;
  }

  const confetti: ConfettiModule;
  export default confetti;
}
