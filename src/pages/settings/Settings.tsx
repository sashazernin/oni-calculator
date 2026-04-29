import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import AppSettings from "./app/AppSettings";
import Tabs from "../../components/tabs/Tabs";
import GameSettings from "./game/GameSettings";
import { useTranslation } from "../../hooks/useTranslation";
import { MdHome } from "react-icons/md";
import { GoGear } from "react-icons/go";
import Box from "../../components/box/box";

const TAB_PARAM = "tab";
const TAB_SLUGS = ["app", "game"] as const;

function tabIndexFromParam(raw: string | null): number {
  if (raw === TAB_SLUGS[1] || raw === "1") return 1;
  if (raw === TAB_SLUGS[0] || raw === "0") return 0;
  return 0;
}

function paramFromTabIndex(index: number): string {
  return TAB_SLUGS[index] ?? TAB_SLUGS[0];
}

export default function Settings() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabIndex = useMemo(
    () => tabIndexFromParam(searchParams.get(TAB_PARAM)),
    [searchParams]
  );

  const setTabIndex = useCallback(
    (tab: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(TAB_PARAM, paramFromTabIndex(tab));
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  return (
    <Box style={{ height: '100%', width: '100%' }}>
      <Tabs
        value={tabIndex}
        onChange={setTabIndex}
        container={(children) => (
          <div style={{ display: 'flex', flexDirection: 'row', gap: '40px', overflowX: 'auto', paddingTop: '16px', height: '100%' }}>
            {children}
          </div>
        )}
        tabs={[
          {
            label: t("settings_tab_app"),
            icon: <GoGear />,
          },
          {
            label: t("settings_tab_game"),
            icon: <MdHome />,
          },
        ]}
      >
        <AppSettings />
        <GameSettings />
      </Tabs>
    </Box >
  )
}