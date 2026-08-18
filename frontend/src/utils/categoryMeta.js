export const CATEGORY_META = {
  general: { label: "General", icon: "📌", color: "#6b7280" },
  work: { label: "Work", icon: "💼", color: "#7c3aed" },
  personal: { label: "Personal", icon: "🌱", color: "#059669" },
  health: { label: "Health", icon: "🏃", color: "#16a34a" },
  errands: { label: "Errands", icon: "🛒", color: "#ea580c" },
  sleep: { label: "Sleep", icon: "🌙", color: "#2563eb" },
  eating: { label: "Eating", icon: "🍽️", color: "#f97316" },
  training: { label: "Training", icon: "🏋️", color: "#15803d" },
  study: { label: "Studying", icon: "📚", color: "#4f46e5" },
  break: { label: "Break", icon: "☕", color: "#92400e" },
};

export const CATEGORY_LIST = Object.keys(CATEGORY_META);

export const getCategoryMeta = (category) =>
  CATEGORY_META[category] || CATEGORY_META.general;

// Converts "HH:mm" to minutes since midnight
export const timeToMinutes = (time) => {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};