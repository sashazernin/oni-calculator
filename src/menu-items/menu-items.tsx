import type { IconType } from "react-icons";
import Home from "../pages/home/home";
import Settings from "../pages/settings/Settings";
import { IoHomeOutline, IoRocketOutline, IoRocketSharp } from "react-icons/io5";
import { IoHomeSharp } from "react-icons/io5";
import { GoGear } from "react-icons/go";
import { FaGear } from "react-icons/fa6";
import Food from "../pages/food/Food";
import { IoFastFoodSharp } from "react-icons/io5";
import { IoFastFoodOutline } from "react-icons/io5";
import type { TranslationKey } from "../i18n/translations";
import Rocket from "../pages/rocket/rocket";

export type MenuItem = {
  labelKey: TranslationKey;
  href: string;
  component?: React.ReactNode;
  children?: MenuItem[];
  icon?: IconType;
  activeIcon?: IconType;
}

export const menuItems: MenuItem[] = [
  {
    labelKey: "nav_home",
    href: "",
    component: <Home />,
    icon: IoHomeOutline,
    activeIcon: IoHomeSharp
  },
  {
    labelKey: "nav_food",
    href: "food",
    component: <Food />,
    icon: IoFastFoodOutline,
    activeIcon: IoFastFoodSharp
  },
  {
    labelKey: "nav_rocket_engines",
    href: "rocket",
    component: <Rocket />,
    icon: IoRocketOutline,
    activeIcon: IoRocketSharp
  },
  {
    labelKey: "nav_settings",
    href: "settings",
    component: <Settings />,
    icon: GoGear,
    activeIcon: FaGear
  }
]