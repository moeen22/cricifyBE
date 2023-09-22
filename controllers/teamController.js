import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const addTeam = async (req, res, next) => {
    const { name, trophyId, shortName, uid } = req.body;
    const Image = req.file.path;

    // console.log(req.body);

    if (!name || !trophyId) return res.status(400).json({ message: 'Bad request' });

    try {
        const newTeam = await prisma.team.create({
            data: {
                TeamName: name,
                ShortName: shortName,
                Image: Image,
            },
        });

        await prisma.teamTrophy.create({
            data: {
                TeamID: newTeam.TeamID,
                TrophyID: trophyId,
            },
        });

        return res.status(201).json({ message: 'Team Added' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internel Server Error' });
    }
};

export const getAllTeam = async (req, res, next) => {
    const { trophyId } = req.query;

    if (!trophyId) return res.status(400).json({ message: 'bad request' });

    try {
        const allTeams = await prisma.teamTrophy.findMany({
            where: {
                TrophyID: trophyId,
            },
            include: {
                Team: {
                    include: {
                        PlayerTeam: true,
                    },
                },
            },
        });

        if (!allTeams.length) return res.status(404).json({ message: 'No Team Found' });
        const newAllTeams = allTeams.map((item) => {
            return {
                TeamID: item?.Team?.TeamID,
                TeamName: item?.Team?.TeamName,
                Image: item?.Team?.Image,
                TotalPlayers: item?.Team?.PlayerTeam?.length,
            };
        });

        return res.status(200).json({ message: 'All Teams', data: newAllTeams, count: allTeams.length });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internel Server Error' });
    }
};
