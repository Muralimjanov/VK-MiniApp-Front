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
        localStorage.setItem('vk_user_id', user.id_vk);
        setToken(token);
        const roleStr = String(user.id_rol);
        setRole(roleStr);
        console.log('Установленная роль в saveAuthData:', roleStr); // Лог
        setUser(user);
        setIsAuthenticated(true);
    
        instance.defaults.headers.Authorization = `Bearer ${token}`;
        instance.defaults.headers['x-vk-user-id'] = user.id_vk;
    };
    
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedRole = localStorage.getItem('role');
        const storedVkId = localStorage.getItem('vk_user_id');
    
        console.log('Загруженная роль из localStorage:', storedRole); // Лог
    
        if (storedToken && storedRole && storedVkId) {
            setToken(storedToken);
            setRole(storedRole);
            setIsAuthenticated(true);
            instance.defaults.headers.Authorization = `Bearer ${storedToken}`;
            instance.defaults.headers['x-vk-user-id'] = storedVkId;
        }
    
        setLoading(false);
    }, []);

    const login = async (vkPayload) => {
        setLoading(true);
        try {
            const response = await instance.post('/api/auth/vk-login', vkPayload);
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
        const storedVkId = localStorage.getItem('vk_user_id');

        if (storedToken && storedRole && storedVkId) {
            setToken(storedToken);
            setRole(storedRole);
            setIsAuthenticated(true);
            instance.defaults.headers.Authorization = `Bearer ${storedToken}`;
            instance.defaults.headers['x-vk-user-id'] = storedVkId;
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
