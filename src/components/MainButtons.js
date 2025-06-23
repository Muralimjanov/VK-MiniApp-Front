import * as React from 'react';
import Button from '@mui/joy/Button';
import ButtonGroup from '@mui/joy/ButtonGroup';
import IconButton from '@mui/joy/IconButton';
import Settings from '@mui/icons-material/Settings';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import {DEFAULT_VIEW_PANELS} from "../routes.js";

export default function RadiusButtonGroup() {
    const routeNavigator = useRouteNavigator();

    return (
        <ButtonGroup
            aria-label="radius button group"
            sx={{ '--ButtonGroup-radius': '40px' }}
        >
            <Button onClick={() => routeNavigator.push('/' + DEFAULT_VIEW_PANELS.USER_EQUIPMENTS)}>Заявки</Button>
            <Button onClick={() => routeNavigator.push('/' + DEFAULT_VIEW_PANELS.USER_EQUIPMENTS2)}>Список снаряжения</Button>
            <Button onClick={() => routeNavigator.push('/' + DEFAULT_VIEW_PANELS.ADMIN_EQUIPMENTS)}>Администрирование снаряжения</Button>
            <Button onClick={() => routeNavigator.push('/' + DEFAULT_VIEW_PANELS.ADMIN_APPLICATIONS)}>Администрирование заявок</Button>
            <Button onClick={() => routeNavigator.push('/' + DEFAULT_VIEW_PANELS.ADMIN_USERS)}>Администрирование пользователей</Button>
        </ButtonGroup>
    );
}