import Box from "../../components/box/box";
import ColonySettings from "../settings/colony/ColonySettings";

export default function ColonyPage() {
  return (
    <Box
      style={{
        flex: 1,
        width: "100%",
        minHeight: 0,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        padding: "16px 20px",
        ["--page-inline-padding" as string]: "20px",
      }}
    >
      <ColonySettings />
    </Box>
  );
}
