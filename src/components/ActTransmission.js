import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

export default function ActTransmission({ application, equipment }) {
    console.log('ActTransmission props:', { application, equipment });

    const totalRental = equipment.reduce((sum, item) => sum + item.zenapr * item.kolich, 0);
    const totalDeposit = equipment.reduce((sum, item) => sum + item.zenaz * item.kolich, 0);

    const logoPlaceholder = 'https://via.placeholder.com/150x50?text=Logo';

    return (
        <Box
            sx={{
                fontFamily: '"Times New Roman", Times, serif',
                fontSize: '14pt',
                width: '190mm',
                minHeight: '277mm',
                padding: '10mm',
                margin: '0 auto',
                backgroundColor: '#ffffff',
                color: '#000000',
            }}
        >
            <img src={logoPlaceholder} alt="Логотип" style={{ width: '50mm', height: '15mm', marginBottom: '10mm' }} />

            <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', fontSize: '16pt', mb: 2 }}>
                Акт передачи оборудования
            </Typography>
            <Typography align="center" sx={{ mb: 1 }}>
                № {application?.id || '___'} от {application?.date || '___'}
            </Typography>
            <Typography align="center" sx={{ mb: 4 }}>
                г. Москва
            </Typography>

            <Box sx={{ mb: 2 }}>
                <Typography>
                    <strong>Арендодатель:</strong> ООО "Прокат Клуб", ИНН 1234567890, КПП 123456789, адрес: г. Москва, ул. Примерная, д. 1, тел.: +7 (495) 123-45-67
                </Typography>
                <Typography>
                    <strong>Арендатор:</strong> {application?.userFullName || '___'}, паспорт: серия ____ № ____, выдан ________________, адрес регистрации: ________________
                </Typography>
            </Box>

            <Typography sx={{ mb: 2 }}>
                Арендодатель передал, а Арендатор принял следующее оборудование в аренду:
            </Typography>
            <Table
                sx={{
                    borderCollapse: 'collapse',
                    width: '100%',
                    border: '1px solid black',
                    '& th, & td': { 
                        border: '1px solid black', 
                        padding: '5px', 
                        fontSize: '14pt', 
                        color: '#333333'
                    },
                }}
            >
                <TableHead>
                    <TableRow>
                        <TableCell align="center">№</TableCell>
                        <TableCell align="center">Наименование</TableCell>
                        <TableCell align="center">Количество</TableCell>
                        <TableCell align="center">Стоимость проката (₽/день)</TableCell>
                        <TableCell align="center">Залог (₽)</TableCell>
                        <TableCell align="center">Примечание</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {equipment && equipment.length > 0 ? (
                        equipment.map((item, index) => (
                            <TableRow key={item.id}>
                                <TableCell align="center">{index + 1}</TableCell>
                                <TableCell>{item.vnaim}</TableCell>
                                <TableCell align="center">{item.kolich}</TableCell>
                                <TableCell align="right">{item.zenapr}</TableCell>
                                <TableCell align="right">{item.zenaz}</TableCell>
                                <TableCell>{item.sost}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} align="center">
                                Оборудование не указано
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <Box sx={{ mt: 2, mb: 4 }}>
                <Typography>
                    <strong>Итого:</strong> Стоимость проката: {totalRental} ₽/день, Залог: {totalDeposit} ₽
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
                <Box>
                    <Typography>
                        <strong>Арендодатель:</strong>
                    </Typography>
                    <Typography sx={{ mt: 4 }}>________________ / ________________</Typography>
                </Box>
                <Box>
                    <Typography>
                        <strong>Арендатор:</strong>
                    </Typography>
                    <Typography sx={{ mt: 4 }}>________________ / {application?.userFullName || '___'}</Typography>
                </Box>
            </Box>

            <Typography sx={{ mt: 2, fontSize: '12pt' }}>
                Примечание: Оборудование передано в исправном состоянии. Арендатор обязуется вернуть оборудование в том же состоянии, за исключением нормального износа.
            </Typography>
        </Box>
    );
}