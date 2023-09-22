import { format, differenceInYears, differenceInDays, parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import enGB from 'date-fns/locale/en-GB/index.js';

export function calculateAgeInDays(dob) {
    const dobDate = new Date(dob);
    const currentDate = new Date();

    const ageYears = differenceInYears(currentDate, dobDate);
    const remainingDays = differenceInDays(currentDate, dobDate);
    const cappedRemainingDays = remainingDays;

    return `${ageYears} yr ${cappedRemainingDays} d`;
}

export const convertDate = (inputDateString) => {
    const inputDate = new Date(inputDateString);
    return format(inputDate, 'd MMM yyyy', { locale: enGB });
    // Output: "ex. 3 Aug 2023"
};

export const getDay = (inputDateString) => {
    return format(inputDateString, 'EEEE');
};

export const getTime = (inputDateString) => {
    const hours = inputDateString.getUTCHours();
    const minutes = inputDateString.getUTCMinutes();

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const indianTime = (inputDateString) => {
    const indianTimeZone = 'Asia/Kolkata';

    const indianDate = utcToZonedTime(inputDateString, indianTimeZone);

    // const formattedDate = format(indianDate, 'yyyy-MM-dd HH:mm', { timeZone: indianTimeZone });
    return indianDate;
};
