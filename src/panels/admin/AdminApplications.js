import {
  Panel,
  PanelHeader,
  Header,
  Button,
  Group,
  Div,
  PanelHeaderBack,
  ModalRoot,
  ModalPage,
  ModalPageHeader,
  PanelHeaderButton,
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import PropTypes from 'prop-types';
import './../../assets/css/main.css';
import { getAllEquipments } from './../../api/Equipments.js';
import { createContext, useContext, useEffect, useState } from "react";
import Table1 from "./../../components/AdminApplicationTable1.js";
import Table2 from "./../../components/AdminApplicationTable2.js";
import * as React from 'react';
import { instance } from '../../api/axios';

export const AdminApplications = ({ id, fetchedUser }) => {
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dataContext = useContext(createContext(null));
  const routeNavigator = useRouteNavigator();
  const equipments = dataContext?.data?.equipments;

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState([]);

  const [modalActive, setModalActive] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

  const loadEquipments = async () => {
    try {
      const fetchedEquipments = await getAllEquipments();
      if (!dataContext || !fetchedEquipments) return;
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

  const fetchEquipmentByApplication = async (applicationId) => {
    try {
      const response = await instance.get(`/admin/requests/${applicationId}/items`);
      setSelectedEquipment(response.data);
    } catch (e) {
      console.error("Ошибка при загрузке оборудования:", e);
    }
  };

  const openPdfModal = (blob) => {
    const url = URL.createObjectURL(blob);
    setPdfBlobUrl(url);
    setModalActive(true);
  };

  const closePdfModal = () => {
    setModalActive(false);
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(null);
    }
  };

  const handlePrint = async (type = "reception", event) => {
    if (event) event.preventDefault();
    if (!selectedApplication || selectedEquipment.length === 0) return;
    try {
      const token = localStorage.getItem('token');
      const response = await instance.post(
        `/admin/act - ${ type }`,
        {
          application: {
            id: selectedApplication.id_zajav,
            date: selectedApplication.datas,
            userFullName: selectedApplication.user_name,
          },
          equipment: selectedEquipment,
        },
        {
          headers: { Authorization: `Bearer ${ token } `},
    responseType: 'blob',
        }
      );
openPdfModal(response.data);
    } catch (e) {
  console.error("Ошибка при печати акта:", e);
}
  };

const handleApplicationSelect = async (application) => {
  setSelectedApplication(application);
  await fetchEquipmentByApplication(application.id_zajav);
};

return (
  <>
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
        Администрирование заявок
      </PanelHeader>

      <Group header={<Header size="s">Список заявок</Header>}>
        <Table1 onSelectApplication={handleApplicationSelect} />
      </Group>

      <Group header={<Header size="s">Заявки пользователя</Header>}>
        <Table2 userId={selectedApplication?.id_user} />{selectedApplication && (
          <Div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button
              type="button"
              size="l"
              stretched
              onClick={(e) => handlePrint("transmission", e)}
            >
              Печать акта передачи
            </Button>
            <Button
              type="button"
              size="l"
              stretched
              appearance="positive"
              onClick={(e) => handlePrint("reception", e)}
            >
              Печать акта приёма
            </Button>
          </Div>
        )}
      </Group>
    </Panel>

    <ModalRoot activeModal={modalActive ? 'pdfModal' : null} onClose={closePdfModal}>
      <ModalPage
        id="pdfModal"
        header={
          <ModalPageHeader
            left={<PanelHeaderButton onClick={closePdfModal}>Закрыть</PanelHeaderButton>}
          >
            Просмотр PDF
          </ModalPageHeader>
        }
        onClose={closePdfModal}
      >
        {pdfBlobUrl ? (
          <iframe
            src={pdfBlobUrl}
            style={{ width: '100%', height: '100vh', border: 'none' }}
            title="PDF Preview"
          />
        ) : (
          <Div>Загрузка...</Div>
        )}
      </ModalPage>
    </ModalRoot>
  </>
);
};

AdminApplications.propTypes = {
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