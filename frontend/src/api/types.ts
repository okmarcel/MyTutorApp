export type DashboardKpis = {
  activeStudents: number;
  tutors: number;
  groupCount: number;
  classesThisWeek: number;
};

export type LessonRow = {
  id: number;
  startAt: string; // ISO
  endAt: string; // ISO
  groupName: string;
  subject: string;
  tutorName: string;
  room: string;
  status: "on_time" | "needs_attention" | "planned" | string;
};

export type NotificationRow = {
  id: number;
  title: string;
  body: string;
  severity: "high" | "normal" | string;
  createdAt: string; // ISO
};

export type DashboardResponse = {
  kpis: DashboardKpis;
  todaysLessons: LessonRow[];
  notifications: NotificationRow[];
};

export type GroupRow = {
  id: number;
  name: string;
  subject: string;
  level: string;
  studentsCount: number;
  primaryTutor: string;
  scheduleHint: string;
};

export type StudentRow = {
  id: number;
  name: string;
  email: string;
  grade: string;
  activeGroups: number;
  guardian: string;
  status: string; // active, on_hold, ...
};

export type TutorRow = {
  id: number;
  name: string;
  email: string;
  subjects: string; // comma-separated
  groupsCount: number;
  availability: string;
  status: string; // active, onboarding, ...
};

