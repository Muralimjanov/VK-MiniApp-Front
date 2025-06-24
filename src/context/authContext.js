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
        console.log('Установленная роль в saveAuthData:', roleStr, typeof roleStr);
        setUser(user);
        setIsAuthenticated(true);
    
        instance.defaults.headers.Authorization = `Bearer ${token}`;
        instance.defaults.headers['x-vk-user-id'] = user.id_vk;
    };
    
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedRole = localStorage.getItem('role');
            const storedVkId = localStorage.getItem('vk_user_id');
        
            console.log('Загруженная роль из localStorage:', storedRole, typeof storedRole);
        
            if (storedToken && storedRole && storedVkId) {
                const roleStr = String(storedRole);
                setToken(storedToken);
                setRole(roleStr);
                setIsAuthenticated(true);
                
                console.log('Роль установлена из localStorage:', roleStr);
                
                instance.defaults.headers.Authorization = `Bearer ${storedToken}`;
                instance.defaults.headers['x-vk-user-id'] = storedVkId;
            } else {
                console.log('Данные авторизации не найдены в localStorage');
            }
        
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (vkPayload) => {
        setLoading(true);
        try {
            const response = await instance.post('/api/auth/vk-login', vkPayload);
            const { token, user } = response;
    
            console.log('Ответ сервера:', response);
            console.log('Пользователь:', user);
    
            if (!user || !user.id_rol) {
                throw new Error('Роль пользователя не определена');
            }
    
            saveAuthData(token, user);
        } catch (error) {
            console.error('Ошибка авторизации:', error);
            logout();
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('vk_user_id');
        setUser(null);
        setRole(null);
        setToken(null);
        setIsAuthenticated(false);
        delete instance.defaults.headers.Authorization;
        delete instance.defaults.headers['x-vk-user-id'];
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