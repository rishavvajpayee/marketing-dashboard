const DEFAULT_BG = [
  "#3A1A2E",
  "#1A2E3A",
  "#1A3A1E",
  "#2E2A1A",
  "#2E1A1A",
  "#1A2A3A",
  "#2E1A2E",
  "#1A3A2A",
]
const DEFAULT_FG = [
  "#C87AB0",
  "#7AB0C8",
  "#7AC88A",
  "#C8B87A",
  "#C87A7A",
  "#7AB8C8",
  "#C87AC8",
  "#7AC8A8",
]

const KNOWN: Record<string, { bg: string; fg: string }> = {
  Ritvik: { bg: "#3A1A2E", fg: "#C87AB0" },
  Neha: { bg: "#1A2E3A", fg: "#7AB0C8" },
  Priya: { bg: "#1A3A1E", fg: "#7AC88A" },
  Arjun: { bg: "#2E2A1A", fg: "#C8B87A" },
  Divya: { bg: "#2E1A1A", fg: "#C87A7A" },
}

export function memberAvatarColors(name: string, memberIndex: number) {
  const k = KNOWN[name]
  if (k) return k
  const i = Math.abs(memberIndex) % DEFAULT_BG.length
  return { bg: DEFAULT_BG[i], fg: DEFAULT_FG[i] }
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}
