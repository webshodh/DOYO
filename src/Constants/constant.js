export const NORMALIZED_VEG = ["veg", "vegetarian"];
export const NORMALIZED_NONVEG = [
  "nonveg",
  "non veg",
  "non-veg",
  "non vegetarian",
  "meat",
];

export const SIZE_CLASSES = {
  xs: {
    container: "w-3 h-3 border",
    dot: "w-1 h-1",
    logo: "w-2 h-2",
  },
  sm: {
    container: "w-4 h-4 border-2",
    dot: "w-1.5 h-1.5",
    logo: "w-3 h-3",
  },
  md: {
    container: "w-5 h-5 border-2",
    dot: "w-2 h-2",
    logo: "w-4 h-4",
  },
  lg: {
    container: "w-6 h-6 border-2",
    dot: "w-2.5 h-2.5",
    logo: "w-5 h-5",
  },
};

export const POSITION_CLASSES = {
  relative: "",
  absolute: "absolute top-2 right-4 z-10",
};

export const COLOR_CLASSES = {
  veg: {
    border: "border-green-500",
    bg: "bg-green-500",
    label: "Vegetarian",
  },
  nonveg: {
    border: "border-red-500",
    bg: "bg-red-500",
    label: "Non-vegetarian",
  },
};
