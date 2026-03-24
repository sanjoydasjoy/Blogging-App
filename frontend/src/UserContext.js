import { createContext, useState, useEffect } from "react";
import { apiRequest } from './lib/api';

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let ignore = false;

        async function hydrateUser() {
            try {
                const userData = await apiRequest('/profile');
                if (!ignore) {
                    setUserInfo(userData);
                }
            } catch {
                if (!ignore) {
                    setUserInfo(null);
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        hydrateUser();

        return () => {
            ignore = true;
        };
    }, []);

    return (
        <UserContext.Provider value={{ userInfo, setUserInfo, loading }}>
            {!loading && children}
        </UserContext.Provider>
    );
}
