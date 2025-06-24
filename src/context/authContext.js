import React, { createContext, useState, useEffect, useContext } from 'react';
import { instance } from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null); 
    const [token, setToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const saveAuthData = (token, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('role', user.id_rol);
        setToken(token);
        setRole(String(user.id_rol));
        setUser(user);
        setIsAuthenticated(true);

        instance.defaults.headers.Authorization = `Bearer ${token}`;
    };

    const login = async (vkPayload) => {
        setLoading(true);
        try {
            const response = await instance.post('/auth/vk-login', vkPayload);
            const { token, user } = response;

            if (!user || !user.id_rol) {
                throw new Error('Роль пользователя не определена');
            }

            saveAuthData(token, user);
        } catch (error) {
            logout();
            throw error;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedRole = localStorage.getItem('role');

        if (storedToken && storedRole) {
            setToken(storedToken);
            setRole(storedRole);
            setIsAuthenticated(true);
            instance.defaults.headers.Authorization = `Bearer ${storedToken}`;
        }
        setLoading(false);
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setUser(null);
        setRole(null);
        setToken(null);
        setIsAuthenticated(false);
        delete instance.defaults.headers.Authorization;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                role,
                token,
                login,
                logout,
                isAuthenticated,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export { AuthContext };
