import {
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    SelectInput,
} from 'react-admin';

const statusChoices = [
    { id: 'ACTIVE', name: 'ACTIVE' },
    { id: 'INACTIVE', name: 'INACTIVE' },
];

const DishEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="nameEn" label="Name" fullWidth />
            <TextInput source="descriptionEn" label="Description" fullWidth multiline minRows={2} />
            <TextInput source="portionEn" label="Portion" />
            <NumberInput source="price" />
            <NumberInput source="minimumOrderCount" label="Minimum order count" />
            <NumberInput source="priorityIndex" label="Priority index" />
            <SelectInput source="status" choices={statusChoices} />
            <NumberInput source="chefId" label="Chef ID" disabled />
        </SimpleForm>
    </Edit>
);

export default DishEdit;
