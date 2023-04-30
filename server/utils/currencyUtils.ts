export const uSDollarToCents = (amount: string) => {
    const cents = parseFloat(amount.replace('$', '')) * 100;
    return parseFloat(cents.toFixed(2));
};

export const centsToUsDollar = (cents: number) => {
    return `$${cents / 100}`;
};
