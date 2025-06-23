import React, { useRef, useState } from 'react';
import { Box, Modal, Typography } from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { ruRU } from '@mui/x-data-grid/locales';
import PrintIcon from '@mui/icons-material/Print';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useReactToPrint } from 'react-to-print';
import AdminEquipmentTable from './AdminEquipmentTable';
import ActTransmission from './ActTransmission';
import ActReception from './ActReception';
import { Panel, PanelHeader, Header, Button, Group, Cell, Div, Avatar } from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import PropTypes from 'prop-types';
import './../assets/css/main.css';
import {getAllEquipments} from './../api/Equipments.js';
import {createContext, useContext, useEffect,} from "react";
import Table from "./../components/Table.js";
import EditEquipmentForm from "./../components/EditEquipmentForm.js";
import {
    GridRowModes,
    GridRowEditStopReasons,
    GridToolbarContainer,
} from '@mui/x-data-grid';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';

const initialRows = [
    { id: 1, tnaim: 'Горное', vnaim: 'Шнур 16-прядный 6мм', kolich: 1,zenaz:100, zenapr:10, sost: null },
    { id: 2, tnaim: 'Горное', vnaim: 'Карабин "Ринг"(сталь)', kolich: 1,zenaz:200, zenapr:20, sost: null },
    { id: 3, tnaim: 'Водное', vnaim: 'Заглушка', kolich: 1,zenaz:300, zenapr:30, sost: 'Заглушка' },
];

function EditToolbar({ setRows, setRowModesModel }) {
    const handleClick = () => {
        
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
export default function AdminApplicationTable2() {
    const [rows, setRows] = React.useState(initialRows);
    const [rowModesModel, setRowModesModel] = React.useState({});

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
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const columns = [
        { field: 'id', headerName: '№', width: 10, editable: false,hide: false },
        {
            field: 'vnaim',
            headerName: 'Наименование',
            width: 220,
            editable: true,
        },
        {
            field: 'kolich',
            headerName: 'Количество',
            width: 120,
            editable: true,
            type: 'number',
        },
        {
            field: 'zenaz',
            headerName: 'Залог (₽)',
            width: 120,
            editable: true,
            type: 'number',
        },
        {
            field: 'zenapr',
            headerName: 'Прокат (₽/день)',
            width: 150,
            editable: true,
            type: 'number',
        },
        {
            field: 'sost',
            headerName: 'Состав',
            width: 250,
            editable: true,
            type: 'number',
        },
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
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            material={{
                                sx: {
                                    color: 'primary.main',
                                },
                            }}
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            className="textPrimary"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                    ];
                }
                
                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
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
        <Box
            sx={{
                height: 350,
                width: '100%',
                '& .actions': {
                    color: 'text.secondary',
                },
                '& .textPrimary': {
                    color: 'text.primary',
                },
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
                slotProps={{
                    toolbar: { setRows, setRowModesModel },
                }}
                showToolbar

            />
        </Box>
    );
}