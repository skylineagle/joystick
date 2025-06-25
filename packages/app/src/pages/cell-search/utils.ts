import { CellTowerData } from "@/pages/cell-search/types";

export const parseCellSearchResponse = (response: string): CellTowerData[] => {
  try {
    const parsed = JSON.parse(response);
    if (
      Array.isArray(parsed) &&
      parsed.every(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          "id" in item &&
          "operator" in item &&
          "rsrp" in item
      )
    ) {
      return parsed;
    }
  } catch {
    // Not JSON, try parsing custom format
  }

  const cellData: CellTowerData[] = [];
  const lines = response.split("\n").filter((line) => line.trim());

  let currentOperator = "";
  let currentOperatorId = "";

  for (const line of lines) {
    if (line.startsWith("+QOPS:")) {
      // Try multiple regex patterns to handle different formats
      let match = line.match(/\+QOPS:\s*"([^"]+)","([^"]+)","([^"]+)"/);
      if (match) {
        currentOperator = match[1];
        currentOperatorId = match[3];
      } else {
        // Try without quotes
        match = line.match(/\+QOPS:\s*([^,]+),([^,]+),([^,\s]+)/);
        if (match) {
          currentOperator = match[1].replace(/"/g, "").trim();
          currentOperatorId = match[3].replace(/"/g, "").trim();
        } else {
          // Try with mixed quotes/no quotes
          match = line.match(/\+QOPS:\s*([^,]+),([^,]+),([^\s]+)/);
          if (match) {
            currentOperator = match[1].replace(/"/g, "").trim();
            currentOperatorId = match[3].replace(/"/g, "").trim();
          } else {
            // Last attempt: extract everything after +QOPS: and split by comma
            const qopsData = line.substring(line.indexOf("+QOPS:") + 6).trim();
            const parts = qopsData
              .split(",")
              .map((part) => part.replace(/"/g, "").trim());
            if (parts.length >= 3) {
              currentOperator = parts[0];
              currentOperatorId = parts[2];
            }
          }
        }
      }
    } else if (line.match(/^\d+,/)) {
      const parts = line.split(",");
      if (parts.length >= 8) {
        const cellIndex = parseInt(parts[0]);
        const tech = parts[1].replace(/"/g, "");
        const arfcn = parseInt(parts[2]);
        const pci = parseInt(parts[3]);
        const tac = parseInt(parts[4]);
        const cellIdHex = parts[5];
        const rsrp = parseInt(parts[6]);
        const rsrq = parseInt(parts[7]);

        const cellIdDecNum = parseInt(cellIdHex, 16);
        const cellIdDec = isNaN(cellIdDecNum) ? "0" : cellIdDecNum.toString();

        const frequency = getFrequencyFromArfcn(arfcn, tech);
        const band = getBandFromArfcn(arfcn, tech);

        // Use fallback values if operator info wasn't found
        const operator = currentOperator || "Unknown Operator";
        const operatorId = currentOperatorId || "Unknown";

        cellData.push({
          id: `${operatorId}-${cellIndex}`,
          operator,
          operatorId,
          tech,
          arfcn,
          band,
          frequency,
          pci,
          tac,
          cellIdHex,
          cellIdDec,
          rsrp,
          rsrq,
        });
      }
    }
  }

  return cellData;
};

export const getFrequencyFromArfcn = (arfcn: number, tech: string): number => {
  if (tech === "4G") {
    if (arfcn >= 9040 && arfcn <= 9490) return 758 + (arfcn - 9040) * 0.1;
    if (arfcn >= 1200 && arfcn <= 1949) return 1805 + (arfcn - 1200) * 0.2;
    if (arfcn >= 2750 && arfcn <= 3449) return 2655 + (arfcn - 2750) * 0.1;
    return Math.round(arfcn * 0.1);
  }
  if (tech === "5G") {
    if (arfcn >= 1500 && arfcn <= 1700) return 3400 + (arfcn - 1500) * 0.03;
    return Math.round(arfcn * 0.015);
  }
  return arfcn;
};

export const getBandFromArfcn = (arfcn: number, tech: string): string => {
  if (tech === "4G") {
    if (arfcn >= 9040 && arfcn <= 9490) return "B28";
    if (arfcn >= 1200 && arfcn <= 1949) return "B3";
    if (arfcn >= 2750 && arfcn <= 3449) return "B7";
    return "B1";
  }
  if (tech === "5G") {
    if (arfcn >= 1500 && arfcn <= 1700) return "n78";
    return "n1";
  }
  return "Unknown";
};

export const getSignalStrength = (rsrp: number) => {
  if (rsrp > -80)
    return {
      level: "excellent",
      color: "bg-green-500",
      textColor: "text-green-600",
    };
  if (rsrp > -90)
    return {
      level: "good",
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
    };
  if (rsrp > -100)
    return {
      level: "fair",
      color: "bg-orange-500",
      textColor: "text-orange-600",
    };
  return { level: "poor", color: "bg-red-500", textColor: "text-red-600" };
};

export const getTechnologyBadgeVariant = (tech: string) => {
  switch (tech.toLowerCase()) {
    case "5g":
    case "5g nr":
      return "default";
    case "4g":
    case "lte":
      return "secondary";
    case "3g":
    case "umts":
      return "outline";
    case "2g":
    case "gsm":
      return "destructive";
    default:
      return "outline";
  }
};
