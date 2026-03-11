import male1 from "@/assets/avatars/male-1.png";
import male2 from "@/assets/avatars/male-2.png";
import male3 from "@/assets/avatars/male-3.png";
import male4 from "@/assets/avatars/male-4.png";
import male5 from "@/assets/avatars/male-5.png";
import female1 from "@/assets/avatars/female-1.png";
import female2 from "@/assets/avatars/female-2.png";
import female3 from "@/assets/avatars/female-3.png";
import female4 from "@/assets/avatars/female-4.png";
import female5 from "@/assets/avatars/female-5.png";

export const avatarMap: Record<string, string> = {
  "male-1": male1,
  "male-2": male2,
  "male-3": male3,
  "male-4": male4,
  "male-5": male5,
  "female-1": female1,
  "female-2": female2,
  "female-3": female3,
  "female-4": female4,
  "female-5": female5,
};

/**
 * Resolves an avatar value to a displayable URL.
 * Handles: avatar IDs ("male-1"), data URIs, full URLs, and legacy Vite-hashed paths.
 */
export function resolveAvatarUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  
  // If it's a known avatar ID, resolve it
  if (avatarMap[value]) return avatarMap[value];
  
  // If it's a data URI or http URL, use directly
  if (value.startsWith("data:") || value.startsWith("http")) return value;
  
  // Try to match legacy Vite-hashed URLs or dev paths
  // e.g. "/assets/male-4-SRYeEBa6.png" or "/src/assets/avatars/male-1.png"
  const avatarIds = Object.keys(avatarMap);
  for (const id of avatarIds) {
    if (value.includes(id)) return avatarMap[id];
  }
  
  // Fallback: return as-is
  return value;
}
