import {
  rocketEngines,
  rocketModules,
  ROCKET_CELL_PX,
  ROCKET_GRID_COLUMNS,
} from "../../game-data/rocket";
import type { IRocketEngine, IRocketModule } from "../../types/game-data-types";
import { getAssetImageUrl } from "../asset-image/AssetImage";

/** Подстройка спрайта к сетке: увеличение «холста» картинки в px со сторон. */
export type RocketModuleSpriteInset = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

/**
 * Смещения по полю `image` у объекта модуля/двигателя (как в `rocket.ts`).
 * Если пути здесь нет — инсеты {0}.
 */
export const ROCKET_MODULE_SPRITE_INSETS: Record<
  string,
  RocketModuleSpriteInset
> = {
  "rocket/Rocket_Platform.png": { top: 20 },
  "rocket/Small_Petroleum_Engine.webp": { bottom: 6 },
  "rocket/Petroleum_Engine.webp": { bottom: 6 },
  "rocket/Hydrogen_Engine.webp": { bottom: 26, left: 20, right: 20 },
};

/** Инсеты из `ROCKET_MODULE_SPRITE_INSETS` по `module.image` (нет ключа → нули). */
export function getRocketModuleSpriteInset(
  module: IRocketModule | IRocketEngine,
): Required<RocketModuleSpriteInset> {
  const s = ROCKET_MODULE_SPRITE_INSETS[module.image];
  return {
    top: s?.top ?? 0,
    right: s?.right ?? 0,
    bottom: s?.bottom ?? 0,
    left: s?.left ?? 0,
  };
}

export type RocketModulePartProps = Readonly<{
  module: IRocketModule | IRocketEngine;
  /**
   * tableRow — `<tr>` для таблицы.
   * block — блок на полную ширину сетки, картинка по центру.
   */
  layout: "tableRow" | "block";
  /**
   * Для layout="block": высота обёртки = ряды сетки (`cell`) или по контенту (`auto`), как у платформы под сеткой.
   * @default "cell"
   */
  blockHeight?: "cell" | "auto";
}>;

/** Отрисовка модуля/двигателя на сетке; инсеты подставляет из `ROCKET_MODULE_SPRITE_INSETS` по `module.image`. */
export function RocketModulePart(props: RocketModulePartProps) {
  const { module: part, layout, blockHeight = "cell" } = props;
  const inset = getRocketModuleSpriteInset(part);
  const baseH = part.height * ROCKET_CELL_PX;
  const baseW = part.width * ROCKET_CELL_PX;
  const imgSrc = getAssetImageUrl(part.image);

  if (layout === "tableRow") {
    return (
      <tr>
        <td
          colSpan={part.width}
          style={{
            height: baseH,
            width: ROCKET_CELL_PX * ROCKET_GRID_COLUMNS,
            position: "relative",
          }}
        >
          <img
            style={{
              position: "absolute",
              top: -inset.top,
              right: -inset.right,
              bottom: -inset.bottom,
              left: -inset.left,
            }}
            height={baseH + inset.top + inset.bottom}
            width={baseW + inset.left + inset.right}
            src={imgSrc}
            alt=""
          />
        </td>
      </tr>
    );
  }

  return (
    <div
      style={{
        ...(blockHeight === "cell" ? { height: baseH } : {}),
        width: ROCKET_CELL_PX * ROCKET_GRID_COLUMNS,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <img
        style={{
          display: "block",
          marginTop: -inset.top,
          marginRight: -inset.right,
          marginBottom: -inset.bottom,
          marginLeft: -inset.left,
        }}
        height={baseH + inset.top + inset.bottom}
        width={baseW + inset.left + inset.right}
        src={imgSrc}
        alt=""
      />
    </div>
  );
}

export function RocketPlatformImage() {
  return (
    <RocketModulePart module={rocketModules.rocketPlatform} layout="tableRow" />
  );
}

export function SmallPetroleumEngineImage() {
  return (
    <RocketModulePart module={rocketEngines.smallPetroleum} layout="block" />
  );
}

export function PetroleumEngineImage() {
  return (
    <RocketModulePart module={rocketEngines.petroleum} layout="block" />
  );
}

export function RocketPlatformBlock() {
  return (
    <RocketModulePart
      module={rocketModules.rocketPlatform}
      layout="block"
      blockHeight="auto"
    />
  );
}
