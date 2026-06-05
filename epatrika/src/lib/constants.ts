import { InvitationData, ThemeName } from "@/types/invitation";

export const PAGE_TURN_EASING = [0.645, 0.045, 0.355, 1] as const;
export const PAGE_TURN_DURATION = 0.85;

export const THEMES: Record<ThemeName, { bg: string; text: string; accent: string }> = {
  ivory: { bg: "#FAF7F2", text: "#1C1917", accent: "#C9A84C" },
  midnight: { bg: "#0F1729", text: "#F5F0E8", accent: "#C9A84C" },
  blush: { bg: "#E8DDD4", text: "#2C1810", accent: "#B8956A" },
};

export const DEFAULT_INVITATION: InvitationData = {
  id: "demo",
  familyName: "The Sharma Family",
  eventLabel: "Wedding Invitation",
  withFamiliesText: "Together with their families",
  brideName: "Priya",
  groomName: "Rahul",
  requestLine: "Request the honour of your presence",
  dayName: "Saturday",
  dateText: "14 June 2025",
  timeText: "Seven o'clock in the evening",
  venueName: "Raj Mahal Banquet Hall",
  city: "Mumbai",
  customNote: "No boxed gifts please.",
  secondEvent: "Reception to follow dinner",
  rsvpPhone: "919876543210",
  mapQuery: "Raj Mahal Banquet Hall Mumbai",
  theme: "ivory",
};
