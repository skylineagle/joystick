import { parseAsStringEnum, useQueryState } from "nuqs";

export function useRoiMode() {
  const [roiMode, setRoiMode] = useQueryState(
    "roi-mode",
    parseAsStringEnum(["hide", "view", "edit"])
      .withDefault("hide")
      .withOptions({
        shallow: true,
      })
  );

  return { roiMode, setRoiMode };
}
