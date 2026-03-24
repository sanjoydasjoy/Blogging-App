import { createContext, useState, useEffect } from "react";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/profile`, {
            credentials: 'include',
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Not authenticated');
        })
        .then(userInfo => {
            setUserInfo(userInfo);
        })
        .catch(() => {
            setUserInfo(null);
        })
        .finally(() => {
            setLoading(false);
        });
    }, []);

    return (
        <UserContext.Provider value={{ userInfo, setUserInfo, loading }}>
            {!loading && children}
        </UserContext.Provider>
    );
}
