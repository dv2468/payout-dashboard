export const toyyyymmdd = (dateString: string): string | null => {
    const mmddyyyGroups = dateString.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    const yyyymmddGroups = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (mmddyyyGroups.length === 4) {
        return `${mmddyyyGroups[3]}-${mmddyyyGroups[1]}-${mmddyyyGroups[2]}`;
    } else if (yyyymmddGroups.length === 4) {
        return yyyymmddGroups[0];
    }
    return null;
};
