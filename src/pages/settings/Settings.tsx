import { useContext, useState } from "react";
import AppSettings from "./app/AppSettings";
import Tabs from "../../components/tabs/Tabs";
import GameSettings from "./game/GameSettings";
import { ThemeContext } from "../../providers/AppThemeProvider";

export default function Settings() {
  const { colors } = useContext(ThemeContext);
  const [tabIndex, setTabIndex] = useState<number>(0);

  return (
    <div style={{ height: '100%', width: '100%', backgroundColor: colors.background.paper }}>
      <Tabs
        value={tabIndex}
        onChange={(tab) => setTabIndex(tab)}
        container={(children) => (
          <div style={{ display: 'flex', flexDirection: 'row', gap: '40px', overflowX: 'auto', padding: '20px' }}>
            {children}
          </div>
        )}
        tabs={[
          {
            label: 'App'
          },
          {
            label: 'Game'
          }
        ]}
      >
        <AppSettings />
        <GameSettings />
      </Tabs>
    </div >
  )
}