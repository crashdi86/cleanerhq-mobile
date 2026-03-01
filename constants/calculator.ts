/**
 * M-13: Calculator type constants, field schemas, and add-on definitions.
 *
 * Each calculator type defines:
 * - Metadata (key, label, icon, category)
 * - Frequency support
 * - Domain-specific field definitions for the dynamic form
 * - Add-on toggles
 */

import type { CalculatorType, ServiceFrequency } from "@/lib/api/types";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faHouse,
  faBriefcase,
  faSun,
  faDroplet,
  faBuilding,
  faBroom,
  faBed,
  faBoxesStacked,
  faHospital,
  faWater,
  faGlasses,
  faSprayCanSparkles,
  faCouch,
  faChampagneGlasses,
  faHardHat,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

// ── Field Definitions ──

export type FieldType = "slider" | "stepper" | "toggle" | "text" | "select" | "currency";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  // Slider / Stepper props
  min?: number;
  max?: number;
  step?: number;
  snapPoints?: number[];
  defaultValue?: number | string | boolean;
  // Select props
  options?: SelectOption[];
  // Formatting
  unit?: string;
  formatValue?: (v: number) => string;
}

// ── Add-On Definition ──

export interface AddOnDefinition {
  key: string;
  label: string;
  icon: string; // FA icon name
}

// ── Category ──

export type CalculatorCategory = "residential" | "commercial" | "specialty";

// ── Calculator Type Metadata ──

export interface CalculatorTypeMeta {
  key: CalculatorType;
  label: string;
  icon: IconDefinition;
  category: CalculatorCategory;
  hasFrequency: boolean;
  defaultFrequency: ServiceFrequency;
  fields: FieldDefinition[];
  addOns: AddOnDefinition[];
}

// ── Category Labels ──

export const CATEGORY_LABELS: Record<CalculatorCategory, string> = {
  residential: "Residential",
  commercial: "Commercial",
  specialty: "Specialty",
};

// ── Shared Field Defaults ──

const sqftSlider = (label = "Total Square Footage"): FieldDefinition => ({
  key: "total_sqft",
  label,
  type: "slider",
  min: 200,
  max: 10000,
  step: 50,
  snapPoints: [500, 1000, 1500, 2000, 2500, 3000, 4000, 5000],
  defaultValue: 1500,
  unit: "sqft",
  formatValue: (v: number) => `${v.toLocaleString()} sqft`,
  required: true,
});

const bedroomStepper: FieldDefinition = {
  key: "bedroom_count",
  label: "Bedrooms",
  type: "stepper",
  min: 0,
  max: 10,
  step: 1,
  defaultValue: 3,
  required: true,
};

const fullBathStepper: FieldDefinition = {
  key: "full_bath_count",
  label: "Full Bathrooms",
  type: "stepper",
  min: 0,
  max: 10,
  step: 1,
  defaultValue: 2,
  required: true,
};

const halfBathStepper: FieldDefinition = {
  key: "half_bath_count",
  label: "Half Bathrooms",
  type: "stepper",
  min: 0,
  max: 5,
  step: 1,
  defaultValue: 1,
};

const flooringSelect: FieldDefinition = {
  key: "flooring_type",
  label: "Flooring Type",
  type: "select",
  options: [
    { value: "mostly_carpet", label: "Mostly Carpet" },
    { value: "mostly_hard_surface", label: "Mostly Hard Surface" },
    { value: "mixed", label: "Mixed" },
  ],
  defaultValue: "mixed",
  required: true,
};

const occupancySelect: FieldDefinition = {
  key: "occupancy_level",
  label: "Occupancy Level",
  type: "select",
  options: [
    { value: "light", label: "Light" },
    { value: "average", label: "Average" },
    { value: "heavy", label: "Heavy" },
  ],
  defaultValue: "average",
};

const petStepper: FieldDefinition = {
  key: "dog_cat_count",
  label: "Dogs / Cats",
  type: "stepper",
  min: 0,
  max: 10,
  step: 1,
  defaultValue: 0,
};

const sheddingSelect: FieldDefinition = {
  key: "shedding_level",
  label: "Pet Shedding Level",
  type: "select",
  options: [
    { value: "none", label: "None" },
    { value: "light", label: "Light" },
    { value: "moderate", label: "Moderate" },
    { value: "heavy", label: "Heavy" },
  ],
  defaultValue: "none",
};

const conditionSelect: FieldDefinition = {
  key: "home_condition",
  label: "Home Condition",
  type: "select",
  options: [
    { value: "clean", label: "Clean / Well-kept" },
    { value: "standard", label: "Standard" },
    { value: "dirty", label: "Dirty / Neglected" },
  ],
  defaultValue: "standard",
};

const hourlyWageField: FieldDefinition = {
  key: "loaded_hourly_wage",
  label: "Loaded Hourly Wage",
  type: "currency",
  defaultValue: 28,
  min: 10,
  max: 100,
  required: true,
};

const targetMarginField: FieldDefinition = {
  key: "target_margin_percent",
  label: "Target Margin %",
  type: "stepper",
  min: 5,
  max: 80,
  step: 5,
  defaultValue: 40,
};

// ── 16 Calculator Type Definitions ──

export const CALCULATOR_TYPES: CalculatorTypeMeta[] = [
  // ─── Residential ───
  {
    key: "house_cleaning_standard_recurring",
    label: "House Cleaning (Recurring)",
    icon: faHouse,
    category: "residential",
    hasFrequency: true,
    defaultFrequency: "biweekly",
    fields: [
      sqftSlider(),
      bedroomStepper,
      fullBathStepper,
      halfBathStepper,
      flooringSelect,
      occupancySelect,
      petStepper,
      sheddingSelect,
      conditionSelect,
      hourlyWageField,
      targetMarginField,
    ],
    addOns: [
      { key: "inside_windows", label: "Inside Windows", icon: "window-maximize" },
      { key: "fridge_cleaning", label: "Refrigerator Cleaning", icon: "snowflake" },
      { key: "oven_cleaning", label: "Oven Cleaning", icon: "fire-burner" },
      { key: "laundry", label: "Laundry Service", icon: "shirt" },
      { key: "interior_cabinet", label: "Inside Cabinets", icon: "box-open" },
    ],
  },
  {
    key: "move_in_out",
    label: "Move In / Out",
    icon: faBoxesStacked,
    category: "residential",
    hasFrequency: false,
    defaultFrequency: "one_time",
    fields: [
      sqftSlider(),
      bedroomStepper,
      fullBathStepper,
      halfBathStepper,
      flooringSelect,
      conditionSelect,
      { key: "garage_included", label: "Include Garage", type: "toggle", defaultValue: false },
      { key: "appliances_included", label: "Inside Appliances", type: "toggle", defaultValue: true },
      hourlyWageField,
      targetMarginField,
    ],
    addOns: [
      { key: "inside_windows", label: "Inside Windows", icon: "window-maximize" },
      { key: "garage_deep", label: "Garage Deep Clean", icon: "warehouse" },
      { key: "wall_washing", label: "Wall Washing", icon: "brush" },
      { key: "blinds", label: "Blinds Cleaning", icon: "bars" },
    ],
  },
  {
    key: "airbnb_str_turnover",
    label: "Airbnb / STR Turnover",
    icon: faBed,
    category: "residential",
    hasFrequency: true,
    defaultFrequency: "weekly",
    fields: [
      sqftSlider(),
      bedroomStepper,
      fullBathStepper,
      { key: "guest_capacity", label: "Guest Capacity", type: "stepper", min: 1, max: 20, step: 1, defaultValue: 4 },
      { key: "linen_change", label: "Linen Change", type: "toggle", defaultValue: true },
      { key: "restocking", label: "Restocking Supplies", type: "toggle", defaultValue: true },
      hourlyWageField,
      targetMarginField,
    ],
    addOns: [
      { key: "laundry_onsite", label: "On-Site Laundry", icon: "shirt" },
      { key: "checklist_photos", label: "Photo Documentation", icon: "camera" },
      { key: "deep_clean_monthly", label: "Monthly Deep Clean", icon: "broom" },
    ],
  },

  // ─── Commercial ───
  {
    key: "office_janitorial",
    label: "Office Janitorial",
    icon: faBriefcase,
    category: "commercial",
    hasFrequency: false,
    defaultFrequency: "one_time",
    fields: [
      sqftSlider("Office Square Footage"),
      { key: "floor_count", label: "Number of Floors", type: "stepper", min: 1, max: 20, step: 1, defaultValue: 1 },
      { key: "restroom_count", label: "Restrooms", type: "stepper", min: 0, max: 30, step: 1, defaultValue: 2 },
      { key: "cubicle_count", label: "Cubicles / Desks", type: "stepper", min: 0, max: 200, step: 5, defaultValue: 10 },
      { key: "kitchen_break_room", label: "Kitchen / Break Room", type: "toggle", defaultValue: true },
      flooringSelect,
      hourlyWageField,
      targetMarginField,
    ],
    addOns: [
      { key: "window_cleaning", label: "Window Cleaning", icon: "window-maximize" },
      { key: "carpet_vacuuming", label: "Carpet Vacuuming", icon: "broom" },
      { key: "trash_removal", label: "Trash Removal", icon: "trash" },
      { key: "sanitization", label: "Surface Sanitization", icon: "spray-can-sparkles" },
    ],
  },
  {
    key: "commercial_janitorial_recurring",
    label: "Commercial Janitorial (Recurring)",
    icon: faBuilding,
    category: "commercial",
    hasFrequency: true,
    defaultFrequency: "weekly",
    fields: [
      sqftSlider("Facility Square Footage"),
      { key: "floor_count", label: "Number of Floors", type: "stepper", min: 1, max: 20, step: 1, defaultValue: 1 },
      { key: "restroom_count", label: "Restrooms", type: "stepper", min: 0, max: 30, step: 1, defaultValue: 4 },
      { key: "employee_count", label: "Employee Count", type: "stepper", min: 1, max: 500, step: 5, defaultValue: 20 },
      { key: "kitchen_break_room", label: "Kitchen / Break Room", type: "toggle", defaultValue: true },
      flooringSelect,
      hourlyWageField,
      targetMarginField,
    ],
    addOns: [
      { key: "window_cleaning", label: "Window Cleaning", icon: "window-maximize" },
      { key: "floor_waxing", label: "Floor Waxing", icon: "droplet" },
      { key: "sanitization", label: "Surface Sanitization", icon: "spray-can-sparkles" },
      { key: "high_dust", label: "High Dusting", icon: "feather" },
    ],
  },
  {
    key: "medical_office_cleaning",
    label: "Medical Office Cleaning",
    icon: faHospital,
    category: "commercial",
    hasFrequency: false,
    defaultFrequency: "one_time",
    fields: [
      sqftSlider("Facility Square Footage"),
      { key: "exam_room_count", label: "Exam Rooms", type: "stepper", min: 1, max: 30, step: 1, defaultValue: 4 },
      { key: "restroom_count", label: "Restrooms", type: "stepper", min: 1, max: 10, step: 1, defaultValue: 2 },
      { key: "waiting_area", label: "Waiting Area", type: "toggle", defaultValue: true },
      { key: "biohazard_areas", label: "Biohazard Areas", type: "toggle", defaultValue: false },
      { key: "hipaa_compliance", label: "HIPAA-Compliant Disposal", type: "toggle", defaultValue: true },
      hourlyWageField,
      targetMarginField,
    ],
    addOns: [
      { key: "sharps_disposal", label: "Sharps Disposal", icon: "syringe" },
      { key: "uv_sanitization", label: "UV Sanitization", icon: "sun" },
      { key: "floor_care", label: "Floor Care", icon: "droplet" },
    ],
  },

  // ─── Specialty ───
  {
    key: "solar_panel",
    label: "Solar Panel Cleaning",
    icon: faSun,
    category: "specialty",
    hasFrequency: false,
    defaultFrequency: "one_time",
    fields: [
      { key: "panel_count", label: "Number of Panels", type: "stepper", min: 1, max: 200, step: 1, defaultValue: 20, required: true },
      { key: "roof_pitch", label: "Roof Pitch", type: "select", options: [
        { value: "flat", label: "Flat (0-15°)" },
        { value: "low", label: "Low (15-25°)" },
        { value: "medium", label: "Medium (25-35°)" },
        { value: "steep", label: "Steep (35°+)" },
      ], defaultValue: "low", required: true },
      { key: "stories", label: "Building Stories", type: "stepper", min: 1, max: 4, step: 1, defaultValue: 1 },
      { key: "ground_mount", label: "Ground Mounted", type: "toggle", defaultValue: false },
      hourlyWageField,
      targetMarginField,
    ],
    addOns: [
      { key: "gutter_check", label: "Gutter Inspection", icon: "eye" },
      { key: "bird_proofing", label: "Bird Proofing", icon: "dove" },
      { key: "inverter_check", label: "Inverter Check", icon: "bolt" },
    ],
  },
  {
    key: "gutter_cleaning",
    label: "Gutter Cleaning",
    icon: faDroplet,
    category: "specialty",
    hasFrequency: false,
    defaultFrequency: "one_time",
    fields: [
      { key: "linear_feet", label: "Linear Feet of Gutters", type: "slider", min: 50, max: 500, step: 10, snapPoints: [100, 150, 200, 250, 300], defaultValue: 150, formatValue: (v: number) => `${v} ft`, required: true },
      { key: "stories", label: "Building Stories", type: "stepper", min: 1, max: 4, step: 1, defaultValue: 1, required: true },
      { key: "downspout_count", label: "Downspouts", type: "stepper", min: 1, max: 20, step: 1, defaultValue: 4 },
      { key: "debris_level", label: "Debris Level", type: "select", options: [
        { value: "light", label: "Light" },
        { value: "moderate", label: "Moderate" },
        { value: "heavy", label: "Heavy / Clogged" },
      ], defaultValue: "moderate" },
      hourlyWageField,
      targetMarginField,
    ],
    addOns: [
      { key: "downspout_flush", label: "Downspout Flushing", icon: "faucet-drip" },
      { key: "gutter_guards", label: "Guard Installation", icon: "shield-halved" },
      { key: "roof_debris", label: "Roof Debris Removal", icon: "leaf" },
    ],
  },
  {
    key: "window_cleaning",
    label: "Window Cleaning",
    icon: faGlasses,
    category: "specialty",
    hasFrequency: false,
    defaultFrequency: "one_time",
    fields: [
      { key: "window_count", label: "Number of Windows", type: "stepper", min: 1, max: 200, step: 1, defaultValue: 15, required: true },
      { key: "stories", label: "Building Stories", type: "stepper", min: 1, max: 10, step: 1, defaultValue: 2 },
      { key: "window_size", label: "Average Window Size", type: "select", options: [
        { value: "small", label: "Small (< 4 sqft)" },
        { value: "standard", label: "Standard (4-12 sqft)" },
        { value: "large", label: "Large (> 12 sqft)" },
      ], defaultValue: "standard" },
      { key: "interior_exterior", label: "Interior & Exterior", type: "select", options: [
        { value: "exterior_only", label: "Exterior Only" },
        { value: "interior_only", label: "Interior Only" },
        { value: "both", label: "Both" },
      ], defaultValue: "both" },
      hourlyWageField,
      targetMarginField,
    ],
    addOns: [
      { key: "screen_cleaning", label: "Screen Cleaning", icon: "border-all" },
      { key: "track_cleaning", label: "Track & Sill Cleaning", icon: "brush" },
      { key: "hard_water_removal", label: "Hard Water Removal", icon: "droplet" },
    ],
  },
  {
    key: "pressure_washing",
    label: "Pressure Washing",
    icon: faSprayCanSparkles,
    category: "specialty",
    hasFrequency: false,
    defaultFrequency: "one_time",
    fields: [
      sqftSlider("Surface Area (sqft)"),
      { key: "surface_type", label: "Surface Type", type: "select", options: [
        { value: "concrete", label: "Concrete" },
        { value: "wood_deck", label: "Wood Deck" },
        { value: "siding", label: "Siding / Exterior Walls" },
        { value: "brick", label: "Brick" },
        { value: "pavers", label: "Pavers" },
      ], defaultValue: "concrete", required: true },
      { key: "stain_level", label: "Stain Level", type: "select", options: [
        { value: "light", label: "Light" },
        { value: "moderate", label: "Moderate" },
        { value: "heavy", label: "Heavy" },
      ], defaultValue: "moderate" },
      { key: "water_source", label: "Water Source Available", type: "toggle", defaultValue: true },
      hourlyWageField,
      targetMarginField,
    ],
    addOns: [
      { key: "sealing", label: "Surface Sealing", icon: "shield-halved" },
      { key: "chemical_treatment", label: "Chemical Treatment", icon: "flask" },
      { key: "gutter_cleaning", label: "Gutter Cleaning", icon: "droplet" },
    ],
  },
  {
    key: "carpet_upholstery",
    label: "Carpet & Upholstery",
    icon: faCouch,
    category: "specialty",
    hasFrequency: false,
    defaultFrequency: "one_time",
    fields: [
      { key: "room_count", label: "Rooms", type: "stepper", min: 1, max: 20, step: 1, defaultValue: 3, required: true },
      sqftSlider("Total Carpet Area"),
      { key: "carpet_condition", label: "Carpet Condition", type: "select", options: [
        { value: "good", label: "Good" },
        { value: "fair", label: "Fair" },
        { value: "poor", label: "Poor / Heavy Stains" },
      ], defaultValue: "fair" },
      { key: "upholstery_pieces", label: "Upholstery Pieces", type: "stepper", min: 0, max: 20, step: 1, defaultValue: 0 },
      { key: "stair_sections", label: "Stair Sections", type: "stepper", min: 0, max: 10, step: 1, defaultValue: 0 },
      hourlyWageField,
      targetMarginField,
    ],
    addOns: [
      { key: "stain_treatment", label: "Stain Treatment", icon: "spray-can-sparkles" },
      { key: "deodorizing", label: "Deodorizing", icon: "wind" },
      { key: "scotchgard", label: "Scotchgard Protection", icon: "shield-halved" },
      { key: "pet_treatment", label: "Pet Stain / Odor Treatment", icon: "paw" },
    ],
  },
  {
    key: "floor_stripping_waxing",
    label: "Floor Stripping & Waxing",
    icon: faWater,
    category: "specialty",
    hasFrequency: false,
    defaultFrequency: "one_time",
    fields: [
      sqftSlider("Floor Area (sqft)"),
      { key: "floor_type", label: "Floor Type", type: "select", options: [
        { value: "vct", label: "VCT (Vinyl Tile)" },
        { value: "linoleum", label: "Linoleum" },
        { value: "hardwood", label: "Hardwood" },
        { value: "terrazzo", label: "Terrazzo" },
        { value: "concrete", label: "Polished Concrete" },
      ], defaultValue: "vct", required: true },
      { key: "wax_layers", label: "Wax Layers", type: "stepper", min: 1, max: 6, step: 1, defaultValue: 3 },
      { key: "furniture_moving", label: "Furniture Moving Required", type: "toggle", defaultValue: false },
      hourlyWageField,
      targetMarginField,
    ],
    addOns: [
      { key: "burnishing", label: "High-Speed Burnishing", icon: "bolt" },
      { key: "baseboards", label: "Baseboard Cleaning", icon: "brush" },
    ],
  },
  {
    key: "hoarding_clutter_remediation",
    label: "Hoarding Remediation",
    icon: faBoxesStacked,
    category: "specialty",
    hasFrequency: false,
    defaultFrequency: "one_time",
    fields: [
      sqftSlider("Affected Area (sqft)"),
      { key: "severity_level", label: "Severity Level", type: "select", options: [
        { value: "level_1", label: "Level 1 — Minor Clutter" },
        { value: "level_2", label: "Level 2 — Moderate" },
        { value: "level_3", label: "Level 3 — Severe" },
        { value: "level_4", label: "Level 4 — Extreme" },
        { value: "level_5", label: "Level 5 — Uninhabitable" },
      ], defaultValue: "level_2", required: true },
      { key: "room_count", label: "Rooms Affected", type: "stepper", min: 1, max: 15, step: 1, defaultValue: 3 },
      { key: "biohazard", label: "Biohazard Present", type: "toggle", defaultValue: false },
      { key: "haul_away", label: "Haul-Away Required", type: "toggle", defaultValue: true },
      hourlyWageField,
      targetMarginField,
    ],
    addOns: [
      { key: "dumpster", label: "Dumpster Rental", icon: "dumpster" },
      { key: "pest_treatment", label: "Pest Treatment Prep", icon: "bug" },
      { key: "deep_sanitize", label: "Deep Sanitization", icon: "spray-can-sparkles" },
    ],
  },
  {
    key: "event_cleanup",
    label: "Event Cleanup",
    icon: faChampagneGlasses,
    category: "specialty",
    hasFrequency: false,
    defaultFrequency: "one_time",
    fields: [
      sqftSlider("Venue Area (sqft)"),
      { key: "guest_count", label: "Expected Guests", type: "stepper", min: 10, max: 2000, step: 10, defaultValue: 100 },
      { key: "event_type", label: "Event Type", type: "select", options: [
        { value: "wedding", label: "Wedding" },
        { value: "corporate", label: "Corporate Event" },
        { value: "party", label: "Party" },
        { value: "festival", label: "Festival / Outdoor" },
        { value: "conference", label: "Conference" },
      ], defaultValue: "party" },
      { key: "outdoor", label: "Outdoor Event", type: "toggle", defaultValue: false },
      { key: "food_service", label: "Food Service Area", type: "toggle", defaultValue: true },
      hourlyWageField,
      targetMarginField,
    ],
    addOns: [
      { key: "trash_haul", label: "Trash Hauling", icon: "truck" },
      { key: "floor_cleaning", label: "Floor Cleaning", icon: "broom" },
      { key: "restroom_service", label: "Restroom Service", icon: "restroom" },
    ],
  },
  {
    key: "construction",
    label: "Post-Construction",
    icon: faHardHat,
    category: "specialty",
    hasFrequency: false,
    defaultFrequency: "one_time",
    fields: [
      sqftSlider("Construction Area (sqft)"),
      { key: "construction_phase", label: "Construction Phase", type: "select", options: [
        { value: "rough", label: "Rough Clean" },
        { value: "final", label: "Final Clean" },
        { value: "touch_up", label: "Touch-Up / Punch List" },
      ], defaultValue: "final", required: true },
      { key: "floor_count", label: "Number of Floors", type: "stepper", min: 1, max: 20, step: 1, defaultValue: 1 },
      { key: "window_count", label: "Windows", type: "stepper", min: 0, max: 200, step: 1, defaultValue: 10 },
      { key: "heavy_debris", label: "Heavy Debris Present", type: "toggle", defaultValue: false },
      hourlyWageField,
      targetMarginField,
    ],
    addOns: [
      { key: "window_cleaning", label: "Window Cleaning", icon: "window-maximize" },
      { key: "pressure_wash", label: "Pressure Washing", icon: "spray-can-sparkles" },
      { key: "duct_cleaning", label: "Duct Cleaning", icon: "wind" },
    ],
  },
  {
    key: "time_and_materials",
    label: "Time & Materials",
    icon: faClock,
    category: "specialty",
    hasFrequency: false,
    defaultFrequency: "one_time",
    fields: [
      { key: "estimated_hours", label: "Estimated Hours", type: "stepper", min: 1, max: 100, step: 0.5, defaultValue: 4, required: true },
      { key: "crew_size", label: "Crew Size", type: "stepper", min: 1, max: 10, step: 1, defaultValue: 2, required: true },
      { key: "materials_budget", label: "Materials Budget", type: "currency", min: 0, max: 10000, defaultValue: 0 },
      { key: "travel_time", label: "Travel Time (hours)", type: "stepper", min: 0, max: 4, step: 0.5, defaultValue: 0.5 },
      hourlyWageField,
      targetMarginField,
    ],
    addOns: [
      { key: "equipment_rental", label: "Equipment Rental", icon: "toolbox" },
      { key: "disposal_fees", label: "Disposal Fees", icon: "dumpster" },
    ],
  },
];

// ── Lookup Helpers ──

export function getCalculatorType(key: CalculatorType): CalculatorTypeMeta | undefined {
  return CALCULATOR_TYPES.find((t) => t.key === key);
}

export function getCalculatorTypesByCategory(category: CalculatorCategory): CalculatorTypeMeta[] {
  return CALCULATOR_TYPES.filter((t) => t.category === category);
}

export function getRecurringTypes(): CalculatorTypeMeta[] {
  return CALCULATOR_TYPES.filter((t) => t.hasFrequency);
}

// ── Frequency Options ──

export interface FrequencyOption {
  value: ServiceFrequency;
  label: string;
  discount?: string;
}

export const FREQUENCY_OPTIONS: FrequencyOption[] = [
  { value: "weekly", label: "Weekly", discount: "Save 15%" },
  { value: "biweekly", label: "Bi-Weekly", discount: "Save 10%" },
  { value: "monthly", label: "Monthly" },
];

// ── Recent Calculators AsyncStorage Key ──

export const RECENT_CALCULATORS_KEY = "@cleanerhq/recent_calculators";
export const MAX_RECENT_CALCULATORS = 5;
