import { Layout, AppBar, Menu, TitlePortal } from 'react-admin';
import { Box, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

const Brand = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '10px',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
            }}
        >
            <RestaurantMenuIcon fontSize="small" />
        </Box>
        <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700 }}>
            FoodMe Admin
        </Typography>
    </Box>
);

const CustomAppBar = (props) => (
    <AppBar {...props} color="inherit">
        <Brand />
        <TitlePortal />
    </AppBar>
);

const CustomMenu = () => (
    <Menu>
        <Menu.DashboardItem primaryText="Dashboard" leftIcon={<DashboardIcon />} />
        <Menu.Item to="/orders" primaryText="Orders" leftIcon={<ShoppingCartIcon />} />
        <Menu.Item to="/chefs" primaryText="Chefs" leftIcon={<RestaurantIcon />} />
        <Menu.Item to="/dishes" primaryText="Dishes" leftIcon={<LocalDiningIcon />} />
    </Menu>
);

const AppLayout = (props) => <Layout {...props} appBar={CustomAppBar} menu={CustomMenu} />;

export default AppLayout;
