import * as React from 'react';
import { useCallback, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrintIcon from '@mui/icons-material/Print';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import AdminEquipmentTable from './AdminEquipmentTable';
import ActTransmission from './ActTransmission';
import ActReception from './ActReception';
import { ruRU } from '@mui/x-data-grid/locales';
import {
    GridRowModes,
    DataGrid,
    GridActionsCellItem,
    GridRowEditStopReasons,
    GridToolbarContainer,
} from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { Snackbar } from '@mui/material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const initialRows = [
    { id: 1, name: 'Чёрный Сергей', status: 'Оплачено', datespo: '06/03/2025-06/03/2025' },
    { id: 2, name: 'Чёрный Сергей', status: 'На рассмотрении', datespo: '06/05/2025-06/05/2025' },
    { id: 3, name: 'Антонов Сергей', status: 'Оплачено', datespo: '06/06/2025-06/06/2025' },

];

function EditToolbar({ setRows, setRowModesModel }) {
    const handleClick = () => {
        const id = randomId();
        setRows((prev) => [...prev, { id, name: '', status: '', date: new Date().toISOString().split('T')[0], isNew: true }]);
        setRowModesModel((prev) => ({
            ...prev,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
        }));
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

export default function AdminApplicationTable1() {
    const [rows, setRows] = useState(initialRows);
    const [rowModesModel, setRowModesModel] = useState({});
    const [openModal, setOpenModal] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [equipment, setEquipment] = useState([]);
    const [isEquipmentLoading, setIsEquipmentLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const printRef = useRef();
    const [debugVisible, setDebugVisible] = useState(false); // Для отладки

    const handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClick = (id) => () => {
        setRowModesModel((prev) => ({ ...prev, [id]: { mode: GridRowModes.Edit } }));
    };

    const handleSaveClick = (id) => () => {
        setRowModesModel((prev) => ({ ...prev, [id]: { mode: GridRowModes.View } }));
    };

    const handleDeleteClick = (id) => () => {
        setRows((prev) => prev.filter((row) => row.id !== id));
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

    const handleViewEquipmentClick = (id) => () => {
        setSelectedRowId(id);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedRowId(null);
    };

    const loadEquipmentData = useCallback((appId) => {
        return new Promise((resolve) => {
            console.log('Loading equipment data for:', appId);
            const mockData = [
                { tnaim: 'Горное', vnaim: 'Лыжи', kolich: 2, zenaz: 500, zenapr: 300, sost: 'Новое' },
                { tnaim: 'Водное', vnaim: 'Каяк', kolich: 1, zenaz: 1000, zenapr: 600, sost: 'Б/У' },
            ];
            const formatted = mockData.map((item, idx) => ({ id: idx + 1, ...item }));
            setTimeout(() => {
                console.log('Loaded equipment:', formatted);
                resolve(formatted);
            }, 1000);
        });
    }, []);
    

    const handlePrintClick = async (id) => {
        function setPrint() {
        const closePrint = () => {
            document.body.removeChild(this);
        };
        this.contentWindow.onbeforeunload = closePrint;
        this.contentWindow.onafterprint = closePrint;
        this.contentWindow.print();
        }

            const hideFrame = document.createElement("iframe");
            hideFrame.onload = setPrint;
            hideFrame.style.display = "none"; // hide iframe
            hideFrame.src = "https://equpment-rent-club.ru/blank-akt-priema-peredachi2.html";
            document.body.appendChild(hideFrame);
      //if (isEquipmentLoading) {
      //    console.log('Print already in progress, ignoring click');
      //    return;
      //}
      //
      //setSelectedRowId(id);
      //setIsEquipmentLoading(true);
      //console.log('Print clicked:', { id, equipment });
      //
      //try {
      //    const loadedEquipment = await loadEquipmentData(id);
      //    setEquipment(loadedEquipment);
      //    console.log('Equipment set for print:', loadedEquipment);
      //
      //    if (loadedEquipment.length === 0) {
      //        setErrorMessage('Данные оборудования отсутствуют');
      //        return;
      //    }
      //
      //    await new Promise((resolve) => setTimeout(resolve, 1000));
      //    if (!printRef.current) {
      //        console.error('printRef is not set');
      //        setErrorMessage('Ошибка: область печати не найдена');
      //        return;
      //    }
      //
      //    setDebugVisible(true);
      //    await new Promise((resolve) => setTimeout(resolve, 500));
      //    console.log('Capturing printRef content:', printRef.current.innerHTML);
      //
      //    console.log('Generating PDF...');
      //    const canvas = await html2canvas(printRef.current, {
      //        scale: 3,
      //        useCORS: true,
      //        logging: true,
      //        backgroundColor: '#ffffff'
      //    });
      //    const imgData = canvas.toDataURL('image/png');
      //    console.log('Canvas generated, size:', canvas.width, 'x', canvas.height);
      //
      //    const pdf = new jsPDF('p', 'mm', 'a4');
      //    const imgWidth = 190;
      //    const pageHeight = 295;
      //    const imgHeight = (canvas.height * imgWidth) / canvas.width;
      //    let heightLeft = imgHeight;
      //    let position = 10;
      //
      //    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      //    heightLeft -= pageHeight;
      //
      //    while (heightLeft > 0) {
      //        position = heightLeft - imgHeight + 10;
      //        pdf.addPage();
      //        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      //        heightLeft -= pageHeight;
      //    }
      //
      //    pdf.save(`documents-${id}.pdf`);
      //    console.log('PDF saved');
      //    setDebugVisible(false);
      //} catch (error) {
      //    console.error('Error during print:', error);
      //    setErrorMessage('Ошибка при подготовке печати');
      //    setDebugVisible(false);
      //} finally {
      //    setIsEquipmentLoading(false);
      //}
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
        { field: 'id', headerName: 'ID', width: 50, editable: false },
        { field: 'name', headerName: 'ФИО', width: 220, editable: true },
        {
            field: 'status',
            headerName: 'Статус',
            width: 180,
            editable: true,
            type: 'singleSelect',
            valueOptions: ['На рассмотрении', 'Предварительно оплачено', 'Оплачено', 'Сдано'],
        },
        {
            field: 'datespo',
            headerName: 'Срок аренды',
            width: 180,
            editable: true,
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Действия',
            width: 200,
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                return isInEditMode
                    ? [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            onClick={handleSaveClick(id)}
                            sx={{ color: 'primary.main' }}
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
                        //<GridActionsCellItem
                        //    icon={<VisibilityIcon />}
                        //    label="View Equipment"
                        //    onClick={handleViewEquipmentClick(id)}
                        //    color="inherit"
                        ///>,
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
        console.log('Equipment updated (modal):', data);
        setEquipment(data);
        setIsEquipmentLoading(false);
    }, []);
    const htmls = `https://equpment-rent-club.ru/blank-akt-priema-peredachi2.html`;
    return (
        <Box
            sx={{
                height: 500,
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
                    slotProps={{ toolbar: { setRows, setRowModesModel } }} />
                <Modal open={openModal} onClose={handleCloseModal}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '80%',
                            maxHeight: '80vh',
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            p: 4,
                            overflow: 'auto',
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Снаряжение для заявки #{selectedRowId}
                        </Typography>
                        {selectedRow && (
                            <>
                                <Typography>ФИО: {selectedRow.name}</Typography>
                                <Typography>Статус: {selectedRow.status}</Typography>
                                <Typography>Срок аренды: {selectedRow.status}</Typography>
                            </>
                        )}
                        <AdminEquipmentTable
                            applicationId={selectedRowId}
                            onDataChange={onDataChange} />
                    </Box>
                </Modal>
                <div style={{
                    position: 'absolute',
                    left: '-9999px',
                    width: '210mm',
                    minHeight: '297mm',
                    backgroundColor: '#ffffff',
                    padding: '10mm'
                }}>
                    <Box ref={printRef}>
                        {selectedRow ? (
                            <>
                                <ActTransmission
                                    application={{ id: selectedRow.id, userFullName: selectedRow.name, date: selectedRow.date }}
                                    equipment={equipment} />
                                <div style={{ pageBreakBefore: 'always' }} />
                                <ActReception
                                    application={{ id: selectedRow.id, userFullName: selectedRow.name, date: selectedRow.date }}
                                    equipment={equipment} />
                            </>
                        ) : (
                            <Typography>Нет данных для печати</Typography>
                        )}
                    </Box>
                </div>
                {debugVisible && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        zIndex: 9999,
                        backgroundColor: '#ffffff',
                        padding: '20px',
                        border: '2px solid red'
                    }}>
                        <Typography color="error">Debug: Содержимое для печати</Typography>
                        <Box>
                            {selectedRow ? (
                                <>
                                    <ActTransmission
                                        application={{ id: selectedRow.id, userFullName: selectedRow.name, date: selectedRow.date }}
                                        equipment={equipment} />
                                    <div style={{ pageBreakBefore: 'always' }} />
                                    <ActReception
                                        application={{ id: selectedRow.id, userFullName: selectedRow.name, date: selectedRow.date }}
                                        equipment={equipment} />
                                </>
                            ) : (
                                <Typography>Нет данных для печати</Typography>
                            )}
                        </Box>
                    </div>
                )}
                <Snackbar
                    open={!!errorMessage}
                    autoHideDuration={6000}
                    onClose={() => setErrorMessage('')}
                    message={errorMessage} />
            </Box>
    );
}