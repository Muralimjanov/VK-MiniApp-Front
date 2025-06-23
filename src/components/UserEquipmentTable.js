import * as React from 'react';
import { useEffect, useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CartIcon from '@mui/icons-material/AddShoppingCart';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
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
    randomCreatedDate,
    randomTraderName,
    randomId,
    randomArrayItem,
} from '@mui/x-data-grid-generator';

const roles = ['Market', 'Finance', 'Development'];
const randomRole = () => {
    return randomArrayItem(roles);
};



// const initialRows = [
//     { id: 1, tnaim: 'Горное', vnaim: 'Шнур 16-прядный 6мм', kolich: 14, zenaz: 100, zenapr: 10 },
//     { id: 2, tnaim: 'Горное', vnaim: 'Карабин "Ринг"(сталь)', kolich: 3, zenaz: 200, zenapr: 20 },
//     { id: 3, tnaim: 'Водное', vnaim: 'Заглушка', kolich: 6, zenaz: 300, zenapr: 30 },
//     { id: 4, tnaim: 'Водное', vnaim: 'Байдарка "Таймень"', kolich: 7, zenaz: 4000, zenapr: 40 },
// ];

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

export default function FullFeaturedCrudGrid() {
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
        { field: 'id', headerName: '№', width: 10, editable: false, hide: true },
        {
            field: 'tnaim',
            headerName: 'Категория',
            width: 30,
            align: 'left',
            headerAlign: 'left',
            editable: false,
            type: 'singleSelect',
            valueOptions: ['Горное', 'Водное', 'Общее'],
        },
        {
            field: 'vnaim',
            headerName: 'Наименование',
            width: 200,
            editable: false,
        },
        {
            field: 'kolich',
            headerName: 'Количество',
            width: 50,
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
            width: 30,
            editable: false,
            type: 'number',
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Действия',
            width: 100,
            // cellClassName: 'actions',
            // getActions: ({ id }) => {
            //     return [
            //         <GridActionsCellItem
            //             icon={<CartIcon />}
            //             label="Add"
            //             className="textPrimary"
            //             onClick={handleEditClick(id)}
            //             color="inherit"
            //         />,
            //     ];
            // },
            getActions: ({ id }) => [
                <GridActionsCellItem
                    icon={<CartIcon />}
                    label="Выбрать"
                    onClick={() => console.log(`Выбрана строка ${id}`)}
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