import { Panel, PanelHeader, Header, Button, Group, Cell, Div, Avatar } from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import PropTypes from 'prop-types';
import './../assets/css/main.css';
import {getAllEquipments} from './../api/Equipments.js';
import {createContext, useContext, useEffect, useState} from "react";
import Table from "./../components/Table.js";
import EditEquipmentForm from "./../components/EditEquipmentForm.js";


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

const rows = [
  createData(1, 'Горное', 'Шнур 16-пряный 6мм', 2, 6.00, 0.00, ''),
  createData(2, 'Общее', 'Палатка "Байкал-4"', 2, 4700, 100.00, 'Чехол палатки, чехол колышков, чехол дуг, дуга длинная 2шт...'),
];

export const Equipments = ({ id, fetchedUser }) => {
  // return (
  //     <label>testsdf</label>
  // );
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dataContext = useContext(createContext(null));
  const { photo_200, city, first_name, last_name } = { ...fetchedUser };
  const routeNavigator = useRouteNavigator();
  const equipments = dataContext?.data?.equipments;

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
    // if (!profile || orderInProgress === undefined) {
    //   return;
    // }
    loadEquipments();
  }, [equipments]);

  return (
    <Panel id={id}>
      <PanelHeader>Снаряжение</PanelHeader>
      <Group>
        <Table headCells={headCells} rows={JSON.stringify(rows)}/>
      </Group>
      <Group header={<Header size="s">Добавить снаряжение</Header>}>
        <EditEquipmentForm></EditEquipmentForm>
      </Group>

      {fetchedUser && (
        <Group header={<Header size="s">User Data Fetched with VK Bridge</Header>}>
          <Cell before={photo_200 && <Avatar src={photo_200} />} subtitle={city?.title}>
            {`${first_name} ${last_name}`}
          </Cell>
        </Group>
      )}

      <Group header={<Header size="s">Navigation Example2</Header>}>
        <Div>
          <Button stretched size="l" mode="secondary" onClick={() => routeNavigator.push('persik')}>
            Покажите Персика, пожалуйста!
          </Button>
        </Div>
      </Group>
    </Panel>
  );
};

Equipments.propTypes = {
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
