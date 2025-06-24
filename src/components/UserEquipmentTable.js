import * as React from 'react';
import { useEffect, useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import CartIcon from '@mui/icons-material/AddShoppingCart';
import { getAllEquipments } from '../api/Equipments';
import {
    GridRowModes,
    DataGrid,
    GridActionsCellItem,
    GridRowEditStopReasons,
    Toolbar,
    ToolbarButton,
} from '@mui/x-data-grid';
import { ruRU } from '@mui/x-data-grid/locales';
import {
    randomId,
} from '@mui/x-data-grid-generator';

function EditToolbar(props) {
    const { setRows, setRowModesModel } = props;

    const handleClick = () => {
        const id = randomId();
        setRows((oldRows) => [
            ...oldRows,
            { id, name: '', age: '', role: '', isNew: true },
        ]);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
        }));
    };

    return (
        <Toolbar>
            <Tooltip title="Add record">
                <ToolbarButton onClick={handleClick}>
                    <AddIcon fontSize="small" />
                </ToolbarButton>
            </Tooltip>
        </Toolbar>
    );
}

export default function UserEquipmentsTable({ onAddToCart }) {
    const [rows, setRows] = useState([]);
    const [rowModesModel, setRowModesModel] = useState({});

    const memoizedOnDataChange = useCallback(() => { }, []);

    useEffect(() => {
        getAllEquipments()
            .then((data) => {
                if (!Array.isArray(data)) {
                    throw new Error("Ожидался массив данных, получено: " + JSON.stringify(data));
                }

                const formatted = data.map((item, idx) => ({
                    id: idx + 1,
                    ...item,
                }));
                setRows(formatted);
                memoizedOnDataChange(formatted);
            })
            .catch((error) => {
                console.error('Ошибка при загрузке оборудования:', error.message);
                setRows([]);
                memoizedOnDataChange([]);
            });
    }, [memoizedOnDataChange]);

    const handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleAddToCart = (id) => {
        const selectedItem = rows.find((row) => row.id === id);
        if (selectedItem && onAddToCart) {
            onAddToCart(selectedItem);
            console.log(`Товар "${selectedItem.vnaim}" добавлен в заявку`);
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
        { field: 'id', headerName: '№', width: 10, editable: false, hide: true },
        {
            field: 'tnaim',
            headerName: 'Категория',
            width: 150,
            align: 'left',
            headerAlign: 'left',
            editable: false,
            type: 'singleSelect',
            valueOptions: ['Горное', 'Водное', 'Общее'],
        },
        {
            field: 'vnaim',
            headerName: 'Наименование',
            width: 250,
            editable: false,
        },
        {
            field: 'kolich',
            headerName: 'Количество',
            width: 120,
            editable: false,
            type: 'number',
        },
        {
            field: 'zenaz',
            headerName: 'Залог (₽)',
            width: 120,
            editable: false,
            type: 'number',
        },
        {
            field: 'zenapr',
            headerName: 'Прокат (₽/день)',
            width: 150,
            editable: false,
            type: 'number',
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Действия',
            width: 100,
            getActions: ({ id }) => [
                <GridActionsCellItem
                key="cart"
                    icon={<CartIcon />}
                    label="Добавить в заявку"
                    onClick={() => handleAddToCart(id)}
                    color="inherit"
                />,
            ],
        },
    ];

    return (
        <Box
            sx={{
                height: 500,
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
                columnVisibilityModel={{
                    id: false,
                }}
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
            />
        </Box>
    );
}