export type ThemeName = "ivory" | "midnight" | "blush";

export interface InvitationData {
  id: string;
  familyName: string;
  eventLabel: string;
  withFamiliesText: string;
  brideName: string;
  groomName: string;
  requestLine: string;
  dayName: string;
  dateText: string;
  timeText: string;
  venueName: string;
  city: string;
  customNote?: string;
  secondEvent?: string;
  rsvpPhone: string;
  mapQuery: string;
  theme: ThemeName;
}
