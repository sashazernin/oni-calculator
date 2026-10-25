import { useContext, useEffect, useMemo, useState, type CSSProperties } from "react";
import { GoGear } from "react-icons/go";
import { IoHelpCircleOutline } from "react-icons/io5";
import { IconButton } from "../icon-button/IconButton";
import { Popup } from "../popup/Popup";
import { Button } from "../button/Button";
import { ThemeContext } from "../../providers/app-theme-provider";
import { useAppSettings } from "../../providers/app-settings-provider";
import { useGoogleDrive } from "../../providers/google-drive-provider";
import { formatDriveStatusMessage } from "../../google-drive/driveStatus";
import { useTranslation } from "../../hooks/useTranslation";

const SETTINGS_APP_PATH = "/settings?tab=app";

type GoogleDriveSettingsProps = {
  /** Краткая плашка в навбаре: статус + иконка настроек. */
  compact?: boolean;
  onNavigate?: () => void;
};

export default function GoogleDriveSettings({
  compact = false,
  onNavigate,
}: GoogleDriveSettingsProps) {
  const { colors } = useContext(ThemeContext);
  const { t } = useTranslation();
  const { accessToken, gisReady, status, statusMessage, connect, disconnect } = useGoogleDrive();
  const { flushToCloud, reloadFromCloud } = useAppSettings();

  const statusText = useMemo(
    () => formatDriveStatusMessage(statusMessage, t),
    [statusMessage, t],
  );

  const muted = `color-mix(in srgb, ${colors.text.primary} 62%, transparent)`;
  const statusColor =
    status === "error"
      ? "#e57373"
      : status === "success"
        ? "#81c995"
        : status === "loading"
          ? "#fdd663"
          : muted;

  const panel: CSSProperties = {
    margin: compact ? 8 : 0,
    padding: 12,
    borderRadius: 8,
    background: colors.background.paper,
    border: `1px solid ${colors.border.main}`,
    color: colors.text.primary,
    fontSize: 12,
    boxSizing: "border-box",
    maxWidth: compact ? undefined : 420,
  };

  const btn: CSSProperties = {
    display: "block",
    width: "100%",
    marginTop: 8,
    padding: "8px 10px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
  };

  const btnPrimary: CSSProperties = { ...btn, background: "#4285f4", color: "#fff" };
  const btnSecondary: CSSProperties = {
    ...btn,
    background: colors.translucent.main,
    color: colors.text.primary,
  };
  const btnDanger: CSSProperties = {
    ...btn,
    background: "transparent",
    color: "#e57373",
    border: `1px solid ${colors.border.main}`,
  };

  const busy = status === "loading";
  const [errorDetailOpen, setErrorDetailOpen] = useState(false);

  useEffect(() => {
    if (status !== "error") setErrorDetailOpen(false);
  }, [status]);

  const errorDetailText =
    statusMessage.kind === "raw" ? statusMessage.text : statusText;

  const errorStatusButton = (
    <button
      type="button"
      onClick={() => setErrorDetailOpen(true)}
      aria-label={t("drive_error_show_detail")}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        width: compact ? "100%" : undefined,
        margin: 0,
        padding: 0,
        border: "none",
        background: "transparent",
        color: "#e57373",
        fontSize: compact ? 12 : 13,
        fontWeight: 600,
        cursor: "pointer",
        textAlign: "left",
        lineHeight: 1.35,
      }}
    >
      <span>{t("drive_error_label")}</span>
      <IoHelpCircleOutline style={{ fontSize: compact ? "1.05rem" : "1.1rem", flexShrink: 0 }} aria-hidden />
    </button>
  );

  const errorModal = (
    <Popup
      open={errorDetailOpen}
      onClose={() => setErrorDetailOpen(false)}
      title={t("drive_error_modal_title")}
      closeButton
      variant="fit-content"
      width={420}
      zIndex={2000}
      bottom={
        <Button type="button" variant="primary" onClick={() => setErrorDetailOpen(false)}>
          {t("drive_error_ok")}
        </Button>
      }
    >
      <div
        style={{
          boxSizing: "border-box",
          width: "100%",
          padding: "16px 20px 8px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 600,
            color: muted,
            lineHeight: 1.4,
          }}
        >
          {t("drive_error_service_response")}
        </p>
        <pre
          style={{
            margin: "8px 0 0",
            padding: "10px 12px",
            borderRadius: 6,
            background: colors.background.average,
            border: `1px solid ${colors.border.main}`,
            color: colors.text.primary,
            fontSize: 12,
            lineHeight: 1.45,
            fontFamily: "ui-monospace, Consolas, monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflow: "auto",
            maxHeight: "min(40vh, 240px)",
          }}
        >
          {errorDetailText}
        </pre>
      </div>
    </Popup>
  );

  if (compact) {
    return (
      <>
      <div style={panel}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 13, minWidth: 0 }}>{t("drive_nav_title")}</div>
          <IconButton
            to={SETTINGS_APP_PATH}
            color="action"
            variant="translucent"
            aria-label={t("aria_drive_settings")}
            onClick={() => onNavigate?.()}
            style={{ flexShrink: 0, margin: -4 }}
          >
            <GoGear style={{ fontSize: "1.125rem" }} aria-hidden />
          </IconButton>
        </div>
        {status === "error" ? (
          <div style={{ minHeight: 18 }}>{errorStatusButton}</div>
        ) : (
          <div style={{ color: statusColor, minHeight: 18, lineHeight: 1.35 }} role="status">
            {statusText}
          </div>
        )}
        {!accessToken ? (
          <button
            type="button"
            style={{ ...btnPrimary, marginTop: 8 }}
            disabled={!gisReady || busy}
            onClick={connect}
          >
            {t("drive_connect")}
          </button>
        ) : null}
      </div>
      {errorModal}
      </>
    );
  }

  return (
    <>
    <div style={panel}>
      <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 14 }}>{t("drive_title")}</div>
      <p
        style={{
          margin: "0 0 10px",
          color: muted,
          lineHeight: 1.45,
          fontSize: 13,
        }}
      >
        {t("drive_description")}
      </p>
      {status === "error" ? (
        <div style={{ marginBottom: 4, minHeight: 18 }}>{errorStatusButton}</div>
      ) : (
        <div style={{ color: statusColor, minHeight: 18, marginBottom: 4, lineHeight: 1.35 }} role="status">
          {statusText}
        </div>
      )}
      {!accessToken ? (
        <button type="button" style={btnPrimary} disabled={!gisReady || busy} onClick={connect}>
          {t("drive_connect")}
        </button>
      ) : (
        <>
          <button type="button" style={btnPrimary} disabled={busy} onClick={() => void flushToCloud()}>
            {t("drive_save_now")}
          </button>
          <button type="button" style={btnSecondary} disabled={busy} onClick={() => void reloadFromCloud()}>
            {t("drive_load")}
          </button>
          <button type="button" style={btnDanger} onClick={disconnect}>
            {t("drive_sign_out")}
          </button>
        </>
      )}
    </div>
    {errorModal}
    </>
  );
}
