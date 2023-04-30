import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import UploadFileModal from './UploadFileModal';
import UploadsTable from './UploadsTable';
import { useEffect, useState } from 'react';
import { getApiEndpoint } from '../utils/apiUtils';

const Header = () => {
    return (
        <AppBar color="transparent" position="static">
            <Toolbar>
                <Typography variant="h6" component="div">
                    Payout Dashboard
                </Typography>
            </Toolbar>
        </AppBar>
    );
};
const PayoutDashboard = () => {
    const [uploadsData, setUploadsData] = useState();

    const fetchUploads = async () => {
        const apiEndpoint = getApiEndpoint();
        const res = await fetch(`${apiEndpoint}/api/uploads`);
        const data = await res.json();
        setUploadsData(data);
        return data;
    };
    useEffect(() => {
        const fetchData = async () => {
            await fetchUploads();
        };

        fetchData();
    }, []);
    return (
        <Box sx={{ flexGrow: 1 }}>
            <Header />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row-reverse',
                    p: 1,
                    m: 1,
                }}
            >
                <UploadFileModal refetchUploads={fetchUploads} />
            </Box>
            <UploadsTable data={uploadsData} refetchUploads={fetchUploads} />
        </Box>
    );
};

export default PayoutDashboard;
