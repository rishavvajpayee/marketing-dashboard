export const IG_PAGES = [
  "SkillinaboxHQ",
  "Skillinabox_Fashion",
  "Skillinabox_MUA",
  "Skillinabox_Pune",
  "Skillinabox_Indore",
  "Skillinabox_Patterns",
  "Skillinabox_Students",
  "HOE",
] as const

export const PAGE_DOT_COLORS = [
  "#C87AB0",
  "#7AB0C8",
  "#7AC88A",
  "#C8B87A",
  "#C87A7A",
  "#A87AC8",
  "#C8987A",
  "#7AC8C8",
] as const

export const TASK_STATUSES = [
  "To Do",
  "In Progress",
  "Done",
  "Pending",
  "Blocked",
] as const

export const TASK_PRIORITIES = ["High", "Medium", "Low"] as const

export const CONTENT_TYPES = [
  "Reel",
  "Carousel",
  "Static Post",
  "Story",
  "Brochure",
] as const

export const POST_STATUSES = ["Posted", "Scheduled", "Draft"] as const

export const NOTE_TAGS = [
  "Idea",
  "Strategy",
  "Script",
  "Reference",
  "Campaign",
] as const

export type IgPage = (typeof IG_PAGES)[number]
