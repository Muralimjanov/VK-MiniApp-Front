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
import { getAllRequests, updateRequest, deleteRequest } from "../api/admin";

function EditToolbar({ setRows, setRowModesModel }) {
  const handleClick = () => {
    const id = Date.now();
    setRows((prev) => [
      ...prev,
      {
        id,
        name: "",
        status: "",
        date: new Date().toISOString().split("T")[0],
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

  useEffect(() => {
    getAllRequests()
      .then((list) => {
        if (!Array.isArray(list)) throw new Error("Ожидался массив заявок");
        const formatted = list.map((item) => ({
          id: item.id_zajav,
          name: item.fio || `Пользователь ${item.id_user}`,
          status: item.status || "На рассмотрении",
          datespo: `${item.datas?.slice(0, 10)} - ${item.datapo?.slice(0, 10)}`,
          summ: item.summ,
          raw: item, // оригинал заявки
        }));
        setRows(formatted);
      })
      .catch((error) => {
        console.error("Ошибка при загрузке заявок:", error.message);
        setErrorMessage("Ошибка загрузки заявок");
      });
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
    setRowModesModel((prev) => ({
      ...prev,
      [id]: { mode: GridRowModes.View },
    }));
    const rowToSave = rows.find((row) => row.id === id);
    if (!rowToSave) return;

    try {
      const [startDate, endDate] = rowToSave.datespo.split(" - ");
      const dataForApi = {
        datas: startDate,
        datapo: endDate,
        status: rowToSave.status,
        summ: rowToSave.summ,
      };
      await updateRequest(id, dataForApi);

      setRows((prev) =>
        prev.map((row) =>
          row.id === id ? { ...row, ...rowToSave, isNew: false } : row
        )
      );
    } catch (error) {
      console.error("Ошибка при сохранении заявки:", error);
      setErrorMessage("Ошибка при сохранении заявки");
    }
  };

  const handleDeleteClick = (id) => async () => {
    try {
      await deleteRequest(id);
      setRows((prev) => prev.filter((row) => row.id !== id));
    } catch (error) {
      console.error("Ошибка при удалении заявки:", error);
      setErrorMessage("Ошибка при удалении заявки");
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
    if (!newRow.name.trim()) {
      return rows.find((row) => row.id === newRow.id);
    }
    const updatedRow = { ...newRow, isNew: false };
    setRows((prev) =>
      prev.map((row) => (row.id === newRow.id ? updatedRow : row))
    );
    return updatedRow;
  };

  const handleRowModesModelChange = (newModel) => {
    setRowModesModel(newModel);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 50, editable: false },
    { field: "name", headerName: "ФИО", width: 220, editable: true },
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
      field: "actions",
      type: "actions",
      headerName: "Действия",
      width: 250,
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
        const selectHandler = () => {
          const app = rows.find((r) => r.id === id);
          if (onSelectApplication && app?.raw) {
            onSelectApplication({
              id_zajav: app.raw.id_zajav,
              datas: app.raw.datas,
              user_name: app.raw.fio,
            });
          }
        };

        return isInEditMode
          ? [
              <GridActionsCellItem
                key="save"
                icon={<SaveIcon />}
                label="Save"
                onClick={handleSaveClick(id)}
              />,
              <GridActionsCellItem
                key="cancel"
                icon={<CancelIcon />}
                label="Cancel"
                onClick={handleCancelClick(id)}
              />,
            ]
          : [
              <GridActionsCellItem
                key="edit"
                icon={<EditIcon />}
                label="Edit"
                onClick={handleEditClick(id)}
              />,
              <GridActionsCellItem
                key="delete"
                icon={<DeleteIcon />}
                label="Delete"
                onClick={handleDeleteClick(id)}
              />,
              <GridActionsCellItem
                key="print"
                icon={<PrintIcon />}
                label="Print"
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
