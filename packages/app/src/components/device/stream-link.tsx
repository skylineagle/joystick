import { urls } from "@/lib/urls";
import { Video } from "lucide-react";
export interface StreamLinkProps {
  name: string;
}

export function StreamLink({ name }: StreamLinkProps) {
  return (
    <a href={`${urls.stream}/${name}`} target="_blank">
      <Video className="h-4 w-4 text-blue-500" />
    </a>
  );
}
