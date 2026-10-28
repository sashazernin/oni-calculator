import { Navigate, useSearchParams } from "react-router-dom";
import AppSettings from "./app/AppSettings";
import Box from "../../components/box/box";

export default function Settings() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab");
  if (tab === "colony" || tab === "1") {
    return <Navigate to="/colony" replace />;
  }

  return (
    <Box
      style={{
        flex: 1,
        height: "100%",
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
      <AppSettings />
    </Box>
  );
}
