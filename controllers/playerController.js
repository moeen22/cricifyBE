import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const addPlayer = async (req, res, next) => {
    const { fname, lname, phone, teamId, battingStyle, bowlingStyle, role, dob, uid } = req.body;
    const Image = req?.file?.path;

    console.log(Image);
    let newDob = '';
    if (dob) {
        newDob = new Date(dob);
    }

    if (!fname || !lname || !phone) return res.status(400).json({ message: 'Bad Request' });

    const player =
        await prisma.$queryRaw`select Player.PlayerID,Player.FirstName,Player.LastName from Trophy left join TeamTrophy on TeamTrophy.TrophyID=Trophy.TrophyID
        inner join Team on TeamTrophy.TeamID=Team.TeamId
        inner join PlayerTeam on PlayerTeam.TeamID=Team.TeamID
        inner join Player on Player.PlayerID=PlayerTeam.PlayerID
        where Trophy.OrganizerID=${uid} and  Player.Phone=${phone}`;

    // console.log(player);

    if (player.length) return res.status(422).json({ message: 'Player Already Exist with this no.' });

    try {
        const newPlayer = await prisma.player.create({
            data: {
                Phone: phone,
                FirstName: fname,
                LastName: lname,
                BattingStyle: battingStyle || null,
                BowlingStyle: bowlingStyle || null,
                Role: role || null,
                DOB: newDob || null,
                Image: Image || null,
            },
        });

        if (teamId)
            await prisma.playerTeam.create({
                data: {
                    PlayerID: newPlayer.PlayerID,
                    TeamID: teamId,
                },
            });

        return res.status(201).json({ message: 'Player Added' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internel Server Error' });
    }
};

export const getPlaying11 = async (req, res, next) => {
    const { matchId, teamId } = req.query;

    if (!teamId || !matchId) return res.status(400).json({ message: 'bad request' });

    try {
        const playing11 = await prisma.playing11.findMany({
            where: {
                MatchID: matchId,
                TeamID: teamId,
            },
            include: {
                Playing11Player: {
                    include: {
                        Player: true,
                    },
                },
            },
        });

        const response = playing11[0].Playing11Player.map((item) => item.Player);

        if (!playing11[0].Playing11Player.length) return res.status(404).json({ message: 'No Player Found' });

        return res.status(200).json({ message: 'All Players', data: response });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internel Server Error' });
    }
};

export const getAllTeamPlayers = async (req, res, next) => {
    const { teamId } = req.query;

    if (!teamId) return res.status(400).json({ message: 'bad request' });

    try {
        const allPlayers = await prisma.playerTeam.findMany({
            where: {
                TeamID: teamId,
            },
            include: {
                Player: true,
            },
        });

        if (!allPlayers.length) return res.status(404).json({ message: 'No Player Found' });

        return res.status(200).json({ message: 'All Players', data: allPlayers });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internel Server Error' });
    }
};

export const getAllPlayer = async (req, res, next) => {
    const { uid } = req.query;

    if (!uid) return res.status(400).json({ message: 'bad request' });

    try {
        // const allPlayers = await prisma.trophy.findMany({
        //     where: {
        //         OrganizerID: uid,
        //         Teams: {
        //             some: {
        //                 PlayerTeam: {
        //                     some: {},
        //                 },
        //             },
        //         },
        //     },
        //     include: {
        //         Teams: {
        //             include: {
        //                 PlayerTeam: {
        //                     include: {
        //                         Player: {
        //                             select: {
        //                                 PlayerID: true,
        //                                 FirstName: true,
        //                                 LastName: true,
        //                             },
        //                         },
        //                     },
        //                 },
        //             },
        //         },
        //     },
        // });

        const allPlayers = await prisma.$queryRaw`select Player.PlayerID,Player.FirstName,Player.LastName from Trophy
            left join TeamTrophy on TeamTrophy.TrophyID=Trophy.TrophyID
            inner join Team on TeamTrophy.TeamID=Team.TeamId
            inner join PlayerTeam on PlayerTeam.TeamID=Team.TeamID
            inner join Player on Player.PlayerID=PlayerTeam.PlayerID
            where Trophy.OrganizerID=${uid}`;

        if (!allPlayers.length) return res.status(404).json({ message: 'No Player Found' });

        return res.status(200).json({ message: 'All Players', data: allPlayers });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internel Server Error' });
    }
};

// const isPlayerExist = await prisma.player.findFirst({
//     where: {
//         FirstName: fname,
//         LastName: lname,
//     },
// });

// if (isPlayerExist) return res.status(400).json({ message: 'Player Already Exist' });

// if (isCaptain === '1' || isCaptain === 1) {
//     const isCaptainExist = await prisma.player.findFirst({
//         where: {
//             TeamID: teamId,
//             IsCaptain: true,
//         },
//     });

//     if (isCaptainExist) return res.status(400).json({ message: 'Captain Already Exist' });
// }

// if (isViseCaptain === '1' || isViseCaptain === 1) {
//     const isViseCaptainExist = await prisma.player.findFirst({
//         where: {
//             TeamID: teamId,
//             IsViseCaptain: true,
//         },
//     });

//     if (isViseCaptainExist) return res.status(400).json({ message: 'Vise Captain Already Exist' });
// }

// if (isWicketKeeper === '1' || isWicketKeeper === 1) {
//     const isWicketKeeperExist = await prisma.player.findFirst({
//         where: {
//             TeamID: teamId,
//             IsWicketKeeper: true,
//         },
//     });

//     if (isWicketKeeperExist) return res.status(400).json({ message: 'Wicket Keeper Already Exist' });
// }

// // console.log(req.body);

// if (!fname || !teamId || !lname || !isWicketKeeper || !isCaptain || !isViseCaptain || !Image)
//     return res.status(400).json({ message: 'bad request' });
