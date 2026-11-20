/**
 * Configuration and Step Definitions for Sahay AI Onboarding Tour
 */

export interface TourStepConfig {
  id: string;
  selector: string;
  titleKey: "step1Title" | "step2Title" | "step3Title";
  descKey: "step1Desc" | "step2Desc" | "step3Desc";
  iconName: "search" | "map" | "compare";
}

export const TOUR_STEPS_CONFIG: TourStepConfig[] = [
  {
    id: "search-presets",
    selector: '[data-tour="search-presets"]',
    titleKey: "step1Title",
    descKey: "step1Desc",
    iconName: "search",
  },
  {
    id: "state-map",
    selector: '[data-tour="state-map"]',
    titleKey: "step2Title",
    descKey: "step2Desc",
    iconName: "map",
  },
  {
    id: "scheme-compare",
    selector: '[data-tour="scheme-compare"]',
    titleKey: "step3Title",
    descKey: "step3Desc",
    iconName: "compare",
  },
];
