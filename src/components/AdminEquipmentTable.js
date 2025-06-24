import React, { useEffect, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { ruRU } from "@mui/x-data-grid/locales";
import {
  GridRowModes,
  DataGrid,
  GridActionsCellItem,
  GridRowEditStopReasons,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import {
  getAdminEquipments,
  updateEquipment,
  deleteEquipment,
  createEquipment,
} from "../api/admin";

const CATEGORY_ID_MAP = {
  Горное: 1,
  Водное: 2,
  Общее: 3,
};

function EditToolbar({ setRows, setRowModesModel }) {
  const handleClick = () => {
    const id = Date.now();
    setRows((oldRows) => [
      ...oldRows,
      {
        id,
        tnaim: "",
        vnaim: "",
        kolich: 1,
        zenaz: 0,
        zenapr: 0,
        sost: "",
        isNew: true,
      },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "vnaim" },
    }));
  };

  return (
    <GridToolbarContainer>
      <Tooltip title="Добавить оборудование">
        <Box component="span" sx={{ cursor: "pointer", p: 1 }} onClick={handleClick}>
          <AddIcon fontSize="small" />
        </Box>
      </Tooltip>
    </GridToolbarContainer>
  );
}

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 360,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  textAlign: "center",
};

export default function AdminEquipmentTable({ applicationId, onDataChange }) {
  const [rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const handleCloseModal = () => setModalOpen(false);

  const memoizedOnDataChange = useCallback(
    (data) => {
      if (onDataChange) {
        onDataChange(data);
      }
    },
    [onDataChange]
  );

  const loadData = useCallback(() => {
    setErrorMessage("");
    return getAdminEquipments()
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("Ожидался массив, получено: " + JSON.stringify(data));
        }
        const formatted = data.map((item) => ({
          id: item.id_vid, // обязательно!
          ...item,
        }));
        setRows(formatted);
        memoizedOnDataChange(formatted);
      })
      .catch((error) => {
        console.error("Ошибка при загрузке оборудования:", error.message);
        setRows([]);
        memoizedOnDataChange([]);
        setErrorMessage("Ошибка при загрузке оборудования");
      });
  }, [memoizedOnDataChange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

const handleSaveClick = (id) => async () => {
  const rowToSave = rows.find((row) => row.id === id);

  console.log("Сохраняю строку с id:", id);
  console.log("Данные строки для сохранения:", rowToSave);

  if (!rowToSave) return;

  if (!rowToSave.tnaim || !rowToSave.vnaim) {
    setErrorMessage("Пожалуйста, заполните Категорию и Наименование перед сохранением!");
    return;
  }

  try {
    if (rowToSave.isNew) {
      const id_tip = CATEGORY_ID_MAP[rowToSave.tnaim];
      if (!id_tip) {
        setErrorMessage("Некорректная категория");
        return;
      }

      await createEquipment({
        id_tip,
        vnaim: rowToSave.vnaim,
        kolich: rowToSave.kolich,
        zenaz: rowToSave.zenaz,
        zenapr: rowToSave.zenapr,
        sost: rowToSave.sost,
      });
    } else {
      await updateEquipment(rowToSave.id, {
        id_tip: CATEGORY_ID_MAP[rowToSave.tnaim],
        vnaim: rowToSave.vnaim,
        kolich: rowToSave.kolich,
        zenaz: rowToSave.zenaz,
        zenapr: rowToSave.zenapr,
        sost: rowToSave.sost,
      });
    }

    setRowModesModel((prevModel) => ({
      ...prevModel,
      [id]: { mode: GridRowModes.View },
    }));

    await loadData();
    setErrorMessage("");
  } catch (error) {
    console.error("Ошибка при сохранении оборудования:", error);
    setErrorMessage("Ошибка при сохранении оборудования");
  }
};




  const handleDeleteClick = (id) => async () => {
    try {
      await deleteEquipment(id);
      setRows((prevRows) => prevRows.filter((row) => row.id !== id));
      setErrorMessage("");
    } catch (error) {
      console.error("Ошибка при удалении оборудования:", error);
      setModalOpen(true);
    }
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
    const editedRow = rows.find((row) => row.id === id);
    if (editedRow?.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

 const processRowUpdate = (newRow) => {
  console.log("processRowUpdate, newRow:", newRow);
  const updatedRow = { ...newRow, isNew: false };
  setRows((prev) => {
    const updatedRows = prev.map((row) => (row.id === newRow.id ? updatedRow : row));
    memoizedOnDataChange(updatedRows); // вызываем с обновленными данными
    return updatedRows;
  });
  return updatedRow;
};


  const handleRowModesModelChange = (newModel) => {
    setRowModesModel(newModel);
  };

  const columns = [
    { field: "id", headerName: "№", width: 50 },
    {
      field: "tnaim",
      headerName: "Категория",
      width: 150,
      editable: true,
      type: "singleSelect",
      valueOptions: ["Горное", "Водное", "Общее"],
    },
    { field: "vnaim", headerName: "Наименование", width: 200, editable: true },
    { field: "kolich", headerName: "Количество", width: 120, editable: true, type: "number" },
    { field: "zenaz", headerName: "Залог (₽)", width: 130, editable: true, type: "number" },
    { field: "zenapr", headerName: "Прокат (₽/день)", width: 130, editable: true, type: "number" },
    { field: "sost", headerName: "Состав", width: 200, editable: true },
    {
      field: "actions",
      type: "actions",
      headerName: "Действия",
      width: 100,
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        return isInEditMode
          ? [
              <GridActionsCellItem key="save" icon={<SaveIcon />} label="Save" onClick={handleSaveClick(id)} />,
              <GridActionsCellItem key="cancel" icon={<CancelIcon />} label="Cancel" onClick={handleCancelClick(id)} />,
            ]
          : [
              <GridActionsCellItem key="edit" icon={<EditIcon />} label="Edit" onClick={handleEditClick(id)} />,
              <GridActionsCellItem key="delete" icon={<DeleteIcon />} label="Delete" onClick={handleDeleteClick(id)} />,
            ];
      },
    },
  ];

  return (
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
        showToolbar
      />
      {errorMessage && (
        <Box sx={{ mt: 1, color: "error.main", textAlign: "center" }}>{errorMessage}</Box>
      )}

      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Нельзя удалить категорию: к ней привязано снаряжение, сначала уберите его из категории
          </Typography>
          <Button variant="contained" onClick={handleCloseModal}>
            Понятно
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
