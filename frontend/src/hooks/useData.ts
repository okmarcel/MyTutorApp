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
            let usersData: User[] = [];
            let groupsData: TutoringGroup[] = [];

            if (role === "ADMIN") {
                [usersData, groupsData] = await Promise.all([
                    apiGet<User[]>("/api/users"),
                    apiGet<TutoringGroup[]>("/api/groups"),
                ]);
            } else if (role === "TUTOR" && userId) {
                [usersData, groupsData] = await Promise.all([
                    apiGet<User[]>("/api/users/students"),
                    apiGet<TutoringGroup[]>(`/api/groups/tutor/${userId}`),
                ]);
            } else {
                groupsData = await apiGet<TutoringGroup[]>("/api/groups");
            }

            const lessonsData =
                role === "ADMIN"
                    ? await apiGet<Lesson[]>("/api/lessons")
                    : userId
                        ? await apiGet<Lesson[]>(`/api/lessons/user/${userId}`)
                        : [];

            const notificationsData = userId
                ? await apiGet<Notification[]>(
                    `/api/notifications/user/${userId}`
                )
                : [];

            let enrollmentsData: Enrollment[] = [];
            if (role === "STUDENT" && userId) {
                enrollmentsData = await apiGet<Enrollment[]>(
                    `/api/enrollments/student/${userId}`
                );
            } else if (role === "ADMIN") {
                enrollmentsData = await apiGet<Enrollment[]>("/api/enrollments");
            } else {
                if (groupsData.length > 0) {
                    const arrays = await Promise.all(
                        groupsData.map((group) =>
                            apiGet<Enrollment[]>(`/api/enrollments/group/${group.id}`).catch(
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
