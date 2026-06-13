import { useState, useEffect, useCallback } from "react";
import { apiGet } from "../api/client";
import type {
    User,
    TutoringGroup,
    Lesson,
    Notification,
    Enrollment,
    UserRole,
} from "../api/types";
export type AppData = {
    users: User[];
    groups: TutoringGroup[];
    lessons: Lesson[];
    notifications: Notification[];
    enrollments: Enrollment[];
    loading: boolean;
    error: string;
};
export function useData(role: UserRole | null, userId: number | null) {
    const [users, setUsers] = useState<User[]>([]);
    const [groups, setGroups] = useState<TutoringGroup[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const refresh = useCallback(async () => {
        if (!role) return;
        setLoading(true);
        setError("");
        try {
            /* ---- Common data ---- */
            const [usersData, groupsData] = await Promise.all([
                apiGet<User[]>("/api/users"),
                apiGet<TutoringGroup[]>("/api/groups"),
            ]);
            /* ---- Lessons ---- */
            const lessonsData =
                role === "ADMIN"
                    ? await apiGet<Lesson[]>("/api/lessons")
                    : userId
                        ? await apiGet<Lesson[]>(`/api/lessons/user/${userId}`)
                        : [];
            /* ---- Notifications ---- */
            const notificationsData =
                role === "ADMIN"
                    ? await apiGet<Notification[]>("/api/notifications")
                    : userId
                        ? await apiGet<Notification[]>(
                            `/api/notifications/user/${userId}`
                        )
                        : [];
            /* ---- Enrollments ---- */
            let enrollmentsData: Enrollment[] = [];
            if (role === "STUDENT" && userId) {
                enrollmentsData = await apiGet<Enrollment[]>(
                    `/api/enrollments/student/${userId}`
                );
            } else {
                // Admin & Tutor need enrollment data for group-detail view
                const students = usersData.filter((u) => u.role === "STUDENT");
                if (students.length > 0) {
                    const arrays = await Promise.all(
                        students.map((s) =>
                            apiGet<Enrollment[]>(`/api/enrollments/student/${s.id}`).catch(
                                () => [] as Enrollment[]
                            )
                        )
                    );
                    enrollmentsData = arrays.flat();
                }
            }
            setUsers(usersData);
            setGroups(groupsData);
            setLessons(lessonsData);
            setNotifications(notificationsData);
            setEnrollments(enrollmentsData);
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "Nie udało się pobrać danych"
            );
        } finally {
            setLoading(false);
        }
    }, [role, userId]);
    useEffect(() => {
        refresh();
    }, [refresh]);
    return {
        users,
        groups,
        lessons,
        notifications,
        enrollments,
        loading,
        error,
        refresh,
    };
}
