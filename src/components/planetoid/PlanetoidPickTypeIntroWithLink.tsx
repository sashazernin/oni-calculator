import { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../../providers/app-theme-provider";
import { useTranslation } from "../../hooks/useTranslation";

/** Текст «Создайте планетойд…» со ссылкой на страницу планетоидов. */
export default function PlanetoidPickTypeIntroWithLink() {
  const { t } = useTranslation();
  const { colors } = useContext(ThemeContext);

  return (
    <>
      {t("planetoid_pick_type_intro_before_link")}
      <Link
        to="/planetoids"
        style={{
          color: colors.primary.main,
          fontWeight: 600,
          textDecoration: "underline",
          textDecorationSkipInk: "auto",
        }}
      >
        {t("planetoid_pick_type_intro_planetoid_word")}
      </Link>
      {t("planetoid_pick_type_intro_after_link")}
    </>
  );
}
