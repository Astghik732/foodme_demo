import { Admin, Resource } from 'react-admin';
import { SnackbarProvider } from 'notistack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalDiningIcon from '@mui/icons-material/LocalDining';

import authProvider from './providers/authProvider.js';
import dataProvider from './providers/dataProvider.js';
import AppLayout from './layout/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import foodmeTheme from './theme/theme.js';

import OrderList from './pages/orders/OrderList.jsx';
import OrderShow from './pages/orders/OrderShow.jsx';

import ChefList from './pages/chefs/ChefList.jsx';
import ChefEdit from './pages/chefs/ChefEdit.jsx';

import DishList from './pages/dishes/DishList.jsx';
import DishEdit from './pages/dishes/DishEdit.jsx';

function App() {
    return (
        <SnackbarProvider maxSnack={3}>
            {/* No basename: react-admin only honours it with an external
                BrowserRouter; with the default hash router the prop makes every
                route miss and the app renders a blank page. Hash routing
                (/backoffice/#/login) also keeps the e2e specs' /#/... URLs valid
                and needs no server-side route handling. */}
            <Admin
                title="FoodMe Admin"
                dataProvider={dataProvider}
                authProvider={authProvider}
                loginPage={LoginPage}
                layout={AppLayout}
                dashboard={Dashboard}
                theme={foodmeTheme}
                requireAuth
            >
                <Resource
                    name="orders"
                    icon={ShoppingCartIcon}
                    list={OrderList}
                    show={OrderShow}
                    recordRepresentation="number"
                />
                <Resource
                    name="chefs"
                    icon={RestaurantIcon}
                    list={ChefList}
                    edit={ChefEdit}
                    recordRepresentation="username"
                />
                <Resource
                    name="dishes"
                    icon={LocalDiningIcon}
                    list={DishList}
                    edit={DishEdit}
                    recordRepresentation="nameEn"
                />
            </Admin>
        </SnackbarProvider>
    );
}

export default App;
