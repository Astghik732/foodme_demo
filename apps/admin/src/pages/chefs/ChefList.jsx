import { List, Datagrid, TextField, NumberField, ChipField, SearchInput } from 'react-admin';

const chefFilters = [
    <SearchInput key="q" source="q" alwaysOn />,
];

const ChefList = () => (
    <List filters={chefFilters}>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="username" />
            <TextField source="phoneNumber" label="Phone" />
            <NumberField source="rating" />
            <ChipField source="status" />
            <NumberField source="deliveryPrice" label="Delivery price" options={{ style: 'currency', currency: 'AMD' }} />
            <NumberField source="freeDeliveryFrom" label="Free delivery from" options={{ style: 'currency', currency: 'AMD' }} />
        </Datagrid>
    </List>
);

export default ChefList;
