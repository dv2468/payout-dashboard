import { Box, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import SummarizeIcon from '@mui/icons-material/Summarize';

import { useState } from 'react';
import { ExportToCsv } from 'export-to-csv';
import { getApiEndpoint } from '../utils/apiUtils';

interface ReportMenuProps {
    uploadId: string;
    disabled?: boolean;
}

const getReportUrl = (uploadId: string, type: string) => {
    const apiEndpoint = getApiEndpoint();
    return `${apiEndpoint}/api/report/${uploadId}/${type}`;
};

const getCsvOptions = (type: string) => {
    return {
        filename: type,
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: false,
        useBom: false,
        useKeysAsHeaders: true,
    };
};

const ReportMenu = (props: ReportMenuProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleGenerateCsv = async (type: string) => {
        const response = await fetch(getReportUrl(props.uploadId, type));
        const data = await response.json();

        const csvExporter = new ExportToCsv(getCsvOptions(type));

        csvExporter.generateCsv(data);
        handleClose();
    };

    return (
        <Box>
            <Tooltip title="Generate CSV report" placement="right">
                <span>
                    <IconButton
                        id="basic-button"
                        color="primary"
                        disabled={props.disabled}
                        aria-controls={open ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleClick}
                    >
                        <SummarizeIcon />
                    </IconButton>
                </span>
            </Tooltip>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <MenuItem onClick={() => handleGenerateCsv('fund_per_source')}>
                    Report total amount of funds paid out per unique source
                    account
                </MenuItem>
                <MenuItem onClick={() => handleGenerateCsv('fund_per_branch')}>
                    Report total amount of funds paid out per Dunkin branch
                </MenuItem>
                <MenuItem
                    onClick={() => handleGenerateCsv('status_per_payment')}
                >
                    Report the status of every payment
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default ReportMenu;
