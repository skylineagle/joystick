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

        // For 3G, often only RSSI is available instead of RSRP/RSRQ
        const is3G = tech === "3G" || tech === "WCDMA" || tech === "UMTS";
        let rsrp = parseInt(parts[6]);
        let rsrq = parseInt(parts[7]);
        let rssi: number | undefined;

        // If this is 3G and the values look like RSSI (typically higher than RSRP)
        // or if we have additional columns, handle accordingly
        if (is3G) {
          // For 3G, the 6th parameter might be RSSI instead of RSRP
          // RSSI values are typically in the range of -30 to -120 dBm
          // RSRP values are typically in the range of -44 to -140 dBm
          // If the value is > -30, it's likely not a valid signal strength
          if (rsrp > -30) {
            // This might be some other parameter, use a default
            rsrp = -100; // Default poor signal
            rsrq = -15; // Default poor quality
          }
          // Store the original value as RSSI for 3G
          rssi = parseInt(parts[6]);
        }

        // Handle case where we have RSSI as a separate parameter (9th column)
        if (parts.length >= 9 && is3G) {
          rssi = parseInt(parts[8]);
        }

        const cellIdDecNum = parseInt(cellIdHex, 16);
        const cellIdDec = isNaN(cellIdDecNum) ? "0" : cellIdDecNum.toString();

        const frequency = getFrequencyFromArfcn(arfcn, tech);
        const band = getBandFromArfcn(arfcn, tech);

        // Use fallback values if operator info wasn't found
        const operator = currentOperator || "Unknown Operator";
        const operatorId = currentOperatorId || "Unknown";

        const cellInfo: CellTowerData = {
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
        };

        // Add RSSI for 3G networks
        if (rssi !== undefined) {
          cellInfo.rssi = rssi;
        }

        cellData.push(cellInfo);
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
  if (tech === "3G" || tech === "WCDMA" || tech === "UMTS") {
    if (arfcn >= 10562 && arfcn <= 10838) return 2110 + (arfcn - 10562) * 0.2;
    if (arfcn >= 9612 && arfcn <= 9888) return 1920 + (arfcn - 9612) * 0.2;
    if (arfcn >= 1162 && arfcn <= 1513) return 1805 + (arfcn - 1162) * 0.2;
    if (arfcn >= 2937 && arfcn <= 3088) return 2110 + (arfcn - 2937) * 0.2;
    if (arfcn >= 4357 && arfcn <= 4458) return 2110 + (arfcn - 4357) * 0.2;
    if (arfcn >= 4132 && arfcn <= 4233) return 1710 + (arfcn - 4132) * 0.2;
    if (arfcn >= 2712 && arfcn <= 2863) return 1930 + (arfcn - 2712) * 0.2;
    if (arfcn >= 1537 && arfcn <= 1738) return 1850 + (arfcn - 1537) * 0.2;
    if (arfcn >= 4387 && arfcn <= 4413) return 2175 + (arfcn - 4387) * 0.2;
    if (arfcn >= 736 && arfcn <= 862) return 1710 + (arfcn - 736) * 0.2;
    if (arfcn >= 4162 && arfcn <= 4188) return 1735 + (arfcn - 4162) * 0.2;
    if (arfcn >= 2887 && arfcn <= 2937) return 2620 + (arfcn - 2887) * 0.2;
    if (arfcn >= 3112 && arfcn <= 3388) return 1900 + (arfcn - 3112) * 0.2;
    if (arfcn >= 3712 && arfcn <= 3787) return 1900 + (arfcn - 3712) * 0.2;
    if (arfcn >= 3842 && arfcn <= 3903) return 2010 + (arfcn - 3842) * 0.2;
    if (arfcn >= 1312 && arfcn <= 1513) return 1805 + (arfcn - 1312) * 0.2;
    if (arfcn >= 4017 && arfcn <= 4043) return 1710 + (arfcn - 4017) * 0.2;
    if (arfcn >= 1007 && arfcn <= 1087) return 1900 + (arfcn - 1007) * 0.2;
    if (arfcn >= 3617 && arfcn <= 3678) return 1900 + (arfcn - 3617) * 0.2;
    if (arfcn >= 1447 && arfcn <= 1462) return 1900 + (arfcn - 1447) * 0.2;
    return Math.round(arfcn * 0.2);
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
  if (tech === "3G" || tech === "WCDMA" || tech === "UMTS") {
    if (arfcn >= 10562 && arfcn <= 10838) return "I";
    if (arfcn >= 9612 && arfcn <= 9888) return "I";
    if (arfcn >= 1162 && arfcn <= 1513) return "III";
    if (arfcn >= 2937 && arfcn <= 3088) return "I";
    if (arfcn >= 4357 && arfcn <= 4458) return "I";
    if (arfcn >= 4132 && arfcn <= 4233) return "IV";
    if (arfcn >= 2712 && arfcn <= 2863) return "II";
    if (arfcn >= 1537 && arfcn <= 1738) return "V";
    if (arfcn >= 4387 && arfcn <= 4413) return "VI";
    if (arfcn >= 736 && arfcn <= 862) return "IV";
    if (arfcn >= 4162 && arfcn <= 4188) return "IV";
    if (arfcn >= 2887 && arfcn <= 2937) return "VII";
    if (arfcn >= 3112 && arfcn <= 3388) return "VIII";
    if (arfcn >= 3712 && arfcn <= 3787) return "IX";
    if (arfcn >= 3842 && arfcn <= 3903) return "XI";
    if (arfcn >= 1312 && arfcn <= 1513) return "III";
    if (arfcn >= 4017 && arfcn <= 4043) return "XII";
    if (arfcn >= 1007 && arfcn <= 1087) return "XIII";
    if (arfcn >= 3617 && arfcn <= 3678) return "XIV";
    if (arfcn >= 1447 && arfcn <= 1462) return "XXI";
    return "I";
  }
  return "Unknown";
};

// Signal strength utilities moved to @/utils/cell.ts
// Use getSignalQuality, getSignalBars, and getSignalColor from there instead

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
