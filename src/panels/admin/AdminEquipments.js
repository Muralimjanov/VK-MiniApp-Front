import { Panel, PanelHeader, Header, Button, Group, Cell, Div, Avatar, SplitCol, SplitLayout, PanelHeaderBack, Placeholder } from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import PropTypes from 'prop-types';
import './../../assets/css/main.css';
import { getAllEquipments } from './../../api/Equipments.js';
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from './../../context/authContext';
import EditEquipmentForm from "./../../components/EditEquipmentForm.js";
import EditApplicationForm from "./../../components/EditApplicationForm.js";
import Table from "./../../components/AdminEquipmentTable.js";
import TableApplication from "./../../components/UserApplicationTable.js";
import Calendar from 'react-calendar';
import { getAdminEquipments, updateEquipment, deleteEquipment } from '../../api/admin.js';
import * as React from 'react';

const headCells = [
  {
    id: 'action',
    numeric: false,
    disablePadding: false,
    label: '',
  },
  {
    id: 'id',
    numeric: true,
    disablePadding: false,
    label: '№',
  },
  {
    id: 'category',
    numeric: false,
    disablePadding: false,
    label: 'Категория',
  },
  {
    id: 'name',
    numeric: false,
    disablePadding: false,
    label: 'Наименование',
  },
  {
    id: 'quantity',
    numeric: true,
    disablePadding: false,
    label: 'Количество',
  },
  {
    id: 'borrow_price',
    numeric: true,
    disablePadding: false,
    label: 'Залог (₽)',
  },
  {
    id: 'price',
    numeric: true,
    disablePadding: false,
    label: 'Прокат (₽/день)',
  },
  {
    id: 'ingredients',
    numeric: false,
    disablePadding: true,
    label: 'Состав',
  },
];

function createData(id, category, name, quantity, borrowPrice, price, ingredients) {
  var action = 'Edit';
  return {
    action, id, category, name, quantity, borrowPrice, price, ingredients,
  };
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const AdminEquipments = ({ id, fetchedUser }) => {
  const { role } = useContext(AuthContext);
  const isAdmin = role === '2' || role === 2;
  
  console.log('AdminEquipments - Role:', role, 'IsAdmin:', isAdmin);

  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dataContext = useContext(createContext(null));
  const { photo_200, city, first_name, last_name } = { ...fetchedUser };
  const routeNavigator = useRouteNavigator();
  const equipments = dataContext?.data?.equipments;
  const [valueCalendar, onChangeCalendar] = useState([]);
  const calendarRef = useRef(null);

  if (!isAdmin) {
    return (
      <Panel id={id}>
        <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
          Администрирование снаряжения
        </PanelHeader>
        <Group>
          <Placeholder
            icon={<div style={{ fontSize: '48px' }}>🔒</div>}
            header="Доступ запрещен"
            action={
              <Button 
                size="m" 
                onClick={() => routeNavigator.push('/')}
              >
                На главную
              </Button>
            }
          >
            У вас нет прав для просмотра этой страницы.
            <br />
            Текущая роль: {role}
            <br />
            Требуется роль администратора.
          </Placeholder>
        </Group>
      </Panel>
    );
  }

  const loadEquipments = async () => {
    try {
      const fetchedEquipments = await getAllEquipments();
      console.log(fetchedEquipments);

      if (!dataContext || !fetchedEquipments) {
        return;
      }

      dataContext.setData({
        ...dataContext.data,
        equipments: fetchedEquipments,
      });
    } catch (e) {
      setError(new Error(JSON.stringify(e)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (equipments) {
      setLoading(false);
      return;
    }
    loadEquipments();
  }, [equipments]);

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
        Администрирование снаряжения
      </PanelHeader>
      <Group>
        <Table equipments={equipments} onUpdate={updateEquipment} onDelete={deleteEquipment} />
      </Group>
    </Panel>
  );
};

AdminEquipments.propTypes = {
  id: PropTypes.string.isRequired,
  fetchedUser: PropTypes.shape({
    photo_200: PropTypes.string,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    city: PropTypes.shape({
      title: PropTypes.string,
    }),
  }),
};