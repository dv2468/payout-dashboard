export const getApiEndpoint = () => {
    const host = window.location.host;
    if (host.startsWith('localhost')) {
        return 'http://localhost:5001';
    }
    return window.location.host;
};
