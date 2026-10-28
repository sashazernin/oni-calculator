import type { IconType } from "react-icons";
import Home from "../pages/home/home";
import Settings from "../pages/settings/Settings";
import { IoGlobeOutline, IoGlobe, IoHomeOutline, IoRocketOutline, IoRocketSharp } from "react-icons/io5";
import { IoHomeSharp } from "react-icons/io5";
import { GoGear } from "react-icons/go";
import { FaGear } from "react-icons/fa6";
import FoodPage from "../pages/food/FoodPage";
import { IoFastFoodSharp } from "react-icons/io5";
import { IoFastFoodOutline } from "react-icons/io5";
import { IoBookOutline, IoBookSharp } from "react-icons/io5";
import KnowledgeBasePage from "../pages/knowledge-base/KnowledgeBasePage";
import type { TranslationKey } from "../i18n/translations";
import RocketPage from "../pages/rocket/RocketPage";
import PlanetoidsPage from "../pages/planetoids/PlanetoidsPage";
import ColonyPage from "../pages/colony/ColonyPage";
import StarMapPage from "../pages/star-map/StarMapPage";
import { dupeNavIcon, planetoidNavIcon } from "../icons";

export type MenuItem = {
  labelKey: TranslationKey;
  href: string;
  component?: React.ReactNode;
  children?: MenuItem[];
  icon?: IconType;
  activeIcon?: IconType;
  /** Скрыть для классического планетойда (звёздная карта только Spaced Out). */
  spacedOutOnly?: boolean;
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
    component: <FoodPage />,
    icon: IoFastFoodOutline,
    activeIcon: IoFastFoodSharp
  },
  {
    labelKey: "nav_rocket_engines",
    href: "rocket",
    component: <RocketPage />,
    icon: IoRocketOutline,
    activeIcon: IoRocketSharp
  },
  {
    labelKey: "nav_planetoids",
    href: "planetoids",
    component: <PlanetoidsPage />,
    icon: planetoidNavIcon,
    activeIcon: planetoidNavIcon,
  },
  {
    labelKey: "nav_colony",
    href: "colony",
    component: <ColonyPage />,
    icon: dupeNavIcon,
    activeIcon: dupeNavIcon,
  },
  {
    labelKey: "nav_star_map",
    href: "star-map",
    component: <StarMapPage />,
    icon: IoGlobeOutline,
    activeIcon: IoGlobe,
    spacedOutOnly: true,
  },
  {
    labelKey: "nav_settings",
    href: "settings",
    component: <Settings />,
    icon: GoGear,
    activeIcon: FaGear
  },
  {
    labelKey: "nav_knowledge_base",
    href: "knowledge-base",
    component: <KnowledgeBasePage />,
    icon: IoBookOutline,
    activeIcon: IoBookSharp,
  },
]