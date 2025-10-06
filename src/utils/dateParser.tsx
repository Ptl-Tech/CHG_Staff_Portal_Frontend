import moment from "moment";

export const parseDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    if (moment(dateStr, 'MM/DD/YY', true).isValid()) {
        return moment(dateStr, 'MM/DD/YY'); 
    }
    if (moment(dateStr, moment.ISO_8601, true).isValid()) {
        return moment(dateStr, 'DD/MM/YYYY'); 
    }
    return null; 
};
