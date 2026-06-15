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

export type UserRequest = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  role: UserRole;
};
export type GroupRequest = {
  name: string;
  level: string;
  subject: string;
  capacity: number;
  tutorId: number | null;
};
export type LessonRequest = {
  groupId: number;
  date: string;
  startTime: string;
  endTime: string;
};

export type View =
    | "dashboard" | "schedule" | "groups" | "group-detail"
    | "students" | "tutors" | "notifications" | "enroll" | "history";
export type ModalState =
    | { type: "add-lesson" }
    | { type: "add-student" }
    | { type: "add-tutor" }
    | { type: "edit-user"; user: User }
    | { type: "create-group" }
    | { type: "edit-group"; group: TutoringGroup }
    | { type: "lesson-detail"; lesson: Lesson }
    | { type: "enroll-group"; group: TutoringGroup }
    | null;
