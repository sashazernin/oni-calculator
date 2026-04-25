import { useState } from "react";
import AppSettings from "./app/AppSettings";
import Tabs from "../../components/tabs/Tabs";
import GameSettings from "./game/GameSettings";
import { IoGameController } from "react-icons/io5";
import { GoGear } from "react-icons/go";
import Box from "../../components/box/box";

export default function Settings() {
  const [tabIndex, setTabIndex] = useState<number>(0);

  return (
    <Box style={{ height: 'calc(100% - 32px)', width: 'calc(100% - 32px)' }}>
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
            label: "App",
            icon: <GoGear />,
          },
          {
            label: "Game",
            icon: <IoGameController />,
          },
        ]}
      >
        <AppSettings />
        <GameSettings />
      </Tabs>
    </Box >
  )
}