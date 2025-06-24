import { useEffect, useContext } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { AuthContext } from '../context/authContext';

export const useVKAuth = () => {
    const { login } = useContext(AuthContext);

    useEffect(() => {
        const authorizeFromVK = async () => {
            try {
                const params = await bridge.send('VKWebAppGetLaunchParams');

                const {
                    vk_user_id,
                    sign,
                    is_app_user,
                    is_group_admin,
                    is_group_creator,
                } = params;

                if (!vk_user_id || !sign) {
                    throw new Error('VK параметры не получены');
                }

                await login({
                    vk_user_id,
                    sign,
                    is_group_creator: is_group_creator || is_group_admin || false,
                    bypass_signature: false
                });
            } catch (error) {
                console.error('Ошибка VK авторизации:', error);
            }
        };

        authorizeFromVK();
    }, [login]);
};
