import { useContext } from "react";
import Box from "../../components/box/box";
import { ThemeContext } from "../../providers/app-theme-provider";
import { useTranslation } from "../../hooks/useTranslation";
import type { TranslationKey } from "../../i18n/translations";

const CONTACT_EMAIL = "sashazernin1@gmail.com";

const SECTIONS: { titleKey: TranslationKey; bodyKey: TranslationKey }[] = [
  { titleKey: "privacy_section_google_title", bodyKey: "privacy_section_google_body" },
  { titleKey: "privacy_section_local_title", bodyKey: "privacy_section_local_body" },
  { titleKey: "privacy_section_analytics_title", bodyKey: "privacy_section_analytics_body" },
  { titleKey: "privacy_section_contact_title", bodyKey: "privacy_section_contact_body" },
];

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  const { colors } = useContext(ThemeContext);

  const headingStyle = {
    margin: "1.25rem 0 0.5rem",
    fontFamily: "var(--font-heading)",
    fontSize: "1.0625rem",
    fontWeight: 700,
    color: colors.text.primary,
  };

  const paragraphStyle = {
    margin: "0 0 0.75rem",
    fontSize: "0.9375rem",
    lineHeight: 1.55,
    color: colors.text.primary,
  };

  const accentLinkStyle = {
    color: colors.primary.main,
    fontWeight: 600,
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignSelf: "stretch",
        width: "100%",
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <Box
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 4,
          minHeight: 0,
          width: "100%",
          boxSizing: "border-box",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <h1
          style={{
            margin: "0.25rem 0 0",
            fontFamily: "var(--font-heading)",
            fontSize: "1.5rem",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: colors.text.primary,
          }}
        >
          {t("privacy_title")}
        </h1>
        <p style={{ ...paragraphStyle, marginBottom: "1rem", fontSize: "0.8125rem", opacity: 0.85 }}>
          {t("privacy_updated")}
        </p>
        <p style={paragraphStyle}>{t("privacy_intro")}</p>

        {SECTIONS.map(({ titleKey, bodyKey }) => (
          <section key={titleKey}>
            <h2 style={headingStyle}>{t(titleKey)}</h2>
            <p style={{ ...paragraphStyle, whiteSpace: "pre-line" }}>{t(bodyKey)}</p>
          </section>
        ))}

        <p style={{ ...paragraphStyle, marginTop: "0.5rem" }}>
          {t("privacy_contact_line_prefix")}{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} style={accentLinkStyle}>
            {CONTACT_EMAIL}
          </a>
        </p>
      </Box>
    </div>
  );
}
