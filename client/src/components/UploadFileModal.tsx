import { Box, Button, Divider, Modal, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { getApiEndpoint } from '../utils/apiUtils';
import { LoadingButton } from '@mui/lab';

interface UploadFileModalProps {
    accept?: string;
    refetchUploads: Function;
}

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const UploadFileModal = (props: UploadFileModalProps) => {
    const { refetchUploads } = props;

    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const onFileChange = (event: any) => {
        setSelectedFile(event.target.files[0]);
    };

    const onFileUpload = async () => {
        if (!selectedFile) {
            alert('select a file to upload');
            return;
        }
        const formData = new FormData();
        formData.append('file', selectedFile, selectedFile.name);
        formData.append('fileName', selectedFile.name);
        const xhr = new XMLHttpRequest();
        const apiEndpoint = getApiEndpoint();
        setIsLoading(true);
        xhr.open('POST', `${apiEndpoint}/api/upload`, true);
        xhr.onload = () => {
            if (xhr.status === 200) {
                refetchUploads();
                setIsLoading(false);
                handleClose();
            } else {
                console.error(
                    'Request failed. Returned status code ' + xhr.status,
                );
            }
        };

        xhr.send(formData);
    };

    const fileData = () => {
        if (selectedFile) {
            return (
                <Box>
                    <Typography variant="body2" gutterBottom>
                        File Name: {selectedFile.name}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        Last Modified:{' '}
                        {selectedFile.lastModifiedDate.toDateString()}
                    </Typography>
                </Box>
            );
        }

        return (
            <Typography variant="body1" gutterBottom>
                Choose a xml file before uploading
            </Typography>
        );
    };

    const acceptFormat = props.accept ?? 'text/xml';

    return (
        <>
            <Button variant="contained" onClick={handleOpen}>
                Upload payments
            </Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Stack
                    alignItems="center"
                    justifyContent="center"
                    direction="column"
                    sx={modalStyle}
                >
                    <Typography
                        id="modal-modal-title"
                        variant="h6"
                        component="h2"
                    >
                        Upload payments
                    </Typography>
                    <Divider flexItem sx={{ mb: 4 }} />
                    {fileData()}
                    <Button variant="text" component="label">
                        Browse file
                        <input
                            hidden
                            accept={acceptFormat}
                            multiple
                            type="file"
                            onChange={onFileChange}
                        />
                    </Button>
                    {isLoading && <Typography>Uploading files... This make take a few minutes</Typography>}
                    <LoadingButton
                        loading={isLoading}
                        variant="contained"
                        component="label"
                        onClick={onFileUpload}
                        sx={{ mt: 5 }}
                    >
                        Upload
                    </LoadingButton>
                </Stack>
            </Modal>
        </>
    );
};

export default UploadFileModal;
