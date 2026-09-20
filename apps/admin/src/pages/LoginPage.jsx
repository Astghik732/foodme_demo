import { useState } from 'react';
import { useLogin, useNotify } from 'react-admin';
import {
    Box,
    TextField,
    Typography,
    Button,
    Paper,
    Alert,
    CircularProgress,
} from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const login = useLogin();
    const notify = useNotify();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login({ username, password });
        } catch {
            setError('Invalid username or password.');
            notify('Login failed', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #FFF7ED 0%, #F8FAFC 60%)',
                p: 2,
            }}
        >
            <Paper elevation={0} sx={{ width: '100%', maxWidth: 400, borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.10)' }}>
                <Box sx={{ bgcolor: 'primary.main', py: 3, px: 4, color: 'primary.contrastText', textAlign: 'center' }}>
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 48,
                            height: 48,
                            borderRadius: '12px',
                            bgcolor: 'rgba(255,255,255,0.18)',
                            mb: 1,
                        }}
                    >
                        <RestaurantMenuIcon />
                    </Box>
                    <Typography variant="h5" component="h1" fontWeight="700">
                        FoodMe Admin
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                        Sign in to the back office
                    </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 4 }}>
                    <TextField
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoFocus
                        fullWidth
                    />
                    <TextField
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                    />

                    {error && <Alert severity="error">{error}</Alert>}

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={!username || !password || loading}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign in'}
                    </Button>

                    <Alert severity="info" sx={{ mt: 1 }}>
                        Training sandbox — use <strong>admin</strong> / <strong>admin123</strong>
                    </Alert>
                </Box>
            </Paper>
        </Box>
    );
};

export default LoginPage;
