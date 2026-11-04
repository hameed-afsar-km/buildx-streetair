import { AQICategory } from "./types";

export interface AQIClassification {
  category: AQICategory;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  advisory: string;
  activityRecommendation: string;
  sensitiveGroupWarning: string;
}

export const AQI_SCALE: Record<AQICategory, AQIClassification> = {
  Good: {
    category: "Good",
    min: 0,
    max: 50,
    color: "#10B981", // Emerald Green
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    borderColor: "border-emerald-300 dark:border-emerald-800",
    textColor: "text-emerald-700 dark:text-emerald-300",
    advisory: "Air quality is considered satisfactory, and air pollution poses little or no risk.",
    activityRecommendation: "Ideal for outdoor activities, sports, and ventilation.",
    sensitiveGroupWarning: "None. Everyone can continue normal outdoor activities.",
  },
  Moderate: {
    category: "Moderate",
    min: 51,
    max: 100,
    color: "#F59E0B", // Amber / Yellow
    bgColor: "bg-amber-50 dark:bg-amber-950/40",
    borderColor: "border-amber-300 dark:border-amber-800",
    textColor: "text-amber-800 dark:text-amber-300",
    advisory: "Air quality is acceptable; however, for some pollutants there may be moderate health concern.",
    activityRecommendation: "Outdoor exercise is fine for most people.",
    sensitiveGroupWarning: "Unusually sensitive people should consider reducing prolonged outdoor exertion.",
  },
  Poor: {
    category: "Poor",
    min: 101,
    max: 150,
    color: "#F97316", // Orange
    bgColor: "bg-orange-50 dark:bg-orange-950/40",
    borderColor: "border-orange-300 dark:border-orange-800",
    textColor: "text-orange-800 dark:text-orange-300",
    advisory: "Members of sensitive groups may experience health effects. The general public is not likely to be affected.",
    activityRecommendation: "Sensitive groups should reduce prolonged outdoor heavy exertion.",
    sensitiveGroupWarning: "People with respiratory or heart disease, the elderly, and children should limit prolonged outdoor exertion.",
  },
  Unhealthy: {
    category: "Unhealthy",
    min: 151,
    max: 200,
    color: "#EF4444", // Red
    bgColor: "bg-red-50 dark:bg-red-950/40",
    borderColor: "border-red-300 dark:border-red-800",
    textColor: "text-red-800 dark:text-red-300",
    advisory: "Everyone may begin to experience health effects; members of sensitive groups may experience more serious effects.",
    activityRecommendation: "Avoid prolonged outdoor exertion. Wear an N95 mask near busy transit corridors.",
    sensitiveGroupWarning: "Active children, older adults, and individuals with asthma should avoid prolonged outdoor exertion.",
  },
  "Very Unhealthy": {
    category: "Very Unhealthy",
    min: 201,
    max: 300,
    color: "#8B5CF6", // Purple
    bgColor: "bg-purple-50 dark:bg-purple-950/40",
    borderColor: "border-purple-300 dark:border-purple-800",
    textColor: "text-purple-800 dark:text-purple-300",
    advisory: "Health alert: The risk of health effects is increased for everyone.",
    activityRecommendation: "Significantly curtail outdoor activities. Keep windows closed and operate indoor HEPA purifiers.",
    sensitiveGroupWarning: "Everyone should avoid outdoor physical exertion. High-risk groups must remain indoors.",
  },
  Hazardous: {
    category: "Hazardous",
    min: 301,
    max: 500,
    color: "#881337", // Maroon / Deep Burgundy
    bgColor: "bg-rose-50 dark:bg-rose-950/40",
    borderColor: "border-rose-300 dark:border-rose-900",
    textColor: "text-rose-900 dark:text-rose-300",
    advisory: "Health warning of emergency conditions: The entire population is more likely to be affected.",
    activityRecommendation: "Emergency precautions: Remain indoors, seal entry points, run air purification.",
    sensitiveGroupWarning: "All individuals should avoid all outdoor physical activity. Emergency respiratory advisories in effect.",
  },
  Severe: {
    category: "Severe",
    min: 401,
    max: 500,
    color: "#4C0519", // Deepest Maroon
    bgColor: "bg-red-100 dark:bg-red-950/60",
    borderColor: "border-red-500 dark:border-red-800",
    textColor: "text-red-950 dark:text-red-200",
    advisory: "Severe emergency: Respiratory impact even on healthy people, serious impact on those with disease.",
    activityRecommendation: "Complete restriction on outdoor exposure.",
    sensitiveGroupWarning: "Immediate medical advisory.",
  },
};

export function getAQIClassification(aqi: number): AQIClassification {
  if (aqi <= 50) return AQI_SCALE.Good;
  if (aqi <= 100) return AQI_SCALE.Moderate;
  if (aqi <= 150) return AQI_SCALE.Poor;
  if (aqi <= 200) return AQI_SCALE.Unhealthy;
  if (aqi <= 300) return AQI_SCALE["Very Unhealthy"];
  if (aqi <= 400) return AQI_SCALE.Hazardous;
  return AQI_SCALE.Severe;
}

export function getAQIColor(aqi: number): string {
  return getAQIClassification(aqi).color;
}

