export interface CellTowerData {
  id: string;
  operator: string;
  operatorId: string;
  tech: string;
  arfcn: number;
  band: string;
  frequency: number;
  pci: number;
  tac: number;
  cellIdHex: string;
  cellIdDec: string;
  rsrp: number;
  rsrq: number;
}
