import { z } from "zod";
import { DEFAULT_INVITATION } from "@/lib/constants";
import { InvitationData, ThemeName } from "@/types/invitation";

const themeSchema = z.enum(["ivory", "midnight", "blush"]);

const invitationSchema = z.object({
  familyName: z.string().min(1),
  eventLabel: z.string().min(1),
  withFamiliesText: z.string().min(1).default(DEFAULT_INVITATION.withFamiliesText),
  brideName: z.string().min(1),
  groomName: z.string().min(1),
  requestLine: z.string().min(1).default(DEFAULT_INVITATION.requestLine),
  dayName: z.string().min(1),
  dateText: z.string().min(1),
  timeText: z.string().min(1),
  venueName: z.string().min(1),
  city: z.string().min(1),
  customNote: z.string().optional(),
  secondEvent: z.string().optional(),
  rsvpPhone: z.string().min(6),
  mapQuery: z.string().min(1),
  theme: themeSchema.default(DEFAULT_INVITATION.theme),
});

export function formatWhatsAppHref(phone: string, message: string): string {
  return `https://wa.me/${phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(message)}`;
}

export function formatMapHref(mapQuery: string): string {
  return `https://maps.google.com/?q=${encodeURIComponent(mapQuery)}`;
}

function parseBase64Data(dataParam: string) {
  try {
    const decoded = Buffer.from(decodeURIComponent(dataParam), "base64").toString("utf-8");
    return JSON.parse(decoded) as Record<string, string>;
  } catch {
    return null;
  }
}

export function getTheme(value: string | undefined): ThemeName {
  const parsed = themeSchema.safeParse(value);
  return parsed.success ? parsed.data : DEFAULT_INVITATION.theme;
}

export function resolveInvitationData(
  id: string,
  searchParams: Record<string, string | string[] | undefined>,
): InvitationData {
  const fromData = typeof searchParams.data === "string" ? parseBase64Data(searchParams.data) : null;
  const base = fromData ?? Object.fromEntries(
    Object.entries(searchParams).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );

  const parsed = invitationSchema.safeParse({
    familyName: base.familyName ?? DEFAULT_INVITATION.familyName,
    eventLabel: base.eventLabel ?? DEFAULT_INVITATION.eventLabel,
    withFamiliesText: base.withFamiliesText ?? DEFAULT_INVITATION.withFamiliesText,
    brideName: base.brideName ?? DEFAULT_INVITATION.brideName,
    groomName: base.groomName ?? DEFAULT_INVITATION.groomName,
    requestLine: base.requestLine ?? DEFAULT_INVITATION.requestLine,
    dayName: base.dayName ?? DEFAULT_INVITATION.dayName,
    dateText: base.dateText ?? DEFAULT_INVITATION.dateText,
    timeText: base.timeText ?? DEFAULT_INVITATION.timeText,
    venueName: base.venueName ?? DEFAULT_INVITATION.venueName,
    city: base.city ?? DEFAULT_INVITATION.city,
    customNote: base.customNote,
    secondEvent: base.secondEvent,
    rsvpPhone: base.rsvpPhone ?? DEFAULT_INVITATION.rsvpPhone,
    mapQuery: base.mapQuery ?? `${base.venueName ?? DEFAULT_INVITATION.venueName} ${base.city ?? DEFAULT_INVITATION.city}`,
    theme: getTheme(base.theme),
  });

  return {
    ...DEFAULT_INVITATION,
    id,
    ...(parsed.success ? parsed.data : {}),
  };
}
