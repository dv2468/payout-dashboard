import { Button, IconButton, Modal, Stack, Typography } from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';

import { useState } from 'react';
import MaterialReactTable, { MRT_ColumnDef } from 'material-react-table';
import { getApiEndpoint } from '../utils/apiUtils';

interface PayoutSummaryModalProp {
    row: any;
    uploadId: string;
    refetchUploads: Function;
}

type SaummaryColumns = {
    payor: string;
    payee: string;
    amount: string;
};

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    bgcolor: 'background.paper',
    p: 4,
};

const columns: MRT_ColumnDef<SaummaryColumns>[] = [
    {
        accessorKey: 'payor',
        header: 'Payor',
    },
    {
        accessorKey: 'payee',
        header: 'Payee',
    },
    {
        accessorKey: 'amount',
        header: 'Amount',
    },
];

const PayoutSummaryModal = (props: PayoutSummaryModalProp) => {
    const { refetchUploads } = props;

    const [open, setOpen] = useState(false);
    const handleClose = () => setOpen(false);
    const [summaryData, setSummaryData] = useState(null);
    const apiEndpoint = getApiEndpoint();

    const fetchPayoutSummary = async () => {
        const res = await fetch(
            `${apiEndpoint}/api/payout_summary/${props.uploadId}`,
        );
        const data = await res.json();
        setSummaryData(data);
        setOpen(true);
        return;
    };
    const submitPayout = async () => {
        await fetch(`${apiEndpoint}/api/payout/${props.uploadId}`, {
            method: 'POST',
        });
        refetchUploads();
        handleClose();
    };

    return (
        <>
            <IconButton
                disabled={props.row.original.status !== 'ready_for_payout'}
                color="primary"
                onClick={fetchPayoutSummary}
            >
                <PaymentIcon />
            </IconButton>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title2"
                aria-describedby="modal-modal-description2"
            >
                <Stack direction="column" sx={modalStyle}>
                    <Typography
                        id="modal-modal-title"
                        variant="h6"
                        component="h2"
                        sx={{ mb: 5 }}
                    >
                        Payout Summary
                    </Typography>
                    <MaterialReactTable
                        columns={columns}
                        data={summaryData!}
                        enableColumnActions={false}
                        enableColumnFilters={false}
                        enableSorting={false}
                        enableTopToolbar={false}
                        muiTableBodyRowProps={{ hover: false }}
                    />
                    <Stack
                        direction="row"
                        alignItems="flex-end"
                        justifyContent="flex-end"
                        spacing={3}
                        sx={{ mt: 2 }}
                    >
                        <Button variant="contained" onClick={submitPayout}>
                            Pay
                        </Button>
                        <Button variant="contained" onClick={handleClose}>
                            Cancel
                        </Button>
                    </Stack>
                </Stack>
            </Modal>
        </>
    );
};

export default PayoutSummaryModal;
