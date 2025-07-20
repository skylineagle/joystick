import { TempLevelPresets } from "@/types/types";

const DEFAULT_TEMP_LEVELS: TempLevelPresets = {
  cool: {
    min: 0,
    max: 30,
    color: "text-blue-500 dark:text-blue-300",
    status: "Cool",
  },
  normal: {
    min: 30,
    max: 50,
    color: "text-green-500 dark:text-green-300",
    status: "Normal",
  },
  warm: {
    min: 50,
    max: 70,
    color: "text-yellow-500 dark:text-yellow-300",
    status: "Warm",
  },
  hot: {
    min: 70,
    max: 999,
    color: "text-red-500 dark:text-red-300",
    status: "Hot",
  },
};

export const getTemperatureLevels = (
  modelTempLevels: TempLevelPresets | null
): TempLevelPresets => {
  if (!modelTempLevels || typeof modelTempLevels !== "object") {
    return DEFAULT_TEMP_LEVELS;
  }

  return {
    cool: {
      min: modelTempLevels.cool?.min ?? DEFAULT_TEMP_LEVELS.cool.min,
      max: modelTempLevels.cool?.max ?? DEFAULT_TEMP_LEVELS.cool.max,
      color: modelTempLevels.cool?.color ?? DEFAULT_TEMP_LEVELS.cool.color,
      status: modelTempLevels.cool?.status ?? DEFAULT_TEMP_LEVELS.cool.status,
    },
    normal: {
      min: modelTempLevels.normal?.min ?? DEFAULT_TEMP_LEVELS.normal.min,
      max: modelTempLevels.normal?.max ?? DEFAULT_TEMP_LEVELS.normal.max,
      color: modelTempLevels.normal?.color ?? DEFAULT_TEMP_LEVELS.normal.color,
      status:
        modelTempLevels.normal?.status ?? DEFAULT_TEMP_LEVELS.normal.status,
    },
    warm: {
      min: modelTempLevels.warm?.min ?? DEFAULT_TEMP_LEVELS.warm.min,
      max: modelTempLevels.warm?.max ?? DEFAULT_TEMP_LEVELS.warm.max,
      color: modelTempLevels.warm?.color ?? DEFAULT_TEMP_LEVELS.warm.color,
      status: modelTempLevels.warm?.status ?? DEFAULT_TEMP_LEVELS.warm.status,
    },
    hot: {
      min: modelTempLevels.hot?.min ?? DEFAULT_TEMP_LEVELS.hot.min,
      max: modelTempLevels.hot?.max ?? DEFAULT_TEMP_LEVELS.hot.max,
      color: modelTempLevels.hot?.color ?? DEFAULT_TEMP_LEVELS.hot.color,
      status: modelTempLevels.hot?.status ?? DEFAULT_TEMP_LEVELS.hot.status,
    },
  };
};

export const getTemperatureColor = (
  temp: number,
  modelTempLevels: TempLevelPresets | null
): string => {
  const levels = getTemperatureLevels(modelTempLevels);

  if (temp >= levels.cool.min && temp < levels.cool.max)
    return levels.cool.color;
  if (temp >= levels.normal.min && temp < levels.normal.max)
    return levels.normal.color;
  if (temp >= levels.warm.min && temp < levels.warm.max)
    return levels.warm.color;
  if (temp >= levels.hot.min) return levels.hot.color;

  return levels.cool.color;
};

export const getTemperatureStatus = (
  temp: number,
  modelTempLevels: TempLevelPresets | null
): string => {
  const levels = getTemperatureLevels(modelTempLevels);

  if (temp >= levels.cool.min && temp < levels.cool.max)
    return levels.cool.status;
  if (temp >= levels.normal.min && temp < levels.normal.max)
    return levels.normal.status;
  if (temp >= levels.warm.min && temp < levels.warm.max)
    return levels.warm.status;
  if (temp >= levels.hot.min) return levels.hot.status;

  return levels.cool.status;
};
