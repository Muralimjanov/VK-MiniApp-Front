import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PrintIcon from "@mui/icons-material/Print";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import AdminEquipmentTable from "./AdminEquipmentTable";
import ActTransmission from "./ActTransmission";
import ActReception from "./ActReception";
import { ruRU } from "@mui/x-data-grid/locales";
import {
  GridRowModes,
  DataGrid,
  GridActionsCellItem,
  GridRowEditStopReasons,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import { Snackbar } from "@mui/material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
        <Box
          component="span"
          sx={{ cursor: "pointer", p: 1 }}
          onClick={handleClick}
        >
          <AddIcon fontSize="small" />
        </Box>
      </Tooltip>
    </GridToolbarContainer>
  );
}

export default function AdminApplicationTable1() {
  const [rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [isEquipmentLoading, setIsEquipmentLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const printRef = useRef();
  const [debugVisible, setDebugVisible] = useState(false);

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRowId(null);
  };
  useEffect(() => {
    getAllRequests()
      .then((list) => {
        console.log("Список заявок:", list);
        if (!Array.isArray(list)) {
          throw new Error("Ожидался массив заявок");
        }
        const formatted = list.map((item) => ({
          id: item.id_zajav,
          name: item.fio || `Пользователь ${item.id_user}`,
          status: item.status || "На рассмотрении",
          datespo: `${item.datas?.slice(0, 10)} - ${item.datapo?.slice(0, 10)}`,
          summ: item.summ,
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
  setRowModesModel((prev) => ({ ...prev, [id]: { mode: GridRowModes.View } }));

  const rowToSave = rows.find((row) => row.id === id);
  if (!rowToSave) return;

  try {
    const [startDate, endDate] = rowToSave.datespo.split(' - ');
    const dataForApi = {
      datas: startDate,
      datapo: endDate,
      status: rowToSave.status,
      summ: rowToSave.summ,
    };

    console.log('Saving request:', id, dataForApi);
    const updatedData = await updateRequest(id, dataForApi);

    // Если сервер возвращает обновлённый объект заявки, обновляем конкретный ряд:
    // (иначе, если возвращается массив, нужно разобраться в структуре ответа)
    if (updatedData) {
      setRows((prev) =>
        prev.map((row) =>
          row.id === id
            ? { ...row, ...rowToSave, isNew: false } // можно дополнительно взять данные из updatedData, если есть
            : row
        )
      );
    }

    console.log('Request updated successfully');
  } catch (error) {
    console.error('Ошибка при сохранении заявки:', error);
    setErrorMessage('Ошибка при сохранении заявки');
  }
};

const handleDeleteClick = (id) => async () => {
  try {
    console.log('Deleting request:', id);
    await deleteRequest(id);
    setRows((prev) => prev.filter((row) => row.id !== id));
    console.log('Request deleted successfully');
  } catch (error) {
    console.error('Ошибка при удалении заявки:', error);
    setErrorMessage('Ошибка при удалении заявки');
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

  const handlePrintClick = async (id) => {
    const hideFrame = document.createElement("iframe");
    hideFrame.onload = function () {
      this.contentWindow.onbeforeunload = () =>
        document.body.removeChild(hideFrame);
      this.contentWindow.onafterprint = () =>
        document.body.removeChild(hideFrame);
      this.contentWindow.print();
    };
    hideFrame.style.display = "none";
    hideFrame.src =
      "https://equpment-rent-club.ru/blank-akt-priema-peredachi2.html";
    document.body.appendChild(hideFrame);
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
    {
      field: "datespo",
      headerName: "Срок аренды",
      width: 180,
      editable: true,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Действия",
      width: 200,
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        return isInEditMode
          ? [
              <GridActionsCellItem
                icon={<SaveIcon />}
                label="Save"
                onClick={handleSaveClick(id)}
                sx={{ color: "primary.main" }}
              />,
              <GridActionsCellItem
                icon={<CancelIcon />}
                label="Cancel"
                onClick={handleCancelClick(id)}
                color="inherit"
              />,
            ]
          : [
              <GridActionsCellItem
                icon={<EditIcon />}
                label="Edit"
                onClick={handleEditClick(id)}
                color="inherit"
              />,
              <GridActionsCellItem
                icon={<DeleteIcon />}
                label="Delete"
                onClick={handleDeleteClick(id)}
                color="inherit"
              />,
              <GridActionsCellItem
                icon={<PrintIcon />}
                label="Print"
                onClick={() => handlePrintClick(id)}
                color="primary"
                disabled={isEquipmentLoading}
              />,
            ];
      },
    },
  ];

  const selectedRow = rows.find((row) => row.id === selectedRowId);
  const onDataChange = useCallback((data) => {
    console.log("Equipment updated (modal):", data);
    setEquipment(data);
    setIsEquipmentLoading(false);
  }, []);

  return (
    <Box
      sx={{
        height: 500,
        width: "100%",
        "& .actions": { color: "text.secondary" },
        "& .textPrimary": { color: "text.primary" },
      }}
    >
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
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxHeight: "80vh",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            overflow: "auto",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Снаряжение для заявки #{selectedRowId}
          </Typography>
          {selectedRow && (
            <>
              <Typography>ФИО: {selectedRow.name}</Typography>
              <Typography>Статус: {selectedRow.status}</Typography>
              <Typography>Срок аренды: {selectedRow.datespo}</Typography>
            </>
          )}
          <AdminEquipmentTable
            applicationId={selectedRowId}
            onDataChange={onDataChange}
          />
        </Box>
      </Modal>
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage("")}
        message={errorMessage}
      />
    </Box>
  );
}
