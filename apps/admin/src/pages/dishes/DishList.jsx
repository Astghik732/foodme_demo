import { List, Datagrid, TextField, NumberField, ChipField, NumberInput, SearchInput } from 'react-admin';

const dishFilters = [
    <SearchInput key="q" source="q" alwaysOn />,
    <NumberInput key="chefId" source="chefId" label="Chef ID" />,
];

const DishList = () => (
    <List filters={dishFilters}>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="nameEn" label="Name" />
            <TextField source="chefId" label="Chef ID" />
            <NumberField source="price" options={{ style: 'currency', currency: 'AMD' }} />
            <ChipField source="status" />
            <NumberField source="priorityIndex" label="Priority" />
        </Datagrid>
    </List>
);

export default DishList;
