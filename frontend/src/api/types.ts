export type UserRole = "ADMIN" | "TUTOR" | "STUDENT";
export type LessonStatus = "PLANNED" | "CANCELLED" | "COMPLETED";
export type EnrollmentStatus = "ACTIVE" | "CANCELLED";
export type NotificationStatus = "UNREAD" | "READ";

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: UserRole;
};

export type TutoringGroup = {
  id: number;
  name: string;
  subject: string;
  level: string;
  capacity: number;
  tutor: User | null;
  freePlaces: boolean;
  activeEnrollmentCount: number;
};

export type Enrollment = {
  id: number;
  student: User;
  group: TutoringGroup;
  status: EnrollmentStatus;
  enrolledAt: string;
};

export type Lesson = {
  id: number;
  group: TutoringGroup;
  date: string;
  startTime: string;
  endTime: string;
  status: LessonStatus;
};

export type Notification = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  status: NotificationStatus;
};

export type DashboardData = {
  users: User[];
  groups: TutoringGroup[];
  lessons: Lesson[];
  notifications: Notification[];
};

export type LessonRow = {
  id: number;
  startAt: string;
  endAt: string;
  groupName: string;
  subject: string;
  tutorName: string;
  room: string;
  status: string;
};

export type NotificationRow = {
  id: number;
  title: string;
  body: string;
  severity: string;
  createdAt: string;
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
  status: string;
};

export type TutorRow = {
  id: number;
  name: string;
  email: string;
  subjects: string;
  groupsCount: number;
  availability: string;
  status: string;
};

export type DashboardResponse = {
  kpis: { activeStudents: number; tutors: number; groupCount: number; classesThisWeek: number };
  todaysLessons: LessonRow[];
  notifications: NotificationRow[];
};
