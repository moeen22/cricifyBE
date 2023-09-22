import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import otpGenerator from 'otp-generator';
import jwt from 'jsonwebtoken';
import sendMail from '../utils/sendmail.js';

const prisma = new PrismaClient();

// export const getAllOrganizers = async (req, res) => {
//     const organizers = await prisma.user.findMany({
//         where: {
//             role: 'O',
//         },
//     });

//     if (!organizers.length) {
//         res.status(404).json({ message: 'No data found' });
//     }

//     res.status(200).json({ message: 'All data' });
// };

export const add = async (req, res) => {
    let { password, email, role } = req.body;
    const otpCode = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
    });

    const result = await prisma.user.findFirst({
        where: {
            Email: email,
        },
    });

    if (result && !result.isActive) {
        const newOtp = await prisma.otp.create({
            data: {
                UserID: result.UserID,
                Code: otpCode,
            },
        });
        // we will send the otp on the mail
        await sendMail(otpCode, email);

        return res
            .status(201)
            .json({ message: 'Otp sent to your email', newOtp, user: { uid: result.UserID, email: result.Email } });
    }

    if (result) {
        return res.status(422).json({ message: 'Email allready exist' });
    }

    try {
        const hassPass = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                Email: email,
                Password: hassPass,
                Role: role,
            },
        });

        let userId = user?.UserID;
        const newOtp = await prisma.otp.create({
            data: {
                UserID: userId,
                Code: otpCode,
            },
        });
        // we will send the otp on the mail

        return res
            .status(201)
            .json({ message: 'Otp sent to your email', newOtp, user: { uid: user.UserID, email: user.Email } });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internel Server Error' });
    }
};

export const verify = async (req, res) => {
    const { email, code } = req.body;

    try {
        const currentTimestamp = new Date(); // Get current timestamp
        const gapTime = new Date(currentTimestamp.getTime() - 10 * 60 * 1000);

        const user = await prisma.user.findFirst({
            where: { Email: email },
        });

        const otpRecord = await prisma.otp.findFirst({
            where: {
                UserID: user.UserID,
                Code: code,
                Expiry: {
                    gte: gapTime,
                },
            },
            include: {
                User: true, // Include the user information
            },
        });

        if (!otpRecord) {
            return res.status(404).json({ message: 'Invalid OTP' });
        }

        await prisma.user.update({
            where: { UserID: otpRecord.UserID },
            data: { isActive: true },
        });

        const token = jwt.sign(
            {
                email: otpRecord.User.Email,
                userId: otpRecord.User.UserID,
            },
            process.env.JWT_SECRET
        );

        return res
            .status(200)
            .json({ message: 'Auth successful', data: { token, uid: user.UserID, email: user.Email } });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return res.status(500).json({ message: 'Internal Server Error', error });
    }
};

export const login = (req, res, next) => {
    const { email, password } = req.body;
    prisma.user
        .findFirst({
            where: {
                Email: email,
            },
        })
        .then((user) => {
            if (!user || !user.isActive) {
                return res.status(401).json({ message: 'Invalid Email' });
            }
            bcrypt.compare(password, user.Password, (err, result) => {
                if (err) {
                    return res.status(401).json({ message: 'Auth failed' });
                }
                if (result) {
                    const token = jwt.sign(
                        {
                            email: user.Email,
                            userId: user.UserID,
                        },
                        process.env.JWT_SECRET
                    );

                    return res
                        .status(200)
                        .json({ message: 'Auth successful', data: { token, uid: user.UserID, email: user.Email } });
                }
                return res.status(401).json({ message: 'Auth failed' });
            });
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ error: err });
        });
};

export const onBoard = async (req, res, next) => {
    const { firstName, lastName, phone, uid, address, city, state, pincode } = req.body;

    try {
        const user = await prisma.organizerDetail.findFirst({
            where: {
                UserID: uid,
            },
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        await prisma.organizerDetail.create({
            data: {
                UserID: uid,
                FirstName: firstName,
                LastName: lastName,
                Phone: phone,
            },
        });

        await prisma.address.create({
            data: {
                Line: address,
                City: city,
                StateName: state,
                Pincode: pincode,
                UserId: uid,
            },
        });
        return res.status(201).json({ message: 'You are onboarded', isActive: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internel Server Error' });
    }
};

export const isOnBoarded = async (req, res, next) => {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ message: 'Bad request' });
    try {
        const user = await prisma.organizerDetail.findFirst({
            where: {
                UserID: uid,
            },
        });
        if (user) return res.status(200).json({ message: 'User', isActive: true });
        else return res.status(200).json({ message: 'Pls fill the necessary details', isActive: false });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internel Server Error' });
    }
};

export const sendOtp = async (req, res, next) => {
    const { email } = req.body;
    const otpCode = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
    });

    try {
        const user = await prisma.user.findFirst({
            where: { Email: email },
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        const newOtp = await prisma.otp.create({
            data: {
                UserID: user.UserID,
                Code: otpCode,
            },
        });
        // we will send the otp on the mail
        await sendMail(otpCode, email);

        return res.status(201).json({ message: 'Otp sent to your email', newOtp });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internel Server Error' });
    }
};

export const resetPassVerify = async (req, res, next) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // const isValid1 = validate(res, validateTypes.PHONE, phone);
    // const isValid2 = validate(res, validateTypes.OTP, code);

    // if (isValid1.error) {
    //     return res.status(400).json({ message: isValid1.message });
    // }
    // if (isValid2.error) {
    //     return res.status(400).json({ message: isValid2.message });
    // }

    try {
        const currentTimestamp = new Date(); // Get current timestamp
        const gapTime = new Date(currentTimestamp.getTime() - 10 * 60 * 1000);

        const user = await prisma.user.findFirst({
            where: { Email: email },
        });

        if (!user || !user.isActive) {
            return res.status(404).json({ message: 'This number is not registered yet' });
        }

        const otpRecord = await prisma.otp.findFirst({
            where: {
                UserID: user.UserID,
                Code: code,
                Expiry: {
                    gte: gapTime,
                },
            },
            include: {
                User: true, // Include the user information
            },
        });

        if (!otpRecord) {
            return res.status(404).json({ message: 'Invalid OTP' });
        }

        const token = jwt.sign(
            {
                email: otpRecord.User.Email,
                userId: otpRecord.User.UserID,
            },
            process.env.JWT_SECRET_RESET
        );

        return res.status(200).json({ message: 'Otp Verified', data: { token, uid: user.UserID, email: user.Email } });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return res.status(500).json({ message: 'Internal Server Error', error });
    }
};

export const resetPass = async (req, res, next) => {
    const { uid, password, confirm } = req.body;

    // All fields are required
    if (!(password && confirm)) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // password and confirm password must be same
    if (password !== confirm) {
        return res.status(400).json({ message: 'Password not match' });
    }

    // minimum length must be 8
    if (password.length < 8) {
        return res.status(400).json({ message: 'minimum length should be 8' });
    }

    const result = await prisma.user.findUnique({
        where: {
            UserID: uid,
        },
    });

    if (!result || !result.isActive) {
        return res.status(404).json({ message: 'User not found' });
    }

    try {
        const hassPass = await bcrypt.hash(password, 10);
        const user = await prisma.user.update({
            where: {
                UserID: uid,
            },
            data: {
                Password: hassPass,
            },
        });

        // we will send the otp on the mail

        return res.status(201).json({ message: 'Password Reset', user: { uid: user.UserID, email: user.Email } });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internel Server Error' });
    }
};

export const addTrophy = async (req, res, next) => {
    const { uid, name, st_dt, en_dt, format, venue } = req.body;

    try {
        const newTrophy = await prisma.trophy.create({
            data: {
                TrophyName: name,
                OrganizerID: uid,
                StartDate: st_dt,
                EndDate: en_dt,
                Format: format,
                Venue: venue,
            },
        });
        return res.status(201).json({ message: 'Trophy added', newTrophy });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internel server error' });
    }
};

export const deleteTrophy = async (req, res, next) => {};

export const trophyDetails = async (req, res, next) => {
    const { uid, trophyId } = req.body;
};

export const allTrophies = async (req, res, next) => {
    const { uid } = req.query;

    try {
        const allTrophies = await prisma.trophy.findMany({
            where: {
                OrganizerID: uid,
            },
        });
        console.log(allTrophies);
        // if (!allTrophies.length) return res.status(404).json({ message: 'Data not found', allTrophies });
        return res.status(201).json({ message: 'All trophies', allTrophies });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internel server error' });
    }
};
