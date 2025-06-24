// import React from 'react';
// import { useAuth } from '../context/authContext';
// import { Button, Panel, PanelHeader } from '@vkontakte/vkui';

// const LoginPanel = ({ id }) => {
//     const { login } = useAuth();

//     const handleLogin = async () => {
//         try {
//             await login({
//                 vk_user_id: '123456789',
//                 sign: 'your_signature',
//                 is_group_creator: true,
//                 bypass_signature: true,
//             });
//         } catch (e) {
//             alert('Ошибка входа: ' + (e?.response?.data?.message || e.message));
//         }
//     };

//     return (
//         <Panel id={id}>
//             <PanelHeader>Авторизация</PanelHeader>
//             <Button size="l" stretched onClick={handleLogin}>
//                 Войти через VK
//             </Button>
//         </Panel>
//     );
// };

// export default LoginPanel;

import React, { useState } from 'react';
import { useAuth } from '../context/authContext';
import { Button, Panel, PanelHeader, Input } from '@vkontakte/vkui';

const LoginPanel = ({ id }) => {
    const { login } = useAuth();

    const [vkUserId, setVkUserId] = useState('');
    const [sign, setSign] = useState('your_signature');
    const [isGroupCreator, setIsGroupCreator] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!vkUserId.trim()) {
            alert('Введите vk_user_id');
            return;
        }

        setLoading(true);

        try {
            await login({
                vk_user_id: vkUserId,
                sign,
                is_group_creator: isGroupCreator,
                bypass_signature: true,
            });
        } catch (e) {
            alert('Ошибка входа: ' + (e?.response?.data?.message || e.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Panel id={id}>
            <PanelHeader>Авторизация</PanelHeader>
            <div style={{ padding: '16px' }}>
                <Input
                    type="text"
                    value={vkUserId}
                    onChange={(e) => setVkUserId(e.target.value)}
                    placeholder="VK User ID"
                    autoComplete="off"
                    style={{ marginBottom: 12 }}
                />
                {/* Если хотите, добавьте поле для sign и переключатель для isGroupCreator */}
                {/* <Input
                    type="text"
                    value={sign}
                    onChange={(e) => setSign(e.target.value)}
                    placeholder="Sign"
                    style={{ marginBottom: 12 }}
                /> */}
                {/* <Checkbox
                    checked={isGroupCreator}
                    onChange={() => setIsGroupCreator(!isGroupCreator)}
                    label="Групповой администратор"
                    style={{ marginBottom: 12 }}
                /> */}
                <Button size="l" stretched onClick={handleLogin} disabled={loading}>
                    {loading ? 'Вход...' : 'Войти через VK'}
                </Button>
            </div>
        </Panel>
    );
};

export default LoginPanel;
