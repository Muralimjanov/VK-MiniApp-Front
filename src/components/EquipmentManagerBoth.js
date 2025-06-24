import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Button, 
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Stack,
    Alert,
    Snackbar
} from '@mui/material';
import { 
    Save as SaveIcon, 
    Delete as DeleteIcon, 
    Visibility as ViewIcon,
    Download as DownloadIcon,
    Upload as UploadIcon
} from '@mui/icons-material';

import UserEquipmentsTable from './UserEquipmentTable';
import UserApplicationTable from './UserApplicationTable'; 
import { randomId } from '@mui/x-data-grid-generator';

const STORAGE_KEY = 'equipment_applications';

const saveApplicationsToStorage = (applications) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    } catch (error) {
        console.error('Ошибка сохранения в localStorage:', error);
    }
};

const loadApplicationsFromStorage = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Ошибка загрузки из localStorage:', error);
        return [];
    }
};


const downloadAsJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export default function EquipmentManager() {
    const [selectedItems, setSelectedItems] = useState([]);
    const [savedApplications, setSavedApplications] = useState([]);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showViewDialog, setShowViewDialog] = useState(false);
    const [applicationName, setApplicationName] = useState('');
    const [applicationDescription, setApplicationDescription] = useState('');
    const [viewingApplication, setViewingApplication] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        const saved = loadApplicationsFromStorage();
        setSavedApplications(saved);
    }, []);

    const handleAddToCart = (item) => {
        const existingItemIndex = selectedItems.findIndex(
            selectedItem => selectedItem.originalId === item.id
        );
        
        if (existingItemIndex !== -1) {
            setSelectedItems(prevItems =>
                prevItems.map((selectedItem, index) =>
                    index === existingItemIndex
                        ? { ...selectedItem, kolich: selectedItem.kolich + 1 }
                        : selectedItem
                )
            );
        } else {
            const newItem = {
                id: randomId(),
                originalId: item.id,
                vnaim: item.vnaim,
                kolich: 1,
                zenaz: item.zenaz,
                zenapr: item.zenapr,
                sost: null,
            };
            setSelectedItems(prevItems => [...prevItems, newItem]);
        }
    };

    const handleUpdateItem = (updatedItem) => {
        setSelectedItems(prevItems =>
            prevItems.map(item =>
                item.id === updatedItem.id ? updatedItem : item
            )
        );
    };

    const handleDeleteItem = (id) => {
        setSelectedItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    const handleSaveApplication = () => {
        if (!applicationName.trim()) {
            setNotification({
                open: true,
                message: 'Пожалуйста, введите название заявки',
                severity: 'error'
            });
            return;
        }

        if (selectedItems.length === 0) {
            setNotification({
                open: true,
                message: 'Заявка пуста. Добавьте товары перед сохранением.',
                severity: 'error'
            });
            return;
        }

        const newApplication = {
            id: randomId(),
            name: applicationName.trim(),
            description: applicationDescription.trim(),
            items: [...selectedItems],
            createdAt: new Date().toISOString(),
            totalCost: calculateTotalCost(),
            totalItems: selectedItems.length
        };

        const updatedApplications = [...savedApplications, newApplication];
        setSavedApplications(updatedApplications);
        saveApplicationsToStorage(updatedApplications);

        setShowSaveDialog(false);
        setApplicationName('');
        setApplicationDescription('');
        
        setNotification({
            open: true,
            message: `Заявка "${newApplication.name}" успешно сохранена!`,
            severity: 'success'
        });
    };

    const handleLoadApplication = (application) => {
        const itemsWithNewIds = application.items.map(item => ({
            ...item,
            id: randomId()
        }));
        
        setSelectedItems(itemsWithNewIds);
        setNotification({
            open: true,
            message: `Заявка "${application.name}" загружена!`,
            severity: 'success'
        });
    };

    const handleDeleteSavedApplication = (applicationId) => {
        const updatedApplications = savedApplications.filter(app => app.id !== applicationId);
        setSavedApplications(updatedApplications);
        saveApplicationsToStorage(updatedApplications);
        
        setNotification({
            open: true,
            message: 'Заявка удалена',
            severity: 'info'
        });
    };

    const handleViewApplication = (application) => {
        setViewingApplication(application);
        setShowViewDialog(true);
    };

    const handleExportApplication = (application) => {
        const filename = `заявка_${application.name}_${new Date().toISOString().split('T')[0]}.json`;
        downloadAsJSON(application, filename);
    };

    const handleExportAllApplications = () => {
        const filename = `все_заявки_${new Date().toISOString().split('T')[0]}.json`;
        downloadAsJSON(savedApplications, filename);
    };

    const handleClearCurrentApplication = () => {
        setSelectedItems([]);
        setNotification({
            open: true,
            message: 'Текущая заявка очищена',
            severity: 'info'
        });
    };

    const calculateTotalCost = () => {
        return selectedItems.reduce((total, item) => {
            const deposit = (item.zenaz || 0) * (item.kolich || 0);
            const rental = (item.zenapr || 0) * (item.kolich || 0);
            return total + deposit + rental;
        }, 0);
    };

    return (
        <Box sx={{ width: '100%', p: 2 }}>
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                    Каталог оборудования
                </Typography>
                <UserEquipmentsTable onAddToCart={handleAddToCart} />
            </Paper>

            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="h2">
                        Текущая заявка
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Box sx={{ textAlign: 'right', mr: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Позиций: {selectedItems.length}
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                                Общая стоимость: {calculateTotalCost().toLocaleString()} ₽
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleClearCurrentApplication}
                            disabled={selectedItems.length === 0}
                        >
                            Очистить
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={() => setShowSaveDialog(true)}
                            disabled={selectedItems.length === 0}
                        >
                            Сохранить заявку
                        </Button>
                    </Box>
                </Box>
                
                {selectedItems.length === 0 ? (
                    <Box sx={{ 
                        textAlign: 'center', 
                        py: 4, 
                        color: 'text.secondary',
                        fontStyle: 'italic'
                    }}>
                        Заявка пуста. Добавьте товары из каталога выше.
                    </Box>
                ) : (
                    <UserApplicationTable 
                        selectedItems={selectedItems}
                        onUpdateItem={handleUpdateItem}
                        onDeleteItem={handleDeleteItem}
                    />
                )}
            </Paper>

            <Paper elevation={2} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="h2">
                        Сохраненные заявки ({savedApplications.length})
                    </Typography>
                    {savedApplications.length > 0 && (
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleExportAllApplications}
                            size="small"
                        >
                            Экспорт всех
                        </Button>
                    )}
                </Box>

                {savedApplications.length === 0 ? (
                    <Box sx={{ 
                        textAlign: 'center', 
                        py: 3, 
                        color: 'text.secondary',
                        fontStyle: 'italic'
                    }}>
                        Нет сохраненных заявок
                    </Box>
                ) : (
                    <List>
                        {savedApplications.map((application) => (
                            <ListItem key={application.id} divider>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {application.name}
                                            </Typography>
                                            <Chip 
                                                label={`${application.totalItems} поз.`} 
                                                size="small" 
                                                color="primary" 
                                                variant="outlined"
                                            />
                                            <Chip 
                                                label={`${application.totalCost.toLocaleString()} ₽`} 
                                                size="small" 
                                                color="success" 
                                                variant="outlined"
                                            />
                                        </Box>
                                    }
                                    secondary={
                                        <Box>
                                            {application.description && (
                                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                    {application.description}
                                                </Typography>
                                            )}
                                            <Typography variant="caption" color="text.secondary">
                                                Создано: {new Date(application.createdAt).toLocaleString('ru-RU')}
                                            </Typography>
                                        </Box>
                                    }
                                />
                                <ListItemSecondaryAction>
                                    <Stack direction="row" spacing={1}>
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleViewApplication(application)}
                                            size="small"
                                            title="Просмотр"
                                        >
                                            <ViewIcon />
                                        </IconButton>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleLoadApplication(application)}
                                        >
                                            Загрузить
                                        </Button>
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleExportApplication(application)}
                                            size="small"
                                            title="Экспорт"
                                        >
                                            <DownloadIcon />
                                        </IconButton>
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleDeleteSavedApplication(application.id)}
                                            size="small"
                                            color="error"
                                            title="Удалить"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Stack>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Paper>

            <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Сохранить заявку</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Название заявки *"
                        fullWidth
                        variant="outlined"
                        value={applicationName}
                        onChange={(e) => setApplicationName(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Описание (необязательно)"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={applicationDescription}
                        onChange={(e) => setApplicationDescription(e.target.value)}
                    />
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Позиций в заявке: {selectedItems.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Общая стоимость: {calculateTotalCost().toLocaleString()} ₽
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowSaveDialog(false)}>Отмена</Button>
                    <Button onClick={handleSaveApplication} variant="contained">
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={showViewDialog} onClose={() => setShowViewDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {viewingApplication?.name}
                </DialogTitle>
                <DialogContent>
                    {viewingApplication && (
                        <Box>
                            {viewingApplication.description && (
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    {viewingApplication.description}
                                </Typography>
                            )}
                            
                            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                                <Chip 
                                    label={`Позиций: ${viewingApplication.totalItems}`} 
                                    color="primary" 
                                />
                                <Chip 
                                    label={`Стоимость: ${viewingApplication.totalCost.toLocaleString()} ₽`} 
                                    color="success" 
                                />
                                <Chip 
                                    label={`Создано: ${new Date(viewingApplication.createdAt).toLocaleDateString('ru-RU')}`} 
                                    variant="outlined" 
                                />
                            </Box>

                            <Typography variant="h6" sx={{ mb: 1 }}>Состав заявки:</Typography>
                            <List>
                                {viewingApplication.items.map((item, index) => (
                                    <ListItem key={index} divider>
                                        <ListItemText
                                            primary={item.vnaim}
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2">
                                                        Количество: {item.kolich} | 
                                                        Залог: {(item.zenaz || 0).toLocaleString()} ₽ | 
                                                        Прокат: {(item.zenapr || 0).toLocaleString()} ₽/день
                                                    </Typography>
                                                    {item.sost && (
                                                        <Typography variant="body2" color="text.secondary">
                                                            Состав: {item.sost}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <Typography variant="body2" fontWeight="bold">
                                                {((item.zenaz || 0) + (item.zenapr || 0)) * item.kolich} ₽
                                            </Typography>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => handleLoadApplication(viewingApplication)}
                        variant="outlined"
                    >
                        Загрузить в редактор
                    </Button>
                    <Button onClick={() => setShowViewDialog(false)}>Закрыть</Button>
                </DialogActions>
            </Dialog>

            {/* Уведомления */}
            <Snackbar 
                open={notification.open} 
                autoHideDuration={4000} 
                onClose={() => setNotification({ ...notification, open: false })}
            >
                <Alert 
                    onClose={() => setNotification({ ...notification, open: false })} 
                    severity={notification.severity}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}