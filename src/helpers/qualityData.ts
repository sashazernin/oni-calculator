import type { TranslationKey } from "../i18n/translations";

export function getQualityColor(quality: number): string {
  switch (quality) {
    case -1:
      return "rgb(140, 70, 55)";
    case 0:
      return "rgb(180, 120, 65)";
    case 1:
      return "rgb(200, 165, 55)";
    case 2:
      return "rgb(170, 175, 45)";
    case 3:
      return "rgb(90, 165, 85)";
    case 4:
      return "rgb(50, 165, 145)";
    case 5:
      return "rgb(80, 145, 215)";
    case 6:
      return "rgb(200, 110, 230)";
    default:
      return "inherit";
  }
}

export function getQualityTranslationKey(quality: number): TranslationKey {
  switch (quality) {
    case -1:
      return "quality_grisly";
    case 0:
      return "quality_terrible";
    case 1:
      return "quality_poor";
    case 2:
      return "quality_standard";
    case 3:
      return "quality_good";
    case 4:
      return "quality_great";
    case 5:
      return "quality_superb";
    case 6:
      return "quality_ambrosial";
    default:
      return "quality_unknown";
  }
}
