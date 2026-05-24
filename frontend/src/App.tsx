import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/shell/AppShell";
import { DashboardPage } from "@/pages/DashboardPage";
import { SchedulePage } from "@/pages/SchedulePage";
import { GroupsPage } from "@/pages/GroupsPage";
import { StudentsPage } from "@/pages/StudentsPage";
import { TutorsPage } from "@/pages/TutorsPage";
import { NotificationsPage } from "@/pages/NotificationsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/tutors" element={<TutorsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

