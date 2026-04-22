import type { IconType } from "react-icons";
import Home from "../pages/home/home";
import Settings from "../pages/settings/Settings/Settings";
import { IoHomeOutline } from "react-icons/io5";
import { IoHomeSharp } from "react-icons/io5";
import { GoGear } from "react-icons/go";
import { FaGear } from "react-icons/fa6";
export type MenuItem = {
  label: string;
  href: string;
  component?: React.ReactNode;
  children?: MenuItem[];
  icon?: IconType;
  activeIcon?: IconType;
}

export const menuItems: MenuItem[] = [
  {
    label: 'home',
    href: '',
    component: <Home />,
    icon: IoHomeOutline,
    activeIcon: IoHomeSharp
  },
  {
    label: 'Settings',
    href: 'settings',
    component: <Settings />,
    icon: GoGear,
    activeIcon: FaGear
  }
]