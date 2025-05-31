import { useParams } from "react-router";

export const useCurrentDevice = () => {
  const params = useParams();
  return params.device || null;
};
