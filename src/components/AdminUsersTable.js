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
} from '@mui/x-data-grid';
import { ruRU } from '@mui/x-data-grid/locales';
import { getAllUsers, updateUser, deleteUser, addUser } from '../api/admin';
import { useEffect, useState } from 'react';

export default function FullFeaturedCrudGrid() {
  const [rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      const formatted = data.map((item, idx) => ({
        id: item.id_user,
        name: item.fio || '',
        login: item.vk_id || '',
        passport: item.nam || '',
        address: item.adr || '',
        role: item.id_rol === 2 ? 'Заведующий снаряжением' : 'Арендатор',
        isNew: false,
      }));
      setRows(formatted);
      setErrorMessage('');
    } catch (err) {
      console.error('Ошибка при загрузке пользователей:', err.message);
      setErrorMessage('Ошибка при загрузке пользователей');
    }
  };

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const handleDeleteClick = (id) => async () => {
    try {
      await deleteUser(id);
      setRows((prevRows) => prevRows.filter((row) => row.id !== id));
      setErrorMessage('');
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
      setErrorMessage('Ошибка при удалении пользователя');
    }
  };

  const processRowUpdate = async (newRow, oldRow) => {
    const roleMap = {
      'Арендатор': 1,
      'Заведующий снаряжением': 2,
    };

    const userData = {
      fio: newRow.name,
      vk_id: newRow.login,
      nam: newRow.passport,
      adr: newRow.address,
      id_rol: roleMap[newRow.role] || 1,
    };

    try {
      if (newRow.isNew) {
        const response = await addUser(userData);
        return { ...newRow, id: response.id_user, isNew: false };
      } else {
        await updateUser(newRow.id, userData);
        return { ...newRow };
      }
    } catch (error) {
      setErrorMessage(newRow.isNew ? 'Ошибка при добавлении пользователя' : 'Ошибка при сохранении пользователя');
      throw error; 
    }
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
              label="Сохранить"
              onClick={() => setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } })}
              sx={{ color: 'primary.main' }}
            />,
            <GridActionsCellItem
              key="cancel"
              icon={<CancelIcon />}
              label="Отмена"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Редактировать"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Удалить"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        processRowUpdate={processRowUpdate}
        onRowEditStop={handleRowEditStop}
        experimentalFeatures={{ newEditingApi: true }} 
        pagination
        pageSize={10}
        rowsPerPageOptions={[5, 10, 25]}
      />
      {errorMessage && (
        <Box sx={{ color: 'red', marginTop: 2 }}>
          {errorMessage}
        </Box>
      )}
    </Box>
  );
}
