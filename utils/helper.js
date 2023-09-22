import { v4 as uuidv4 } from 'uuid';

export const generateRandomId = () => {
    return uuidv4();
};

export const incrementOver = (number) => {
    const integerPart = Math.floor(number);
    const fractionalPart = number - integerPart;

    if (fractionalPart < 0.5) {
        return (integerPart + fractionalPart + 0.1).toFixed(1);
    } else {
        return Math.ceil(number);
    }
};

export const isStrikeRotated = (runs, currBall, key) => {
    if (currBall !== 0.6 || (currBall === 0.6 && (key === 'wd' || key === 'nb' || key === 'nbe'))) {
        if (runs % 2 === 0) return false;
        else return true;
    } else {
        if (runs % 2 === 0) return true;
        else return false;
    }
};
