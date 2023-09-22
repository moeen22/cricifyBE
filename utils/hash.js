import bcrypt from 'bcrypt';

export const hashedPassword = async (pass) => {
    try {
        const saltRounds = 10;
        const hash = await bcrypt.hash(pass, saltRounds);
        return hash;
    } catch (error) {
        throw error;
    }
};

export const comparePassword = async (pass, hash) => {
    try {
        const result = await bcrypt.compare(password, hash);
        return result;
    } catch (error) {
        throw error;
    }
};
