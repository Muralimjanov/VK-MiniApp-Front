import * as React from 'react';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Stack from '@mui/joy/Stack';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Textarea from '@mui/joy/Textarea';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import ButtonGroup from '@mui/joy/ButtonGroup';

export default function InputFormProps() {
    const handleChange = (event, newValue) => {
        // alert(`You chose "${newValue}"`);
    };

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const formJson = Object.fromEntries(formData.entries());
                alert(JSON.stringify(formJson));
            }}
        >
            <Stack spacing={1}>
                <FormControl>
                    <FormLabel>Категория</FormLabel>
                    <Select defaultValue="1" onChange={handleChange} required>
                        <Option value="1" selected>Горное</Option>
                        <Option value="2">Водное</Option>
                        <Option value="3">Общее</Option>
                    </Select>
                    {/*<FormHelperText>This is a helper text.</FormHelperText>*/}
                </FormControl>
                <FormControl>
                    <FormLabel>Наименование</FormLabel>
                    <Input placeholder="снаряжение" required />
                    {/*<FormHelperText>This is a helper text.</FormHelperText>*/}
                </FormControl>
                <FormControl>
                    <FormLabel>Количество</FormLabel>
                    <Input type='number' placeholder="1" />
                    {/*<FormHelperText>This is a helper text.</FormHelperText>*/}
                </FormControl>
                <FormControl>
                    <FormLabel>Залог (₽)</FormLabel>
                    <Input type='number'  placeholder="0.00" />
                    {/*<FormHelperText>This is a helper text.</FormHelperText>*/}
                </FormControl>
                <FormControl>
                    <FormLabel>Прокат (₽/день)</FormLabel>
                    <Input type='number' placeholder="0.00" />
                    {/*<FormHelperText>This is a helper text.</FormHelperText>*/}
                </FormControl>
                <FormControl>
                    <FormLabel>Состав</FormLabel>
                    <Textarea/>
                    {/*<FormHelperText>This is a helper text.</FormHelperText>*/}
                </FormControl>
                <ButtonGroup
                    variant="soft"
                    aria-label="outlined primary button group"
                    buttonFlex="0 1 200px"
                    sx={{ width: '100%', justifyContent: 'center' }}
                >
                    <Button type="submit" sx={{ display: 'inline-block' }}>Добавить</Button>
                    <Button type="reset" color='danger' sx={{ display: 'inline-block' }}>Сбросить</Button>
                </ButtonGroup>
            </Stack>
        </form>
    );
}