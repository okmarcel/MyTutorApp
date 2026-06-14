import { useMemo, useState } from "react";
import { useData } from "./hooks/useData";
import type { UserRole, View, ModalState } from "./api/types";
/* ---- Layout ---- */
import { Sidebar, MobileNav } from "./components/Sidebar";
/* ---- Pages ---- */
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SchedulePage } from "./pages/SchedulePage";
import { GroupsPage } from "./pages/GroupsPage";
import { GroupDetailPage } from "./pages/GroupDetailPage";
import { StudentsPage } from "./pages/StudentsPage";
import { TutorsPage } from "./pages/TutorsPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { EnrollPage } from "./pages/EnrollPage";
import { HistoryPage } from "./pages/HistoryPage";
/* ---- Modals ---- */
import { AddLessonModal } from "./components/modals/AddLessonModal";
import { AddUserModal } from "./components/modals/AddUserModal";
import { EditUserModal } from "./components/modals/EditUserModal";
import { GroupFormModal } from "./components/modals/GroupFormModal";
import { LessonDetailModal } from "./components/modals/LessonDetailModal";
export default function App() {
    /* ---- Auth state ---- */
    const [auth, setAuth] = useState<{
        role: UserRole;
        userId: number;
        username: string;
    } | null>(null);
    /* ---- Navigation ---- */
    const [view, setView] = useState<View>("dashboard");
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
    /* ---- Modal ---- */
    const [modal, setModal] = useState<ModalState>(null);
    /* ---- Data ---- */
    const data = useData(auth?.role ?? null, auth?.userId ?? null);
    /* ---- Derived ---- */
    const unread = useMemo(
        () => data.notifications.filter((n) => n.status === "UNREAD").length,
        [data.notifications]
    );
    // For tutor: filter to own groups
    const visibleGroups = useMemo(() => {
        if (!auth) return data.groups;
        if (auth.role === "TUTOR") {
            return data.groups.filter((g) => g.tutor?.id === auth.userId);
        }
        return data.groups;
    }, [data.groups, auth]);
    // For tutor: filter students to those in their groups
    const visibleUsers = useMemo(() => {
        if (!auth || auth.role !== "TUTOR") return data.users;
        const tutorGroupIds = new Set(visibleGroups.map((g) => g.id));
        const studentIdsInGroups = new Set(
            data.enrollments
                .filter(
                    (e) => e.status === "ACTIVE" && tutorGroupIds.has(e.group.id)
                )
                .map((e) => e.student.id)
        );
        return data.users.filter(
            (u) => u.role !== "STUDENT" || studentIdsInGroups.has(u.id)
        );
    }, [data.users, data.enrollments, auth, visibleGroups]);
    /* ---- Handlers ---- */
    function handleLogin(role: UserRole, userId: number, username: string) {
        setAuth({ role, userId, username });
        setView("dashboard");
    }
    function handleLogout() {
        setAuth(null);
        setView("dashboard");
        setModal(null);
    }
    function handleNavigate(v: View, groupId?: number) {
        setView(v);
        if (v === "group-detail" && groupId != null) {
            setSelectedGroupId(groupId);
        }
    }
    function handleModalDone() {
        setModal(null);
        data.refresh();
    }
    /* ---- Login screen ---- */
    if (!auth) return <LoginPage onLogin={handleLogin} />;
    const { role, userId, username } = auth;
    /* ---- Resolve which page to show ---- */
    let content: React.ReactNode;
    switch (view) {
        case "dashboard":
            content = (
                <DashboardPage
                    role={role}
                    users={visibleUsers}
                    groups={visibleGroups}
                    lessons={data.lessons}
                    unread={unread}
                    onNavigate={handleNavigate}
                    onOpenModal={setModal}
                />
            );
            break;
        case "schedule":
            content = (
                <SchedulePage
                    lessons={data.lessons}
                    role={role}
                    onOpenModal={setModal}
                />
            );
            break;
        case "groups":
            content = (
                <GroupsPage
                    groups={visibleGroups}
                    onOpenModal={setModal}
                    onNavigate={handleNavigate}
                />
            );
            break;
        case "group-detail": {
            const group = data.groups.find((g) => g.id === selectedGroupId);
            if (group) {
                content = (
                    <GroupDetailPage
                        group={group}
                        enrollments={data.enrollments}
                        onOpenModal={setModal}
                        onNavigate={handleNavigate}
                        onRefresh={data.refresh}
                    />
                );
            } else {
                content = (
                    <div className="empty-state">
                        Grupa nie znaleziona.{" "}
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setView("groups")}
                        >
                            Powrót
                        </button>
                    </div>
                );
            }
            break;
        }
        case "students":
            content = (
                <StudentsPage users={visibleUsers} onOpenModal={setModal} />
            );
            break;
        case "tutors":
            content = (
                <TutorsPage
                    users={data.users}
                    groups={data.groups}
                    onOpenModal={setModal}
                />
            );
            break;
        case "notifications":
            content = (
                <NotificationsPage
                    notifications={data.notifications}
                    userId={userId}
                    onRefresh={data.refresh}
                />
            );
            break;
        case "enroll":
            content = (
                <EnrollPage
                    groups={data.groups}
                    enrollments={data.enrollments}
                    userId={userId}
                    onOpenModal={setModal}
                    onRefresh={data.refresh}
                />
            );
            break;
        case "history":
            content = (
                <HistoryPage
                    lessons={data.lessons}
                    enrollments={data.enrollments}
                    userId={userId}
                    onOpenModal={setModal}
                    onRefresh={data.refresh}
                />
            );
            break;
        default:
            content = <div>Nieznany widok</div>;
    }
    /* ---- Modal rendering ---- */
    let modalEl: React.ReactNode = null;
    if (modal) {
        switch (modal.type) {
            case "add-lesson":
                modalEl = (
                    <AddLessonModal
                        groups={role === "TUTOR" ? visibleGroups : data.groups}
                        onClose={() => setModal(null)}
                        onDone={handleModalDone}
                    />
                );
                break;
            case "add-student":
                modalEl = (
                    <AddUserModal
                        userRole="STUDENT"
                        onClose={() => setModal(null)}
                        onDone={handleModalDone}
                    />
                );
                break;
            case "add-tutor":
                modalEl = (
                    <AddUserModal
                        userRole="TUTOR"
                        onClose={() => setModal(null)}
                        onDone={handleModalDone}
                    />
                );
                break;
            case "edit-user":
                modalEl = (
                    <EditUserModal
                        user={modal.user}
                        onClose={() => setModal(null)}
                        onDone={handleModalDone}
                    />
                );
                break;
            case "create-group":
                modalEl = (
                    <GroupFormModal
                        mode="create"
                        tutors={data.users.filter((u) => u.role === "TUTOR")}
                        students={data.users.filter((u) => u.role === "STUDENT")}
                        enrolledStudentIds={[]}
                        currentRole={role}
                        currentUserId={userId}
                        onClose={() => setModal(null)}
                        onDone={handleModalDone}
                    />
                );
                break;
            case "edit-group":
                modalEl = (
                    <GroupFormModal
                        mode="edit"
                        group={modal.group}
                        tutors={data.users.filter((u) => u.role === "TUTOR")}
                        students={data.users.filter((u) => u.role === "STUDENT")}
                        enrolledStudentIds={data.enrollments
                            .filter(
                                (e) =>
                                    e.group.id === modal.group.id && e.status === "ACTIVE"
                            )
                            .map((e) => e.student.id)}
                        currentRole={role}
                        currentUserId={userId}
                        onClose={() => setModal(null)}
                        onDone={() => {
                            handleModalDone();
                            // If we deleted the group, go back to groups list
                            setView("groups");
                        }}
                    />
                );
                break;
            case "lesson-detail":
                modalEl = (
                    <LessonDetailModal
                        lesson={modal.lesson}
                        role={role}
                        userId={userId}
                        isEnrolled={data.enrollments.some(
                            (e) =>
                                e.group.id === modal.lesson.group.id &&
                                e.student.id === userId &&
                                e.status === "ACTIVE"
                        )}
                        onClose={() => setModal(null)}
                        onDone={handleModalDone}
                    />
                );
                break;
            case "enroll-group":
                // Handled inline in EnrollPage
                break;
        }
    }
    return (
        <div className="app">
            <Sidebar
                role={role}
                username={username}
                view={view}
                setView={handleNavigate}
                unread={unread}
                onLogout={handleLogout}
            />
            <div>
                <MobileNav role={role} view={view} setView={handleNavigate} />
                <main className="main">
                    {data.error && <div className="error-banner">{data.error}</div>}
                    {data.loading ? (
                        <div className="loading-text">Ładowanie danych...</div>
                    ) : (
                        content
                    )}
                </main>
            </div>
            {modalEl}
        </div>
    );
}
