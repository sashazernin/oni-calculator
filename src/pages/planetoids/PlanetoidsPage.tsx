import Box from "../../components/box/box";
import PlanetoidsSettings from "../settings/planetoids/PlanetoidsSettings";
import { useTranslation } from "../../hooks/useTranslation";

export default function PlanetoidsPage() {
  const { t } = useTranslation();

  return (
    <Box
      style={{
        flex: 1,
        width: "100%",
        minHeight: 0,
        boxSizing: "border-box",
        overflowY: "auto",
        padding: "16px 20px",
      }}
    >
      <PlanetoidsSettings pageTitle={t("nav_planetoids")} />
    </Box>
  );
}
