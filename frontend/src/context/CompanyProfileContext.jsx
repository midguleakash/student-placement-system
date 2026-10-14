
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import { companyApi } from "../services/companyApi";

const CompanyProfileContext = createContext(null);

export function CompanyProfileProvider({ children }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const refreshProfile = useCallback(async () => {
        setError("");

        try {
            const data = await companyApi.getMyProfile();
            setProfile(data);
            return data;
        } catch (err) {
            setError(err.message || "Unable to load company profile.");
            throw err;
        }
    }, []);

    useEffect(() => {
        refreshProfile().catch(() => {}).finally(() => {
            setLoading(false);
        });
    }, [refreshProfile]);

    return (
        <CompanyProfileContext.Provider
            value={{
                profile,
                setProfile,
                loading,
                error,
                refreshProfile,
            }}
        >
            {children}
        </CompanyProfileContext.Provider>
    );
}

export function useCompanyProfile() {
    const context = useContext(CompanyProfileContext);

    if (!context) {
        throw new Error(
            "useCompanyProfile must be used inside CompanyProfileProvider"
        );
    }

    return context;
}
