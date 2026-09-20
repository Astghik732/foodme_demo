import { defaultTheme } from 'react-admin';

// A single custom theme applied via <Admin theme={...}> so every screen —
// lists, edit forms, the show view, and the dashboard — inherits the same
// look without per-page styling. Warm food-brand accent, soft neutral
// surfaces, rounded corners, and low shadows for a modern SaaS feel.

const brand = {
    main: '#F97316', // warm amber/orange
    light: '#FDBA74',
    dark: '#C2560F',
    contrastText: '#ffffff',
};

const foodmeTheme = {
    ...defaultTheme,
    palette: {
        ...defaultTheme.palette,
        mode: 'light',
        primary: brand,
        secondary: {
            main: '#0F766E', // teal, complements the amber
            light: '#5EEAD4',
            dark: '#0B4F49',
            contrastText: '#ffffff',
        },
        background: {
            default: '#F8FAFC',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#1E293B',
            secondary: '#64748B',
        },
        divider: '#E2E8F0',
        success: { main: '#16A34A' },
        warning: { main: '#D97706' },
        error: { main: '#DC2626' },
        info: { main: '#2563EB' },
    },
    shape: {
        borderRadius: 12,
    },
    typography: {
        fontFamily: 'Inter, system-ui, "Segoe UI", Roboto, sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 700 },
        h4: { fontWeight: 700 },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 600 },
        subtitle2: { fontWeight: 600 },
        button: { fontWeight: 600, textTransform: 'none' },
    },
    components: {
        ...defaultTheme.components,
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 'none',
                },
            },
            defaultProps: {
                disableElevation: true,
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#FFFFFF',
                    color: '#1E293B',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
                    backgroundImage: 'none',
                },
            },
        },
        RaDatagrid: {
            styleOverrides: {
                root: {
                    '& .RaDatagrid-headerCell': {
                        backgroundColor: '#F1F5F9',
                        fontWeight: 700,
                        color: '#475569',
                    },
                    '& .RaDatagrid-row': {
                        transition: 'background-color 120ms ease',
                    },
                    '& .RaDatagrid-row:hover': {
                        backgroundColor: '#FFF7ED',
                    },
                },
            },
        },
        RaLayout: {
            styleOverrides: {
                root: {
                    '& .RaLayout-content': {
                        backgroundColor: '#F8FAFC',
                    },
                },
            },
        },
    },
};

export default foodmeTheme;
export { brand };
