import { useAuth } from '../context/authContext';
import { Button } from '@vkontakte/vkui';

const LogoutButton = () => {
    const { logout } = useAuth();

    return (
        <Button mode="destructive" onClick={logout}>
            Выйти из аккаунта
        </Button>
    );
};

export default LogoutButton;
