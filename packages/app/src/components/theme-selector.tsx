import { useTheme } from "@/components/theme-provider";
import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Palette } from "lucide-react";

const designThemeInfo = {
  default: {
    name: "Catppuccin",
    color: "hsl(266.04, 85.05%, 58.04%)",
    radius: "0.6rem",
  },
  bubblegum: {
    name: "Bubblegum",
    color: "hsl(325.58, 57.85%, 56.27%)",
    radius: "0.6rem",
  },
  ocean: {
    name: "Ocean",
    color: "hsl(142.09, 70.56%, 45.29%)",
    radius: "0.6rem",
  },
  coffee: {
    name: "Coffee",
    color: "hsl(16.67, 21.95%, 32.16%)",
    radius: "0.6rem",
  },
  candy: {
    name: "Candy",
    color: "hsl(349.52, 100%, 87.65%)",
    radius: "0.6rem",
  },
  retro: {
    name: "Retro",
    color: "hsl(349.52, 100%, 87.65%)",
    radius: "0.25rem",
  },
  graphite: {
    name: "Graphite",
    color: "hsl(0, 0%, 37.65%)",
    radius: "0.5rem",
  },
};

export const ThemeSelector = () => {
  const { designTheme, setDesignTheme } = useTheme();

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Palette className="mr-2 h-4 w-4" />
        <span>Design Theme</span>
        <div className="ml-auto flex h-4 w-4 items-center justify-center">
          <div
            className="h-4 w-4 rounded-full border"
            style={{
              backgroundColor: designThemeInfo[designTheme].color,
              borderRadius: designThemeInfo[designTheme].radius,
            }}
          />
        </div>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-56">
        <DropdownMenuRadioGroup
          value={designTheme}
          onValueChange={(value) =>
            setDesignTheme(
              value as "default" | "bubblegum" | "ocean" | "coffee" | "candy"
            )
          }
        >
          {Object.entries(designThemeInfo).map(([key, info]) => (
            <DropdownMenuRadioItem
              key={key}
              value={key}
              className="flex flex-col items-start py-2 px-2"
            >
              <div className="flex items-center w-full mb-1">
                <div
                  className="h-4 w-4 mr-2 border"
                  style={{
                    backgroundColor: info.color,
                    borderRadius: info.radius,
                  }}
                />
                <span className="font-medium">{info.name}</span>
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
};
