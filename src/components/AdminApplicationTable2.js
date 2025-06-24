import React, { useEffect, useState } from 'react';
import { Box, Tooltip } from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridRowModes,
  GridRowEditStopReasons,
  GridToolbarContainer,
} from '@mui/x-data-grid';
import { ruRU } from '@mui/x-data-grid/locales';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import PropTypes from 'prop-types';
import { instance } from '../api/axios';

function EditToolbar({ setRows, setRowModesModel }) {
  const handleClick = () => {
  };

  return (
    <GridToolbarContainer>
      <Tooltip title="Добавить заявку">
        <Box component="span" sx={{ cursor: 'pointer', p: 1 }} onClick={handleClick}>
          <AddIcon fontSize="small" />
        </Box>
      </Tooltip>
    </GridToolbarContainer>
  );
}

export default function AdminApplicationTable2({ userId }) {
  const [rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await instance.get('/api/admin/requests', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const filtered = response.data.filter((req) => req.id_user === userId);
        setRows(filtered);
      } catch (error) {
        console.error('Ошибка при загрузке заявок:', error);
      }
    };

    if (userId) fetchRequests();
  }, [userId]);

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => () => {
    setRows(rows.filter((row) => row.id !== id));
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

  const columns = [
    { field: 'id', headerName: 'ID заявки', width: 90 },
    { field: 'datas', headerName: 'Дата', width: 150 },
    { field: 'status', headerName: 'Статус', width: 150 },
    { field: 'komment', headerName: 'Комментарий', width: 200 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Действия',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
        if (isInEditMode) {
          return [
            <GridActionsCellItem key="save" icon={<SaveIcon />} label="Сохранить" onClick={handleSaveClick(id)} />,
            <GridActionsCellItem key="cancel" icon={<CancelIcon />} label="Отмена" onClick={handleCancelClick(id)} />,
          ];
        }
        return [
          <GridActionsCellItem key="edit" icon={<EditIcon />} label="Редактировать" onClick={handleEditClick(id)} />,
          <GridActionsCellItem key="delete" icon={<DeleteIcon />} label="Удалить" onClick={handleDeleteClick(id)} />,
        ];
      },
    },
  ];

  return (
    <Box
      sx={{
        height: 400,
        width: '100%',
        '& .actions': { color: 'text.secondary' },
        '& .textPrimary': { color: 'text.primary' },
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
        showToolbar
      />
    </Box>
  );
}

AdminApplicationTable2.propTypes = {
  userId: PropTypes.number,
};
