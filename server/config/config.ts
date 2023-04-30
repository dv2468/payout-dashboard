const getConfig = () => {
    return {
        db: {
            url: process.env.MONGO_URL,
        },
        method: {
            apiKey: process.env.METHOD_API_LEY,
            callbackUrl: process.env.METHOD_WEBHOOK_URL,
        },
    };
};

export { getConfig };
