export type SortDirection = "asc" | "desc" | null;

export interface SortState {
  column: string;
  direction: SortDirection;
}

export type SortableColumn = "name" | "mode" | "status" | "automation";
