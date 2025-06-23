import * as React from 'react';
import dayjs from 'dayjs';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Stack from '@mui/joy/Stack';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Textarea from '@mui/joy/Textarea';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import ButtonGroup from '@mui/joy/ButtonGroup';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';




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
            <Stack spacing={1} marginBottom={5}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <FormControl>
                  <FormLabel>Срок использования</FormLabel>
                  <SingleInputDateRangeField
                      defaultValue={[dayjs('2022-04-17'), dayjs('2022-04-21')]}
                  />
                </FormControl>
              </LocalizationProvider>
                <ButtonGroup
                    variant="soft"
                    aria-label="outlined primary button group"
                    buttonFlex="0 1 200px"
                    sx={{ width: '100%', justifyContent: 'center' }}
                >
                    <Button type="submit" sx={{ display: 'inline-block' }}>Сохранить</Button>
                    <Button type="reset" color='danger' sx={{ display: 'inline-block' }}>Отменить</Button>
                </ButtonGroup>
            </Stack>
        </form>
    );
}