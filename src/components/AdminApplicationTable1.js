import * as React from "react";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import Modal from "@mui/material/Modal";
import Snackbar from "@mui/material/Snackbar";
import { ruRU } from "@mui/x-data-grid/locales";
import {
  GridRowModes,
  DataGrid,
  GridActionsCellItem,
  GridRowEditStopReasons,
  GridToolbarContainer,
} from "@mui/x-data-grid";

import {
  getAllRequests,
  updateRequest,
  deleteRequest,
  createRequest,
} from "../api/admin"; // твои API функции

function EditToolbar({ setRows, setRowModesModel }) {
  const handleClick = () => {
    const id = Date.now();
    setRows((prev) => [
      ...prev,
      {
        id,
        name: "",
        status: "На рассмотрении",
        datespo: `${new Date().toISOString().slice(0, 10)} - ${new Date().toISOString().slice(0, 10)}`,
        summ: 0,
        isNew: true,
      },
    ]);
    setRowModesModel((prev) => ({
      ...prev,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
    }));
  };

  return (
    <GridToolbarContainer>
      <Tooltip title="Добавить заявку">
        <Box component="span" sx={{ cursor: "pointer", p: 1 }} onClick={handleClick}>
          <AddIcon fontSize="small" />
        </Box>
      </Tooltip>
    </GridToolbarContainer>
  );
}

export default function AdminApplicationTable1({ onSelectApplication }) {
  const [rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [modalUrl, setModalUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Загрузка данных
  const loadData = async () => {
    try {
      const list = await getAllRequests();
      if (!Array.isArray(list)) throw new Error("Ожидался массив заявок");
      const formatted = list.map((item) => ({
        id: item.id_zajav,
        name: item.fio || `Пользователь ${item.id_user}`,
        status: item.status || "На рассмотрении",
        datespo: `${item.datas?.slice(0, 10) || ""} - ${item.datapo?.slice(0, 10) || ""}`,
        summ: item.summ || 0,
        raw: item,
      }));
      setRows(formatted);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Ошибка загрузки заявок: " + error.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel((prev) => ({
      ...prev,
      [id]: { mode: GridRowModes.Edit },
    }));
  };

  const handleSaveClick = (id) => async () => {
    const rowToSave = rows.find((row) => row.id === id);
    if (!rowToSave) {
      setErrorMessage("Не найдена запись для сохранения");
      return;
    }

    if (!rowToSave.name || !rowToSave.name.trim()) {
      setErrorMessage("ФИО обязательно для заполнения");
      return;
    }

    let startDate = null;
    let endDate = null;
    if (rowToSave.datespo) {
      const parts = rowToSave.datespo.split(" - ");
      startDate = parts[0] || null;
      endDate = parts[1] || null;
    }

    const dataForApi = {
      fio: rowToSave.name,
      datas: startDate,
      datapo: endDate,
      status: rowToSave.status,
      summ: rowToSave.summ || 0,
    };

    try {
      setRowModesModel((prev) => ({
        ...prev,
        [id]: { mode: GridRowModes.View },
      }));

      if (rowToSave.isNew) {
        const savedData = await createRequest(dataForApi);
        setRows((prev) =>
          prev.map((row) =>
            row.id === id
              ? {
                  ...row,
                  id: savedData.id_zajav || savedData.id,
                  name: savedData.fio || row.name,
                  status: savedData.status || row.status,
                  datespo: `${savedData.datas?.slice(0, 10) || ""} - ${savedData.datapo?.slice(0, 10) || ""}`,
                  summ: savedData.summ || row.summ,
                  raw: savedData,
                  isNew: false,
                }
              : row
          )
        );
      } else {
        await updateRequest(id, dataForApi);
        await loadData(); // Обновляем данные из БД
      }
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Ошибка при сохранении заявки: " + error.message);
      setRowModesModel((prev) => ({
        ...prev,
        [id]: { mode: GridRowModes.Edit },
      }));
    }
  };

  const handleDeleteClick = (id) => async () => {
    if (!window.confirm("Вы уверены, что хотите удалить эту заявку?")) return;

    try {
      await deleteRequest(id);
      await loadData();
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Ошибка при удалении заявки: " + error.message);
    }
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel((prev) => ({
      ...prev,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    }));

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow?.isNew) {
      setRows((prev) => prev.filter((row) => row.id !== id));
    }
  };

  const handlePrintClick = () => {
    setModalUrl("https://equpment-rent-club.ru/blank-akt-priema-peredachi2.html");
    setOpenModal(true);
  };

  const processRowUpdate = (newRow) => {
    if (!newRow.name || !newRow.name.trim()) {
      setErrorMessage("ФИО не может быть пустым");
      // Возвращаем старую строку, отменяя изменения
      return rows.find((row) => row.id === newRow.id);
    }

    const updatedRow = { ...newRow, isNew: false };
    setRows((prev) => prev.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newModel) => {
    setRowModesModel(newModel);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70, editable: false },
    {
      field: "name",
      headerName: "ФИО",
      width: 220,
      editable: true,
      preProcessEditCellProps: (params) => {
        const hasError = !params.props.value?.trim();
        return { ...params.props, error: hasError };
      },
    },
    {
      field: "status",
      headerName: "Статус",
      width: 180,
      editable: true,
      type: "singleSelect",
      valueOptions: [
        "На рассмотрении",
        "Предварительно оплачено",
        "Оплачено",
        "Сдано",
      ],
    },
    { field: "datespo", headerName: "Срок аренды", width: 180, editable: true },
    {
      field: "summ",
      headerName: "Сумма",
      width: 120,
      editable: true,
      type: "number",
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Действия",
      width: 250,
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        return isInEditMode
          ? [
              <GridActionsCellItem
                key="save"
                icon={<SaveIcon />}
                label="Сохранить"
                onClick={handleSaveClick(id)}
              />,
              <GridActionsCellItem
                key="cancel"
                icon={<CancelIcon />}
                label="Отмена"
                onClick={handleCancelClick(id)}
              />,
            ]
          : [
              <GridActionsCellItem
                key="edit"
                icon={<EditIcon />}
                label="Редактировать"
                onClick={handleEditClick(id)}
              />,
              <GridActionsCellItem
                key="delete"
                icon={<DeleteIcon />}
                label="Удалить"
                onClick={handleDeleteClick(id)}
              />,
              <GridActionsCellItem
                key="print"
                icon={<PrintIcon />}
                label="Печать"
                onClick={handlePrintClick}
                color="primary"
              />,
            ];
      },
    },
  ];

  return (
    <>
      <Box sx={{ height: 500, width: "100%" }}>
        <DataGrid
          localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
          rows={rows}
          columns={columns}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          slots={{ toolbar: EditToolbar }}
          slotProps={{ toolbar: { setRows, setRowModesModel } }}
          experimentalFeatures={{ newEditingApi: true }}
        />
      </Box>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80vw",
            height: "80vh",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 2,
            borderRadius: 1,
          }}
        >
          {modalUrl && (
            <iframe
              src={modalUrl}
              title="Печать"
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          )}
        </Box>
      </Modal>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage("")}
        message={errorMessage}
      />
    </>
  );
}
