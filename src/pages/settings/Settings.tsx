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
    <Box style={{ height: "100%", width: "100%", padding: "16px 20px", boxSizing: "border-box" }}>
      <AppSettings />
    </Box>
  );
}
