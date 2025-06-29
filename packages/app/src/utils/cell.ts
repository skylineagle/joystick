export type SignalQuality =
  | "excellent"
  | "good"
  | "fair"
  | "poor"
  | "no-signal";

export interface SignalQualityInfo {
  quality: SignalQuality;
  label: string;
  color: string;
}

export type SignalMetricType =
  | "rsrp"
  | "rsrq"
  | "rssi"
  | "sinr"
  | "rscp"
  | "ecno";

export const getSignalQuality = (
  value: number | undefined,
  type: SignalMetricType,
  technology?: string
): SignalQualityInfo => {
  if (value === undefined) {
    return {
      quality: "no-signal",
      label: "Unknown",
      color: "text-muted-foreground",
    };
  }

  switch (type) {
    case "rsrp":
      return getRSRPQuality(value, technology);
    case "rsrq":
      return getRSRQQuality(value, technology);
    case "rssi":
      return getRSSIQuality(value, technology);
    case "sinr":
      return getSINRQuality(value);
    case "rscp":
      return getRSCPQuality(value);
    case "ecno":
      return getEcNoQuality(value);
    default:
      return {
        quality: "no-signal",
        label: "Unknown",
        color: "text-muted-foreground",
      };
  }
};

const getRSRPQuality = (
  value: number,
  technology?: string
): SignalQualityInfo => {
  const is3G =
    technology === "3G" || technology === "WCDMA" || technology === "UMTS";

  if (is3G) {
    if (value >= -70) {
      return {
        quality: "excellent",
        label: "Excellent",
        color: "text-green-600 dark:text-green-400",
      };
    }
    if (value >= -85) {
      return {
        quality: "good",
        label: "Good",
        color: "text-yellow-600 dark:text-yellow-400",
      };
    }
    if (value >= -95) {
      return {
        quality: "fair",
        label: "Fair",
        color: "text-orange-600 dark:text-orange-400",
      };
    }
    if (value >= -105) {
      return {
        quality: "poor",
        label: "Poor",
        color: "text-red-600 dark:text-red-400",
      };
    }
    return {
      quality: "no-signal",
      label: "No signal",
      color: "text-red-600 dark:text-red-400",
    };
  } else {
    if (value >= -80) {
      return {
        quality: "excellent",
        label: "Excellent",
        color: "text-green-600 dark:text-green-400",
      };
    }
    if (value >= -90) {
      return {
        quality: "good",
        label: "Good",
        color: "text-yellow-600 dark:text-yellow-400",
      };
    }
    if (value >= -100) {
      return {
        quality: "fair",
        label: "Fair",
        color: "text-orange-600 dark:text-orange-400",
      };
    }
    if (value >= -120) {
      return {
        quality: "poor",
        label: "Poor",
        color: "text-red-600 dark:text-red-400",
      };
    }
    return {
      quality: "no-signal",
      label: "No signal",
      color: "text-red-600 dark:text-red-400",
    };
  }
};

const getRSRQQuality = (
  value: number,
  technology?: string
): SignalQualityInfo => {
  const is3G =
    technology === "3G" || technology === "WCDMA" || technology === "UMTS";

  if (is3G) {
    if (value >= -6) {
      return {
        quality: "excellent",
        label: "Excellent",
        color: "text-green-600 dark:text-green-400",
      };
    }
    if (value >= -9) {
      return {
        quality: "good",
        label: "Good",
        color: "text-yellow-600 dark:text-yellow-400",
      };
    }
    if (value >= -12) {
      return {
        quality: "fair",
        label: "Fair",
        color: "text-orange-600 dark:text-orange-400",
      };
    }
    if (value >= -15) {
      return {
        quality: "poor",
        label: "Poor",
        color: "text-red-600 dark:text-red-400",
      };
    }
    return {
      quality: "no-signal",
      label: "No signal",
      color: "text-red-600 dark:text-red-400",
    };
  } else {
    if (value >= -10) {
      return {
        quality: "excellent",
        label: "Excellent",
        color: "text-green-600 dark:text-green-400",
      };
    }
    if (value >= -15) {
      return {
        quality: "good",
        label: "Good",
        color: "text-yellow-600 dark:text-yellow-400",
      };
    }
    if (value >= -20) {
      return {
        quality: "fair",
        label: "Fair to poor",
        color: "text-orange-600 dark:text-orange-400",
      };
    }
    return {
      quality: "no-signal",
      label: "No signal",
      color: "text-red-600 dark:text-red-400",
    };
  }
};
const getRSSIQuality = (
  value: number,
  technology?: string
): SignalQualityInfo => {
  const isLTE = technology === "LTE" || technology === "4G";
  const is3G =
    technology === "3G" || technology === "WCDMA" || technology === "UMTS";

  if (is3G) {
    // 3G RSSI thresholds based on research
    if (value >= -75) {
      return {
        quality: "excellent",
        label: "Excellent",
        color: "text-green-600 dark:text-green-400",
      };
    }
    if (value >= -80) {
      return {
        quality: "good",
        label: "Good",
        color: "text-yellow-600 dark:text-yellow-400",
      };
    }
    if (value >= -90) {
      return {
        quality: "fair",
        label: "Fair",
        color: "text-orange-600 dark:text-orange-400",
      };
    }
    if (value >= -112) {
      return {
        quality: "poor",
        label: "Poor",
        color: "text-red-600 dark:text-red-400",
      };
    }
    return {
      quality: "no-signal",
      label: "No signal",
      color: "text-red-600 dark:text-red-400",
    };
  } else if (isLTE) {
    if (value > -65) {
      return {
        quality: "excellent",
        label: "Excellent",
        color: "text-green-600 dark:text-green-400",
      };
    }
    if (value >= -75) {
      return {
        quality: "good",
        label: "Good",
        color: "text-yellow-600 dark:text-yellow-400",
      };
    }
    if (value >= -85) {
      return {
        quality: "fair",
        label: "Fair",
        color: "text-orange-600 dark:text-orange-400",
      };
    }
    if (value >= -95) {
      return {
        quality: "poor",
        label: "Poor",
        color: "text-red-600 dark:text-red-400",
      };
    }
    return {
      quality: "no-signal",
      label: "No signal",
      color: "text-red-600 dark:text-red-400",
    };
  } else {
    // Generic/2G thresholds
    if (value >= -70) {
      return {
        quality: "excellent",
        label: "Excellent",
        color: "text-green-600 dark:text-green-400",
      };
    }
    if (value >= -85) {
      return {
        quality: "good",
        label: "Good",
        color: "text-yellow-600 dark:text-yellow-400",
      };
    }
    if (value >= -100) {
      return {
        quality: "fair",
        label: "Fair",
        color: "text-orange-600 dark:text-orange-400",
      };
    }
    if (value > -110) {
      return {
        quality: "poor",
        label: "Poor",
        color: "text-red-600 dark:text-red-400",
      };
    }
    return {
      quality: "no-signal",
      label: "No signal",
      color: "text-red-600 dark:text-red-400",
    };
  }
};

const getSINRQuality = (value: number): SignalQualityInfo => {
  if (value >= 20) {
    return {
      quality: "excellent",
      label: "Excellent",
      color: "text-green-600 dark:text-green-400",
    };
  }
  if (value >= 13) {
    return {
      quality: "good",
      label: "Good",
      color: "text-yellow-600 dark:text-yellow-400",
    };
  }
  if (value >= 0) {
    return {
      quality: "fair",
      label: "Fair to poor",
      color: "text-orange-600 dark:text-orange-400",
    };
  }
  return {
    quality: "no-signal",
    label: "No signal",
    color: "text-red-600 dark:text-red-400",
  };
};

const getRSCPQuality = (value: number): SignalQualityInfo => {
  // RSCP (Received Signal Code Power) thresholds for 3G/UMTS
  if (value >= -60) {
    return {
      quality: "excellent",
      label: "Excellent",
      color: "text-green-600 dark:text-green-400",
    };
  }
  if (value >= -75) {
    return {
      quality: "good",
      label: "Good",
      color: "text-yellow-600 dark:text-yellow-400",
    };
  }
  if (value >= -85) {
    return {
      quality: "fair",
      label: "Fair",
      color: "text-orange-600 dark:text-orange-400",
    };
  }
  if (value >= -95) {
    return {
      quality: "poor",
      label: "Poor",
      color: "text-red-600 dark:text-red-400",
    };
  }
  return {
    quality: "no-signal",
    label: "No signal",
    color: "text-red-600 dark:text-red-400",
  };
};

const getEcNoQuality = (value: number): SignalQualityInfo => {
  // Ec/No (Energy per chip to Noise ratio) thresholds for 3G/UMTS
  if (value >= -6) {
    return {
      quality: "excellent",
      label: "Excellent",
      color: "text-green-600 dark:text-green-400",
    };
  }
  if (value >= -10) {
    return {
      quality: "good",
      label: "Good",
      color: "text-yellow-600 dark:text-yellow-400",
    };
  }
  if (value >= -15) {
    return {
      quality: "fair",
      label: "Fair",
      color: "text-orange-600 dark:text-orange-400",
    };
  }
  if (value >= -20) {
    return {
      quality: "poor",
      label: "Poor",
      color: "text-red-600 dark:text-red-400",
    };
  }
  return {
    quality: "no-signal",
    label: "No signal",
    color: "text-red-600 dark:text-red-400",
  };
};

export const getSignalBars = (
  value: number,
  type: SignalMetricType = "rsrp",
  technology?: string
): number => {
  const quality = getSignalQuality(value, type, technology);

  switch (quality.quality) {
    case "excellent":
      return 4;
    case "good":
      return 3;
    case "fair":
      return 2;
    case "poor":
      return 1;
    case "no-signal":
    default:
      return 0;
  }
};

export const getSignalColor = (
  value: number,
  type: SignalMetricType = "rsrp",
  technology?: string
): string => {
  const quality = getSignalQuality(value, type, technology);

  switch (quality.quality) {
    case "excellent":
      return "bg-green-500";
    case "good":
      return "bg-yellow-500";
    case "fair":
      return "bg-orange-500";
    case "poor":
    case "no-signal":
    default:
      return "bg-red-500";
  }
};
