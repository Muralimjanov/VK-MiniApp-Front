import React, { useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { ruRU } from '@mui/x-data-grid/locales';
import {
    GridRowModes,
    DataGrid,
    GridActionsCellItem,
    GridRowEditStopReasons,
    GridToolbarContainer,
} from '@mui/x-data-grid';

function EditToolbar({ setRows, setRowModesModel }) {
    const handleClick = () => {
        const id = Date.now();
        setRows((oldRows) => [
            ...oldRows,
            { id, tnaim: '', vnaim: '', kolich: 1, zenaz: 0, zenapr: 0, sost: '', isNew: true },
        ]);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: 'vnaim' },
        }));
    };

    return (
        <GridToolbarContainer>
            <Tooltip title="Добавить оборудование">
                <Box component="span" sx={{ cursor: 'pointer', p: 1 }} onClick={handleClick}>
                    <AddIcon fontSize="small" />
                </Box>
            </Tooltip>
        </GridToolbarContainer>
    );
}

export default function AdminEquipmentTable({ applicationId, onDataChange }) {
    var [rows, setRows] = useState([]);
    const [rowModesModel, setRowModesModel] = useState({});

    const memoizedOnDataChange = useCallback((data) => {
        if (onDataChange) {
            console.log('Calling onDataChange with:', data);
            onDataChange(data);
        }
    }, [onDataChange]);

    useEffect(() => {
        if (!applicationId) {
            console.log('No applicationId provided, skipping data load');
            return;
        }

        console.log('Loading equipment for applicationId:', applicationId);
        const mockData = [
            { tnaim: 'Горное', vnaim: 'Лыжи', kolich: 2, zenaz: 500, zenapr: 300, sost: 'Новое' },
            { tnaim: 'Водное', vnaim: 'Каяк', kolich: 1, zenaz: 1000, zenapr: 600, sost: 'Б/У' },
        ];
        const formatted = mockData.map((item, idx) => ({ id: idx + 1, ...item }));
        console.log('Setting rows:', formatted);
        setRows(formatted);
        memoizedOnDataChange(formatted);

        //! Раскомментируйте для реального AP
        fetch(`/api/applications/${applicationId}/equipment`)
            .then((res) => {
                if (!res.ok) throw new Error('Ошибка загрузки данных');
                return res.json();
            })
            .then((data) => {
                const formatted = data.map((item, idx) => ({
                    id: idx + 1,
                    ...item,
                }));
                setRows(formatted);
                memoizedOnDataChange(formatted);
            })
            .catch((error) => {
                console.error('Ошибка при загрузке оборудования:', error.message);
                console.log('Application ID:', applicationId);
                setRows([]);
                memoizedOnDataChange([]);
            });
    }, [applicationId, memoizedOnDataChange]);

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
        if (editedRow.isNew) {
            setRows(rows.filter((row) => row.id !== id));
        }
    };

    const processRowUpdate = (newRow) => {
        const updatedRow = { ...newRow, isNew: false };
        setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
        memoizedOnDataChange(rows);
        return updatedRow;
    };

    const handleRowModesModelChange = (newModel) => {
        setRowModesModel(newModel);
    };
    const initialRowsSn = [
    { id: 1, tnaim: 'Горное', vnaim: 'Шнур 16-прядный 6мм', kolich: 14,zenaz:100, zenapr:10, sost: null },
    { id: 2, tnaim: 'Горное', vnaim: 'Карабин "Ринг"(сталь)', kolich: 3,zenaz:200, zenapr:20, sost: null },
    { id: 3, tnaim: 'Водное', vnaim: 'Заглушка', kolich: 6,zenaz:300, zenapr:30, sost: 'Заглушка' },
    { id: 4, tnaim: 'Водное', vnaim: 'Байдарка "Таймень"', kolich: 7,zenaz:4000, zenapr:40, sost: null },
];
    const columns = [
        { field: 'id', headerName: '№', width: 50 },
        {
            field: 'tnaim',
            headerName: 'Категория',
            width: 150,
            editable: true,
            type: 'singleSelect',
            valueOptions: ['Горное', 'Водное', 'Общее'],
        },
        { field: 'vnaim', headerName: 'Наименование', width: 200, editable: true },
        { field: 'kolich', headerName: 'Количество', width: 120, editable: true, type: 'number' },
        { field: 'zenaz', headerName: 'Залог (₽)', width: 130, editable: true, type: 'number' },
        { field: 'zenapr', headerName: 'Прокат (₽/день)', width: 130, editable: true, type: 'number' },
        { field: 'sost', headerName: 'Состав', width: 200, editable: true },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Действия',
            width: 100,
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                return isInEditMode
                    ? [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            onClick={handleCancelClick(id)}
                        />,
                    ]
                    : [
                        <GridActionsCellItem
                            icon={<EditIcon />}
                            label="Edit"
                            onClick={handleEditClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<DeleteIcon />}
                            label="Delete"
                            onClick={handleDeleteClick(id)}
                        />,
                    ];
            },
        },
    ];
    rows = initialRowsSn;
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
                slots={{ toolbar: EditToolbar }}
                slotProps={{ toolbar: { setRows, setRowModesModel } }}
                showToolbar
            />
        </Box>
    );
}