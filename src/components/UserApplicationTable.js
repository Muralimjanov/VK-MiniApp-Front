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
    Toolbar,
    ToolbarButton,
} from '@mui/x-data-grid';
import { ruRU } from '@mui/x-data-grid/locales';
import { randomId } from '@mui/x-data-grid-generator';

function EditToolbar(props) {
    const { setRows, setRowModesModel } = props;

    const handleClick = () => {
        const id = randomId();
        setRows((oldRows) => [
            ...oldRows,
            { id, vnaim: '', kolich: 1, zenaz: 0, zenapr: 0, sost: '', isNew: true },
        ]);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: 'vnaim' },
        }));
    };

    return (
        <Toolbar>
            <Tooltip title="Добавить запись">
                <ToolbarButton onClick={handleClick}>
                    <AddIcon fontSize="small" />
                </ToolbarButton>
            </Tooltip>
        </Toolbar>
    );
}

export default function UserApplicationTable({ 
    selectedItems = [], 
    onUpdateItem, 
    onDeleteItem 
}) {
    const [rows, setRows] = React.useState([]);
    const [rowModesModel, setRowModesModel] = React.useState({});

    React.useEffect(() => {
        setRows(selectedItems);
    }, [selectedItems]);

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
        if (onDeleteItem) {
            onDeleteItem(id);
        } else {
            setRows(rows.filter((row) => row.id !== id));
        }
    };

    const handleCancelClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });

        const editedRow = rows.find((row) => row.id === id);
        if (editedRow && editedRow.isNew) {
            if (onDeleteItem) {
                onDeleteItem(id);
            } else {
                setRows(rows.filter((row) => row.id !== id));
            }
        }
    };

    const processRowUpdate = (newRow) => {
        const updatedRow = { ...newRow, isNew: false };
        
        if (onUpdateItem) {
            onUpdateItem(updatedRow);
        } else {
            setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
        }
        
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const handleAddRow = (newRows) => {
        setRows(newRows);
    };

    const columns = [
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
                        key="save"
                            icon={<SaveIcon />}
                            label="Сохранить"
                            sx={{
                                color: 'primary.main',
                            }}
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                        key="canel"
                            icon={<CancelIcon />}
                            label="Отменить"
                            className="textPrimary"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                    key="edin"
                        icon={<EditIcon />}
                        label="Редактировать"
                        className="textPrimary"
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
                onRowModesModel={handleRowModesModelChange}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                slots={{ toolbar: EditToolbar }}
                slotProps={{
                    toolbar: { setRows: handleAddRow, setRowModesModel },
                }}
            />
        </Box>
    );
}