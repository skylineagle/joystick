import { useTheme, DesignTheme } from "@/components/theme-provider";
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
    name: "Joystick",
    radius: "0.7rem",
  },
  catppuccin: {
    name: "Catppuccin",
    radius: "0.6rem",
  },
  twitter: {
    name: "Twitter",
    radius: "0.6rem",
  },
  supabase: {
    name: "Supabase",
    radius: "0.6rem",
  },
  vercel: {
    name: "Vercel",
    radius: "0.6rem",
  },
  field: {
    name: "Field (High Contrast)",
    radius: "0.7rem",
  },
};

export const ThemeSelector = () => {
  const { designTheme, setDesignTheme } = useTheme();

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Palette className="mr-2 h-4 w-4" />
        <span>Design Theme</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuRadioGroup
          value={designTheme}
          onValueChange={(value) => setDesignTheme(value as DesignTheme)}
        >
          {Object.entries(designThemeInfo).map(([key, info]) => (
            <DropdownMenuRadioItem key={key} value={key}>
              <div className="flex items-center w-full mb-1">
                <span className="font-medium">{info.name}</span>
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
};
