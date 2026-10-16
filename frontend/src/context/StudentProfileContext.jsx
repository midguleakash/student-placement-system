
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import { studentApi } from "../services/studentApi";

const StudentProfileContext = createContext(null);

export function StudentProfileProvider({ children }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const refreshProfile = useCallback(async () => {
        setError("");

        try {
            const data = await studentApi.getMyProfile();
            setProfile(data);
            return data;
        } catch (err) {
            setError(err.message || "Unable to load student profile.");
            throw err;
        }
    }, []);


    const refreshPlacementRegistration = useCallback(async () => {
        const data = await studentApi.getPlacementRegistration();
        setProfile(data);
        return data;
    }, []);


    useEffect(() => {
        let active = true;

        async function load() {
            try {
                const data = await studentApi.getMyProfile();
                if (active) setProfile(data);
            } catch (err) {
                if (active) {
                    setError(err.message || "Unable to load profile.");
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        load();

        return () => {
            active = false;
        };
    }, []);

    const value = {
        profile,
        setProfile,
        loading,
        error,
        refreshProfile,
        refreshPlacementRegistration
    };

    return (
        <StudentProfileContext.Provider value={value}>
            {children}
        </StudentProfileContext.Provider>
    );
}

export function useStudentProfile() {
    const context = useContext(StudentProfileContext);

    if (!context) {
        throw new Error(
            "useStudentProfile must be used inside StudentProfileProvider."
        );
    }

    return context;
}
