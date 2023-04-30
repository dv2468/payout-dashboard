const BATCH_SIZE = 500;

export const sleep = async (ms: number) =>
    await new Promise((r) => setTimeout(r, ms));

export const getBatches = (data: any[]) => {
    const batches = [];
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
        batches.push(data.slice(i, i + BATCH_SIZE));
    }
    return batches;
};
