import { Box, Chip, ChipPropsColorOverrides, Tooltip } from '@mui/material';
import { OverridableStringUnion } from '@mui/types';
import MaterialReactTable, { MRT_ColumnDef } from 'material-react-table';
import PayoutSummaryModal from './PayoutSummaryModal';
import ReportMenu from './ReportMenu';

interface UploadsProps {
    data: any;
    refetchUploads: Function;
}

type UploadColumns = {
    uploadId: string;
    uplaodTime: string;
    fileName: string;
    status: string;
};

type ColorType = OverridableStringUnion<
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning',
    ChipPropsColorOverrides
>;

const StatusCell = (props: { status: string }) => {
    let title: string = '';
    let statusString: string = '';

    let color: ColorType = 'default';
    switch (props.status) {
        case 'processing_file':
            statusString = 'Processing file';
            title =
                'File being processed. This may take a while. Check again later by refreshing the page.';
            color = 'default';
            break;
        case 'ready_for_payout':
            statusString = 'Ready for payout';
            title =
                'Ready for payout. You can do so by clicking on the action button.';
            color = 'primary';

            break;
        case 'processing_payout':
            statusString = 'Processing payout';
            title =
                'Payout being processed. This may take a while. Check again later by refreshing the page.';
            color = 'secondary';

            break;
        case 'payout_complete':
            statusString = 'Payout complete';
            title =
                'Payout complete. You can now generate reports by clicking on the action button.';
            color = 'success';
    }

    return (
        <Tooltip title={title} placement="bottom">
            <Chip label={statusString} color={color} />
        </Tooltip>
    );
};

const StatusHeader = (props: { header: string }) => {
    return (
        <Tooltip title="Refresh page to get up-to-date status" placement="top">
            {<div>{props.header}</div>}
        </Tooltip>
    );
};

const UploadsTable = (props: UploadsProps) => {
    const { data } = props;

    const columns: MRT_ColumnDef<UploadColumns>[] = [
        {
            accessorKey: 'uploadId',
            header: 'Upload Id',
        },
        {
            accessorKey: 'uplaodTime',
            header: 'Upload Time',
        },
        {
            accessorKey: 'fileName',
            header: 'File Name',
        },
        {
            accessorKey: 'status',
            header: 'Status',
            Header: ({ column }) => (
                <StatusHeader header={column.columnDef.header} />
            ),
            Cell: ({ cell }) => {
                return <StatusCell status={cell.getValue() as string} />;
            },
        },
    ];
    if (!data) {
        return null;
    }
    return (
        <MaterialReactTable
            columns={columns}
            data={data}
            initialState={{ columnVisibility: { uploadId: false } }}
            enableColumnFilters={false}
            enablePagination={true}
            enableTopToolbar={false}
            enableRowActions
            renderRowActions={({ row, table }) => (
                <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
                    <ReportMenu
                        disabled={row.original.status !== 'payout_complete'}
                        uploadId={row.original.uploadId}
                    />
                    <Tooltip title="Payout" placement="right">
                        <span>
                            <PayoutSummaryModal
                                row={row}
                                uploadId={row.original.uploadId}
                                refetchUploads={props.refetchUploads}
                            />
                        </span>
                    </Tooltip>
                </Box>
            )}
        />
    );
};

export default UploadsTable;
