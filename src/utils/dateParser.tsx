import moment from "moment";

export const parseDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    if (moment(dateStr, 'MM/DD/YY', true).isValid()) {
        return moment(dateStr, 'MM/DD/YY'); // backend short format
    }
    if (moment(dateStr, moment.ISO_8601, true).isValid()) {
        return moment(dateStr); // backend ISO datetime
    }
    return null; // fallback for invalid
};
