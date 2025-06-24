import { Panel, PanelHeader, Header, Button, Group, Cell, Div, Avatar, SplitCol, SplitLayout, PanelHeaderBack, Alert, ModalRoot, ModalPage, ModalPageHeader, PanelHeaderButton, Separator } from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import PropTypes from 'prop-types';
import { getAllEquipments } from '../../api/Equipments.js';
import { createContext, useContext, useEffect, useState, useRef } from "react";
import EditEquipmentForm from "./../../components/EditEquipmentForm.js";
import EditApplicationForm from "./../../components/EditApplicationForm.js";
import Table from "./../../components/UserEquipmentTable.js";
import TableApplication from "./../../components/UserApplicationTable.js";
import Calendar from 'react-calendar';
import './../../assets/css/main.css';
import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ruRU } from '@mui/x-data-grid/locales';
import { getRecentRequests, createRequest, updateRequest, deleteRequest } from '../../api/requests.js';
import { randomId } from '@mui/x-data-grid-generator';
import { Icon24Done, Icon24Cancel, Icon24Info } from '@vkontakte/icons';
import {DataContext} from "../../context/dataContext.js"
import { useAuth } from '../../context/authContext.js';

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

export const UserEquipments = ({ id, fetchedUser }) => {
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dataContext = useContext(DataContext);
  const { photo_200, city, first_name, last_name } = { ...fetchedUser };
  const routeNavigator = useRouteNavigator();
  const equipments = dataContext?.data?.equipments;
  const [valueCalendar, onChangeCalendar] = useState([]);
  const calendarRef = useRef(null);
  const [requests, setRequests] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '', show: false });
  const [activeModal, setActiveModal] = useState(null);
  const [requestBeingSent, setRequestBeingSent] = useState(false);
  const [lastSentRequest, setLastSentRequest] = useState(null);
  const { user, isAuthenticated } = useAuth();


  const showNotification = (message, type = 'info') => {
    setNotification({ message, type, show: true });
    setTimeout(() => setNotification({ message: '', type: '', show: false }), 4000);
  };

  const loadRequests = async () => {
    try {
      console.log('Загружаем заявки с сервера...');
      const response = await getRecentRequests();
      const fetchedRequests = response.data || response;
      console.log('Полученные заявки:', fetchedRequests);

      if (Array.isArray(fetchedRequests)) {
        const formattedRequests = fetchedRequests.map(request => ({
          id: request.id_zajav,
          created_at: request.datas,
          status: getStatusById(request.id_status),
          total_cost: request.summ,
          start_date: request.datas,
          end_date: request.datapo,
          items: transformServerItemsToLocal(request),
          original: request
        }));

        const sortedRequests = formattedRequests.sort((a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
        );

        setRequests(sortedRequests);
      } else {
        console.error('Некорректный формат данных заявок:', fetchedRequests);
        setRequests([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error);
      showNotification('Ошибка загрузки заявок с сервера', 'error');
      setRequests([]);
    }
  };

  const getStatusById = (statusId) => {
    switch (statusId) {
      case 1:
        return 'на рассмотрении';
      case 2:
        return 'одобрено';
      case 3:
        return 'отклонено';
      default:
        return 'неизвестен';
    }
  };

  useEffect(() => {
    console.log('Компонент загружен, загружаем заявки...');
    loadRequests();
  }, []);

  const loadEquipments = async () => {
    try {
      const fetchedEquipments = await getAllEquipments();
      console.log('Загружено оборудование:', fetchedEquipments);

      if (!dataContext || !fetchedEquipments) {
        return;
      }

      dataContext.setData({
        ...dataContext.data,
        equipments: fetchedEquipments,
      });
    } catch (e) {
      console.error('Ошибка загрузки оборудования:', e);
      setError(new Error(JSON.stringify(e)));
      showNotification('Ошибка загрузки каталога оборудования', 'error');
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

  useEffect(() => {
    if (equipments && calendarRef.current) {
      const element = calendarRef.current;
      equipments.forEach(equip => {
        const diff = equip.quantity - (equip.issued || 0);
        const date = new Date(valueCalendar);
        const childElement = element.querySelector(`[aria-label="${date.toLocaleDateString('ru-RU', { month: 'long', day: 'numeric', year: 'numeric' })}"]`);
        if (childElement) {
          if (diff <= 0 && equip.status === 'на рассмотрении') {
            childElement.style.backgroundColor = 'yellow';
          } else if (diff <= 0 && ['предварительно оплачен', 'оплачен'].includes(equip.status)) {
            childElement.style.backgroundColor = 'red';
          } else {
            childElement.style.backgroundColor = 'white';
          }
        }
      });
    }
  }, [equipments, valueCalendar]);

  const handleAddToCart = (item) => {
    console.log('Добавляем товар в корзину:', item);

    const existingItemIndex = selectedItems.findIndex(
      selectedItem => selectedItem.originalId === item.id_vid || selectedItem.originalId === item.id
    );

    if (existingItemIndex !== -1) {
      setSelectedItems(prevItems =>
        prevItems.map((selectedItem, index) =>
          index === existingItemIndex
            ? { ...selectedItem, kolich: selectedItem.kolich + 1 }
            : selectedItem
        )
      );
      showNotification(`Количество "${item.vnaim}" увеличено`, 'success');
    } else {
      const newItem = {
        id: randomId(),
        originalId: item.id_vid || item.id,
        vnaim: item.vnaim,
        kolich: 1,
        zenaz: parseFloat(item.zenaz) || 0,
        zenapr: parseFloat(item.zenapr) || 0,
        sost: item.sost || '',
        tnaim: item.tnaim,
      };
      setSelectedItems(prevItems => [...prevItems, newItem]);
      showNotification(`"${item.vnaim}" добавлен в заявку`, 'success');
    }
  };


  const handleCreateRequest = async () => {
    if (selectedItems.length === 0) {
      showNotification('Выберите товары для заявки', 'error');
      return;
    }

    setRequestBeingSent(true);

    try {
      console.log('Создаем заявку с товарами:', selectedItems);

      if (!user || !isAuthenticated) {
        console.error('Пользователь не аутентифицирован:', { user, isAuthenticated });
        showNotification('Пожалуйста, выполните вход для создания заявки', 'error');
        return;
      }
      const userId = user.id_user || user.id_vk;

      if (!userId) {
        console.error('Данные пользователя:', user);
        throw new Error('ID пользователя не найден');
      }

      const totalSum = calculateTotalCost();

      const startDate = valueCalendar && valueCalendar[0]
        ? new Date(valueCalendar[0]).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      const endDate = valueCalendar && valueCalendar[1]
        ? new Date(valueCalendar[1]).toISOString().split('T')[0]
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const requestData = {
        id_user: userId,
        datas: startDate,
        datapo: endDate,
        summ: totalSum,
        id_status: 1,
        id_vid: selectedItems[0]?.originalId || null
      };

      console.log('Отправляем данные на сервер:', requestData);

      const response = await createRequest(requestData);
      console.log('Ответ сервера при создании заявки:', response);

      setLastSentRequest({
        id: response.data?.id_zajav || response.id_zajav,
        items: [...selectedItems],
        total_cost: totalSum,
        created_at: new Date().toISOString(),
        status: 'на рассмотрении'
      });

      await loadRequests();

      setSelectedItems([]);
      setActiveModal('request-sent');

      showNotification('Заявка успешно создана!', 'success');

    } catch (error) {
      console.error('Ошибка создания заявки:', error);

      let errorMessage = 'Неизвестная ошибка';

      if (error.response) {
        console.error('Данные ошибки:', error.response.data);
        console.error('Статус ошибки:', error.response.status);

        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 400) {
          errorMessage = 'Некорректные данные заявки';
        } else if (error.response.status === 401) {
          errorMessage = 'Пользователь не авторизован';
        } else {
          errorMessage = `Ошибка сервера: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'Нет ответа от сервера';
        console.error('Детали запроса:', error.request);
      } else {
        errorMessage = error.message || 'Ошибка настройки запроса';
      }

      showNotification(`Ошибка при создании заявки: ${errorMessage}`, 'error');
      console.error('Полная ошибка:', error);

    } finally {
      setRequestBeingSent(false);
    }
};

  const handleUpdateRequestItem = async (requestId, updatedItem) => {
    try {
      console.log('Обновляем заявку:', requestId, updatedItem);


      const originalRequest = requests.find(req => req.id === requestId)?.original;
      if (!originalRequest) {
        throw new Error('Оригинальная заявка не найдена');
      }

      const updateData = {
        id_user: originalRequest.id_user,
        datas: originalRequest.datas,
        datapo: originalRequest.datapo,
        summ: updatedItem.zenapr * updatedItem.kolich,
        id_status: originalRequest.id_status,
        id_vid: updatedItem.originalId
      };

      const response = await updateRequest(requestId, updateData);
      console.log('Ответ сервера при обновлении:', response);

      await loadRequests();
      showNotification('Заявка обновлена', 'success');

    } catch (error) {
      console.error('Ошибка обновления заявки:', error);
      showNotification(`Ошибка при обновлении заявки: ${error.message || 'Неизвестная ошибка'}`, 'error');
    }
  };

  const handleDeleteRequest = async (requestId) => {
    try {
      console.log('Удаляем заявку:', requestId);

      const response = await deleteRequest(requestId);
      console.log('Ответ сервера при удалении:', response);

      await loadRequests();
      showNotification('Заявка удалена', 'info');

    } catch (error) {
      console.error('Ошибка удаления заявки:', error);
      showNotification(`Ошибка при удалении заявки: ${error.message || 'Неизвестная ошибка'}`, 'error');
    }
  };

  const calculateTotalCost = () => {
    return selectedItems.reduce((total, item) => {
      const deposit = (item.zenaz || 0) * (item.kolich || 0);
      const rental = (item.zenapr || 0) * (item.kolich || 0);
      return total + deposit + rental;
    }, 0);
  };

  const handleUpdateLocalItem = (updatedItem) => {
    console.log('Обновляем локальный элемент:', updatedItem);
    setSelectedItems(prevItems =>
      prevItems.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      )
    );
  };

  const handleDeleteLocalItem = (itemId) => {
    const deletedItem = selectedItems.find(item => item.id === itemId);
    setSelectedItems(prevItems => prevItems.filter(item => item.id !== itemId));

    if (deletedItem) {
      showNotification(`"${deletedItem.vnaim}" удален из заявки`, 'info');
    }
  };

  const transformServerItemsToLocal = (serverRequest) => {
    console.log('Преобразуем данные с сервера:', serverRequest);
    
    if (!serverRequest) {
      return [];
    }
    
    return [{
      id: serverRequest.id_zajav || randomId(),
      originalId: serverRequest.id_vid,
      vnaim: serverRequest.vnaim || 'Товар без названия',
      kolich: 1, 
      zenaz: 0,
      zenapr: serverRequest.summ || 0,
      sost: '',
      tnaim: '' 
    }];
  };

  const getRequestStatusWithIcon = (status) => {
    switch (status) {
      case 'на рассмотрении':
        return { text: 'На рассмотрении', icon: <Icon24Info />, color: '#FFA500' };
      case 'одобрено':
        return { text: 'Одобрено', icon: <Icon24Done />, color: '#4CAF50' };
      case 'отклонено':
        return { text: 'Отклонено', icon: <Icon24Cancel />, color: '#F44336' };
      default:
        return { text: status || 'Неизвестен', icon: <Icon24Info />, color: '#757575' };
    }
  };

  console.log('Текущее состояние компонента:', {
    requests: requests.length,
    selectedItems: selectedItems.length,
    equipments: equipments?.length
  });

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
        Снаряжение
      </PanelHeader>

      {notification.show && (
        <Group>
          <Alert
            mode={notification.type === 'error' ? 'destructive' : notification.type === 'success' ? 'positive' : 'default'}
            onClose={() => setNotification({ ...notification, show: false })}
            closable
          >
            {notification.message}
          </Alert>
        </Group>
      )}

      <Group>
        <SplitLayout>
          <SplitCol width={'70%'}>
            <ThemeProvider theme={createTheme({}, ruRU)}>
              <Table
                rows={JSON.stringify(equipments || [])}
                headCells={headCells}
                onAddToCart={handleAddToCart}
              />
            </ThemeProvider>
          </SplitCol>
          <SplitCol width={'250px'} cs={{ 'padding-left': '10px' }} ref={calendarRef}>
            <Calendar
              onChange={onChangeCalendar}
              value={new Date()}
              className={['busy-' + 9, 'mbusy-' + 11]}
            />
            <table border={1} style={{ 'width': '100%' }}>
              <thead>
                <tr>
                  <th>Занято</th>
                  <th>Возм. занято</th>
                  <th>Свободно</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th style={{ 'backgroundColor': 'red' }}>1</th>
                  <th style={{ 'backgroundColor': 'yellow' }}>1</th>
                  <th style={{ 'backgroundColor': 'white' }}>1</th>
                </tr>
              </tbody>
            </table>
          </SplitCol>
        </SplitLayout>
      </Group>

      {selectedItems.length > 0 && (
        <Group header={
          <Header size="s">
            Новая заявка
          </Header>
        }>
          <Div style={{
            backgroundColor: '#f0f9ff',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '12px',
            border: '1px solid #bae6fd'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Позиций:</strong> {selectedItems.length}
              </div>
              <div>
                <strong>Общая стоимость:</strong> {calculateTotalCost().toLocaleString()} ₽
              </div>
            </div>
          </Div>

          <TableApplication
            selectedItems={selectedItems}
            onUpdateItem={handleUpdateLocalItem}
            onDeleteItem={handleDeleteLocalItem}
          />

          <Div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
            <Button
              size="s"
              appearance="secondary"
              onClick={() => {
                setSelectedItems([]);
                showNotification('Заявка очищена', 'info');
              }}
              disabled={requestBeingSent}
            >
              Очистить все
            </Button>
            <Button
              size="s"
              appearance="primary"
              onClick={handleCreateRequest}
              loading={requestBeingSent}
              disabled={selectedItems.length === 0}
            >
              {requestBeingSent ? 'Отправка...' : 'Отправить заявку'}
            </Button>
          </Div>
        </Group>
      )}

      {requests.length > 0 && (
        <Group header={<Header size="s">Мои заявки ({requests.length})</Header>}>
          {requests.map((request, index) => {
            console.log('Отображаем заявку:', request);
            const requestItems = transformServerItemsToLocal(request.items || []);
            const statusInfo = getRequestStatusWithIcon(request.status);

            return (
              <Div key={request.id} style={{ marginBottom: '16px' }}>
                <div style={{
                  backgroundColor: '#fafafa',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong>Заявка №{request.id}</strong>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: statusInfo.color
                      }}>
                        {statusInfo.icon}
                        <span style={{ fontSize: '14px' }}>{statusInfo.text}</span>
                      </div>
                    </div>
                    <Button
                      size="s"
                      appearance="secondary"
                      onClick={() => handleDeleteRequest(request.id)}
                    >
                      Удалить
                    </Button>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '12px',
                    marginBottom: '16px',
                    fontSize: '14px'
                  }}>
                    <div>
                      <strong>Позиций:</strong> {requestItems.length}
                    </div>
                    <div>
                      <strong>Дата:</strong> {request.created_at ? new Date(request.created_at).toLocaleDateString('ru-RU') : 'Неизвестно'}
                    </div>
                    {request.total_deposit && (
                      <div>
                        <strong>Залог:</strong> {request.total_deposit} ₽
                      </div>
                    )}
                    {request.total_cost && (
                      <div>
                        <strong>Стоимость:</strong> {request.total_cost} ₽
                      </div>
                    )}
                  </div>

                  <Separator />

                  {requestItems.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <TableApplication
                        selectedItems={requestItems}
                        onUpdateItem={(updatedItem) => handleUpdateRequestItem(request.id, updatedItem)}
                        onDeleteItem={(itemId) => {
                          showNotification('Удаление элементов из заявки пока не реализовано', 'info');
                        }}
                        isServerData={true}
                        readOnly={request.status !== 'на рассмотрении'}
                      />
                    </div>
                  )}
                </div>
              </Div>
            );
          })}
        </Group>
      )}

    </Panel>
  );
};

UserEquipments.propTypes = {
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