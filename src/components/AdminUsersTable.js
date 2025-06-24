import * as React from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import {
  GridRowModes,
  DataGrid,
  GridActionsCellItem,
  GridRowEditStopReasons,
  GridToolbarContainer
} from '@mui/x-data-grid';
import { ruRU } from '@mui/x-data-grid/locales';
import { getAllUsers, updateUser, deleteUser, addUser } from '../api/admin';
import { useEffect, useState } from 'react';

export default function FullFeaturedCrudGrid() {
  const [rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getAllUsers()
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Expected array");

        const formatted = data.map((item, idx) => ({
          id: item.id_vk ?? idx + 1,
          name: item.fio,
          login: item.id_vk,
          passport: item.nam,
          address: item.adr,
          role: item.role ?? 'Арендатор',
        }));

        setRows(formatted);
      })
      .catch((err) => {
        console.error('Ошибка при загрузке пользователей:', err.message);
        setErrorMessage('Ошибка при загрузке пользователей');
      });
  }, []);

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
  if (!rowToSave) return;

  try {
    await updateUser(id, {
      fio: rowToSave.name,
      id_vk: rowToSave.login,
      nam: rowToSave.passport,
      adr: rowToSave.address,
      id_rol: rowToSave.role,
    });

    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  } catch (error) {
    console.error('Ошибка при сохранении пользователя:', error);
    setErrorMessage('Ошибка при сохранении пользователя');
  }
};


  const handleDeleteClick = (id) => async () => {
    try {
      await deleteUser(id);
      setRows(rows.filter((row) => row.id !== id));
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
      setErrorMessage('Ошибка при удалении пользователя');
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
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newModel) => {
    setRowModesModel(newModel);
  };

  const handleAddClick = () => {
  const id = Date.now();
  setRows((prevRows) => [
    ...prevRows,
    {
      id,
      name: '',
      login: '',
      passport: '',
      address: '',
      role: 'Арендатор', 
      isNew: true,
    },
  ]);
  setRowModesModel((prevModel) => ({
    ...prevModel,
    [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' }, 
  }));
};


  const columns = [
    { field: 'id', headerName: 'ID', width: 100, editable: false },
    { field: 'name', headerName: 'ФИО', width: 220, editable: true },
    { field: 'login', headerName: 'ID_VK', width: 150, editable: true },
    { field: 'passport', headerName: 'Документ', width: 150, editable: true },
    { field: 'address', headerName: 'Адрес', width: 300, editable: true },
    {
      field: 'role',
      headerName: 'Роль',
      width: 180,
      editable: true,
      type: 'singleSelect',
      valueOptions: ['Арендатор', 'Заведующий снаряжением'],
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Действия',
      width: 120,
      renderHeader: () => (
        <Tooltip title="Добавить пользователя">
          <Box
            component="span"
            onClick={handleAddClick}
            sx={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <AddIcon fontSize="small" />
          </Box>
        </Tooltip>
      ),
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key="save"
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveClick(id)}
              sx={{ color: 'primary.main' }}
            />,
            <GridActionsCellItem
              key="cancel"
              icon={<CancelIcon />}
              label="Cancel"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Edit"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <Box sx={{ height: 500, width: '100%' }}>
      <DataGrid
        localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
      />
      {errorMessage && (
        <div style={{ color: 'red', marginTop: 10 }}>{errorMessage}</div>
      )}
    </Box>
  );
}
