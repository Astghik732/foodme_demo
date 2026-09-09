import { Layout, AppBar, Menu } from 'react-admin';
import { Typography } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalDiningIcon from '@mui/icons-material/LocalDining';

const CustomAppBar = (props) => (
    <AppBar {...props}>
        <Typography variant="h6" color="inherit" sx={{ flex: 1, fontWeight: 600 }}>
            FoodMe Admin
        </Typography>
    </AppBar>
);

const CustomMenu = () => (
    <Menu>
        <Menu.Item to="/orders" primaryText="Orders" leftIcon={<ShoppingCartIcon />} />
        <Menu.Item to="/chefs" primaryText="Chefs" leftIcon={<RestaurantIcon />} />
        <Menu.Item to="/dishes" primaryText="Dishes" leftIcon={<LocalDiningIcon />} />
    </Menu>
);

const AppLayout = (props) => <Layout {...props} appBar={CustomAppBar} menu={CustomMenu} />;

export default AppLayout;
