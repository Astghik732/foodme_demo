import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';

const GuestRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('token');
    const location = useLocation();

    if (isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};

GuestRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default GuestRoute;
