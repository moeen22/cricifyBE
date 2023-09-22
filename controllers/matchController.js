import { parseISO, format } from 'date-fns/index.js';
import { PrismaClient } from '@prisma/client';
import { convertDate, getDay, getTime, indianTime } from '../utils/date.js';
import { generateRandomId, incrementOver, isStrikeRotated } from '../utils/helper.js';

const prisma = new PrismaClient();

export const addMatch = async (req, res, next) => {
    const { team1, team2, trophyId, ground, date, time } = req.body;
    if (!team1 || !team2 || !trophyId || !ground || !date || !time)
        return res.status(400).json({ message: 'Bad request' });

    try {
        const allMatch = await prisma.match.findMany({
            where: {
                TrophyID: trophyId,
            },
        });

        const matchNum = allMatch ? allMatch.length + 1 : 99999;

        await prisma.match.create({
            data: {
                TrophyID: trophyId,
                Team1ID: team1,
                Team2ID: team2,
                Ground: ground,
                MatchDate: new Date(date + ':00.000Z'),
                MatchTime: new Date(date + ':00.000Z'),
                Result: 'Match has to be start',
                MatchStatus: 0,
                MatchNumber: matchNum,
            },
        });

        return res.status(201).json({ message: 'Match Added' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internel Server Error' });
    }
};

export const getAllMatches = async (req, res, next) => {
    const { trophyId } = req.query;

    if (!trophyId) return res.status(400).json({ message: 'bad request' });

    try {
        const allMatch = await prisma.match.findMany({
            where: {
                TrophyID: trophyId,
            },
            include: {
                Team1: true,
                Team2: true,
            },
        });

        const responseData = allMatch.map((item) => {
            return {
                MatchID: item.MatchID,
                Date: convertDate(item.MatchTime),
                Day: getDay(item.MatchTime),
                Time: getTime(item.MatchTime),
                Team1name: item.Team1.TeamName,
                Team1ID: item.Team1ID,
                Team2ID: item.Team2ID,
                Team2name: item.Team2.TeamName,
                Team1short: item.Team1.ShortName,
                Team2short: item.Team2.ShortName,
                Result: item.Result,
                Ground: item.Ground,
            };
        });

        if (!allMatch.length) return res.status(404).json({ message: 'No Team Found' });

        return res.status(200).json({ message: 'All Teams', data: responseData, count: allMatch.length });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internel Server Error' });
    }
};

export const getMatchDetails = async (req, res, next) => {
    const { matchId } = req.query;

    if (!matchId) return res.status(400).json({ message: 'bad request' });

    try {
        const match = await prisma.match.findFirst({
            where: {
                MatchID: matchId,
            },
            include: {
                Team1: true,
                Team2: true,
            },
        });

        const responseData = {
            MatchID: match.MatchID,
            Date: convertDate(match.MatchTime),
            Day: getDay(match.MatchTime),
            Time: getTime(match.MatchTime),
            Team1name: match.Team1.TeamName,
            Team1ID: match.Team1ID,
            Team2ID: match.Team2ID,
            TossWin: match.TossWin,
            Result: match.Result,
            Team2name: match.Team2.TeamName,
            Team1short: match.Team1.ShortName,
            Team2short: match.Team2.ShortName,
            Team1Img: match.Team1.Image,
            Team2Img: match.Team2.Image,
            Result: match.Result,
            Ground: match.Ground,
        };

        if (!match) return res.status(404).json({ message: 'No match Found' });

        return res.status(200).json({ message: 'Match', data: responseData });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internel Server Error' });
    }
};

export const scorecard = async (req, res, next) => {
    const { matchId } = req.query;

    try {
        const response = await prisma.match.findUnique({
            where: {
                MatchID: matchId,
            },
            include: {
                Innings: {
                    include: {
                        CurrentBatsmanOnStrike: true,
                        CurrentBatsmanNonStrike: true,
                        CurrBowlerStrike: true,
                        Scorecards: true,
                        Over: {
                            include: {
                                Balls: true,
                            },
                        },
                    },
                },
            },
        });
        return res.status(201).json({ message: 'Scorecard', response });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internel Server Error' });
    }
};

export const addInning = async (req, res, next) => {
    const { matchId, battingTeamId, bowlingTeamId, playerOnStrike, playerNonStrike, bowler } = req.body;

    if (!matchId || !battingTeamId || !bowlingTeamId || !playerOnStrike || !playerNonStrike || !bowler)
        return res.status(400).json({
            message: 'bad requested',
            // data: { matchId, battingTeamId, bowlingTeamId, playerOnStrike, playerNonStrike, bowler: bowler },
        });
    const inningId = generateRandomId();
    const playerInningId1 = generateRandomId();
    const playerInningId2 = generateRandomId();

    try {
        const currInnings = await prisma.innings.findMany({
            where: {
                MatchID: matchId,
            },
        });

        const matchStatus = currInnings.length === 0 ? 2 : 4;

        await prisma.$transaction([
            prisma.innings.create({
                data: {
                    InningsID: inningId,
                    MatchID: matchId,
                    BattingTeamID: battingTeamId,
                    BowlingTeamID: bowlingTeamId,
                    BatsmanStrikeId: playerOnStrike,
                    BatsmanNonStrikeId: playerNonStrike,
                    CurrBowlerId: bowler,
                    TotalRuns: 0,
                    TotalWickets: 0,
                    CurrOver: 0.0,
                },
            }),

            prisma.playerInning.createMany({
                data: [
                    {
                        PlayerInningID: playerInningId1,
                        InningsID: inningId,
                        PlayerID: playerOnStrike,
                        Status: 'In',
                    },
                    {
                        PlayerInningID: playerInningId2,
                        InningsID: inningId,
                        PlayerID: playerNonStrike,
                        Status: 'In',
                    },
                ],
            }),

            prisma.scorecard.createMany({
                data: [
                    {
                        InningsID: inningId,
                        PlayerInningID: playerInningId1,
                        RunsScored: 0,
                        BallsFaced: 0,
                        Sixes: 0,
                        Fours: 0,
                    },
                    {
                        InningsID: inningId,
                        PlayerInningID: playerInningId2,
                        RunsScored: 0,
                        BallsFaced: 0,
                        Sixes: 0,
                        Fours: 0,
                    },
                ],
            }),

            prisma.over.create({
                data: {
                    InningsID: inningId,
                    BowlerID: bowler,
                    OverNumber: 1,
                    MaidenOver: false,
                    RunsConceded: 0,
                    WicketsTaken: 0,
                    Extras: 0,
                },
            }),

            prisma.match.update({
                where: {
                    MatchID: matchId,
                },
                data: {
                    MatchStatus: matchStatus,
                },
            }),
        ]);

        return res.status(201).json({ message: 'Inning Added', InningsID: inningId });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internel Server Error' });
    }
};

export const getInnings = async (req, res, next) => {
    const { matchId } = req.query;
    const response = await prisma.innings.findMany({
        where: {
            MatchID: matchId,
            InningEnded: false,
        },
    });

    try {
        return res.status(201).json({ message: 'Inning Details', data: response });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internel Server Error' });
    }
};

export const getScorecard = async (req, res, next) => {
    const { inningId } = req.query;

    try {
        const response = await prisma.$queryRaw`
        select I.TotalRuns,I.TotalWickets,I.CurrOver,M.Result,M.MatchID,M.MatchStatus,
        T1.TeamName as BattingTeam,T1.ShortName as BattingCode, T1.TeamID as Team1ID,T2.TeamID as Team2ID,T2.ShortName as BowlingCode,T2.TeamName as BowlingTeam, 
        S1.RunsScored as S1Runs,S1.BallsFaced as S1Balls,S1.Sixes as S1_6s, S1.Fours as S1_4s,
        S2.RunsScored as S2Runs,S2.BallsFaced as S2Balls,S2.Sixes as S2_6s, S2.Fours as S2_4s,
        concat(P1.FirstName, " ", P1.LastName) as P1Name,
        concat(P2.FirstName , " " , P2.LastName) as P2Name,
        concat(P3.FirstName , " " , P3.LastName) as P3Name,
        P1.PlayerID as P1ID,P2.PlayerID as P2ID,P3.PlayerID as P3ID
        from Innings as I
        inner join \`Match\` as M on M.MatchID=I.MatchID
        inner join Team as T1 on T1.TeamID=I.BattingTeamID
        inner join Team as T2  on T2.TeamID=I.BowlingTeamID
        inner join PlayerInning as PI1 on PI1.InningsID=I.InningsID and PI1.PlayerID=I.BatsmanStrikeId
        inner join PlayerInning as PI2 on PI2.InningsID=I.InningsID and PI2.PlayerID=I.BatsmanNonStrikeId
        inner join Scorecard as S1 on S1.PlayerInningID=PI1.PlayerInningID
        inner join Scorecard as S2 on S2.PlayerInningID=PI2.PlayerInningID
        inner join Player as P1 on P1.PlayerID=I.BatsmanStrikeId
        inner join Player as P2 on P2.PlayerID=I.BatsmanNonStrikeId
        inner join Player as P3 on P3.PlayerID=I.CurrBowlerId
        where I.InningsID=${inningId}
;
        `;

        const matchDetails = await prisma.innings.findMany({
            where: {
                MatchID: response[0].MatchID,
            },
        });

        const yetToBat =
            await prisma.$queryRaw`select Player.PlayerID,Player.FirstName,Player.LastName,Player.Image from Playing11 
                inner join Playing11Player on Playing11Player.Playing11ID=Playing11.Playing11ID 
                inner join Player on Playing11Player.PlayerID=Player.PlayerID
                where Playing11.TeamID=${response[0]?.Team1ID} and Playing11Player.PlayerID!=${response[0]?.P1ID}
                and Playing11Player.PlayerID!=${response[0]?.P2ID}
                and Playing11.MatchID=${response[0]?.MatchID} and Playing11Player.PlayerID not in ( 
                select PlayerID from \`Out\`)`;

        const bowlerStats = await prisma.$queryRaw`SELECT
            O.BowlerID AS CurrBowlerID,
            COUNT(O.OverID) AS TotalOvers,
            SUM(CASE WHEN O.MaidenOver = 1 THEN 1 ELSE 0 END) AS TotalMaidenOvers,
            SUM(O.RunsConceded) AS TotalRuns,
            SUM(O.WicketsTaken) AS TotalWickets,
            B.BallID,B.OverID,B.RunsScored,B.WicketTaken,B.Extras,B.BallNumber
        FROM
            \`Over\` AS O
        INNER JOIN
            Innings AS I ON I.InningsID = O.InningsID
        LEFT JOIN (
            SELECT
                BallID,OverID,RunsScored,WicketTaken,Extras,BallNumber
            FROM
                Ball
        ) AS B ON B.OverID = O.OverID
        WHERE
            I.InningsID = ${inningId}
            AND O.BowlerID = (
                SELECT
                    CurrBowlerId
                FROM
                    Innings
                WHERE
                    InningsID = ${inningId}
            )
        GROUP BY
            O.BowlerID, B.BallID, B.OverID, B.RunsScored, B.WicketTaken, B.Extras
        ORDER BY
            B.BallNumber DESC
        `;

        const formattedResults = bowlerStats.map((result) => ({
            ...result,
            TotalOvers: Number(result.TotalOvers),
        }));

        // console.log(bowlerStats);

        return res.status(200).json({
            message: 'Scorecard',
            data: {
                score: response,
                overs: formattedResults,
                yetToBat,
                target: response[0].MatchStatus > 2 ? matchDetails[1].TotalRuns : NaN,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internel Server Error' });
    }
};

const updateScoreCardFunc = async (req, res, next) => {
    let { inningsId, runs, ball, key, newBowlerId } = req.body;
    runs = Number(runs);
    ball = Number(ball);

    // key can be 1.wd(wide) 2.nb(no ball) 3.nbe(no ball extra means when player miss the no ball) 4.lb(lag by) 5.bys(byes) 6.f(fair)
    // if over will change then we will pass bowlerId
    if (!(inningsId && runs !== null && runs !== undefined && ball !== null && ball !== undefined && key))
        return res.status(400).json({ message: 'bad request' });
    const currData = await prisma.$queryRaw`
        select I.TotalRuns,I.TotalWickets,I.CurrOver,M.Result,M.MatchStatus,M.MatchID,
        T1.TeamName as BattingTeam, T1.TeamID as Team1ID,T2.TeamID as Team2ID,T2.TeamName as BowlingTeam, 
        S1.ScorecardID as S1_ID,S1.RunsScored as S1Runs,S1.BallsFaced as S1Balls,S1.Sixes as S1_6s, S1.Fours as S1_4s,
        S2.RunsScored as S2Runs,S2.BallsFaced as S2Balls,S2.Sixes as S2_6s, S2.Fours as S2_4s,
        concat(P1.FirstName, " ", P1.LastName) as P1Name,
        concat(P2.FirstName , " " , P2.LastName) as P2Name,
        concat(P3.FirstName , " " , P3.LastName) as P3Name,
        P1.PlayerID as P1ID,P2.PlayerID as P2ID,P3.PlayerID as P3ID,
        O.OverID 
        from Innings as I
        inner join \`Match\` as M on M.MatchID=I.MatchID
        inner join Team as T1 on T1.TeamID=I.BattingTeamID
        inner join Team as T2  on T2.TeamID=I.BowlingTeamID
        inner join PlayerInning as PI1 on PI1.InningsID=I.InningsID and PI1.PlayerID=I.BatsmanStrikeId
        inner join PlayerInning as PI2 on PI2.InningsID=I.InningsID and PI2.PlayerID=I.BatsmanNonStrikeId
        inner join Scorecard as S1 on S1.PlayerInningID=PI1.PlayerInningID
        inner join Scorecard as S2 on S2.PlayerInningID=PI2.PlayerInningID
        inner join Player as P1 on P1.PlayerID=I.BatsmanStrikeId
        inner join Player as P2 on P2.PlayerID=I.BatsmanNonStrikeId
        inner join Player as P3 on P3.PlayerID=I.CurrBowlerId
        inner join \`Over\` as O on O.BowlerID=I.CurrBowlerId
        where I.InningsID=${inningsId}`;

    const matchStatus = await prisma.innings.findMany({
        where: {
            MatchID: currData[0].MatchID,
        },
    });

    console.log(matchStatus[1].TotalRuns);

    // inning end

    // update runs in inning if key is "nb,wd nbe" Plus an extra run
    let currRun = currData[0].TotalRuns;
    let currBall = currData[0].CurrOver;

    let isStrikeRotetd = isStrikeRotated(runs, ball, key);
    if (key === 'wd' || key === 'nb' || key === 'nbe') {
        currRun += 1;
    }

    if (!(key === 'wd' || key === 'nb' || key === 'nbe')) {
        currBall = Number(incrementOver(currBall));
    }

    // update runs in scorecard (player who is on strike)
    // update Score card :- runs if key is not "nbe lb bys" and ball if it not "wd"
    let currBatsmanRuns = currData[0].S1Runs;
    let currBatsmanBalls = currData[0].S1Balls;
    let currBatsman4s = currData[0].S1_4s;
    let currBatsman6s = currData[0].S1_6s;

    if (key !== 'wd') currBatsmanBalls += 1;
    if (key !== 'wd' || key !== 'nbe' || key !== 'lb' || key !== 'bys') currBatsmanRuns += runs;
    if (runs === 4) currBatsman4s += 1;
    if (runs === 6) currBatsman6s += 1;
    let extraRuns = key === 'wd' || key === 'nb' || key === 'nbe';

    // update player scorecard
    await prisma.scorecard.update({
        where: {
            ScorecardID: currData[0].S1_ID,
        },
        data: {
            RunsScored: currBatsmanRuns,
            BallsFaced: currBatsmanBalls,
            Fours: currBatsman4s,
            Sixes: currBatsman6s,
        },
    });

    // status = 2 end inning
    // status =4 end match

    if (currData[0].MatchStatus === 2) {
        if (currData[0].CurrOver === 2.5) {
            await prisma.match.update({
                where: {
                    MatchID: currData[0].MatchID,
                },
                data: {
                    MatchStatus: 3,
                },
            });
        }
    }

    if (currData[0].MatchStatus === 4) {
        if (currData[0].TotalRuns > matchStatus[1].TotalRuns) {
            // or target crossed
            // end match

            await prisma.match.update({
                where: {
                    MatchID: currData[0].MatchID,
                },
                data: {
                    MatchStatus: 5,
                },
            });
        } else if (currData[0].TotalRuns < matchStatus[0].TotalRuns && currData[0].CurrOver === 2.5) {
            await prisma.match.update({
                where: {
                    MatchID: currData[0].MatchID,
                },
                data: {
                    MatchStatus: 5,
                },
            });
        }
    }

    if (!newBowlerId)
        await prisma.innings.update({
            where: {
                InningsID: inningsId,
            },
            data: {
                TotalRuns: runs + currRun,
                BatsmanStrikeId: isStrikeRotetd ? currData[0].P2ID : currData[0].P1ID,
                BatsmanNonStrikeId: isStrikeRotetd ? currData[0].P1ID : currData[0].P2ID,
                CurrOver: currBall,
            },
        });
    else {
        await prisma.innings.update({
            where: {
                InningsID: inningsId,
            },
            data: {
                TotalRuns: runs + currRun,
                BatsmanStrikeId: isStrikeRotetd ? currData[0].P2ID : currData[0].P1ID,
                BatsmanNonStrikeId: isStrikeRotetd ? currData[0].P1ID : currData[0].P2ID,
                CurrBowlerId: newBowlerId,
                CurrOver: currBall,
            },
        });
    }

    // update ball every time
    const currOver = await prisma.ball.findMany({
        where: {
            OverID: currData[0].OverID,
        },
    });

    const totalOvers = await prisma.over.findMany({
        where: {
            InningsID: inningsId,
        },
    });

    await prisma.ball.create({
        data: {
            OverID: currData[0].OverID,
            BallNumber: currOver.length + 1,
            RunsScored: extraRuns ? runs + 1 : runs,
            Extras: extraRuns ? runs + 1 : 0,
            key: key,
        },
    });

    // create new over if required
    if (newBowlerId && (key !== 'wd' || key !== 'nb' || key !== 'nbe')) {
        await prisma.over.create({
            data: {
                InningsID: inningsId,
                BowlerID: newBowlerId,
                OverNumber: totalOvers.length + 1,
            },
        });
    }
};

export const updateScoreCard = async (req, res, next) => {
    try {
        await updateScoreCardFunc(req, res, next);
        return res.status(201).json({ message: 'Scorecard Updated' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internel Server Error' });
    }
};

export const playerOut = async (req, res, next) => {
    let {
        newPlayerId,
        how,
        playerId,
        inningsId,
        bowlerId,
        throwerId,
        CatcherId,
        runouterId,
        matchStatus,
        runs,
        ball,
        key,
        position,
        newBowlerId,
    } = req.body;
    console.log(inningsId);
    if (!how || !playerId || !inningsId || !matchStatus) return res.status(400).json({ message: 'bad request' });
    // how:- Values like "run out", "bowled", "lbw", "catch", "hit-wicket" "stump"
    // position:- "Striker or non striker"

    await updateScoreCardFunc(req, res, next);
    try {
        await prisma.out.create({
            data: {
                InningID: inningsId,
                PlayerID: playerId,
                How: how,
                ThrowerID: throwerId,
                CatcherID: CatcherId,
                BowlerID: bowlerId,
                CatcherID: CatcherId,
                RunOuterID: runouterId,
            },
        });
        const playerInningId = generateRandomId();
        await prisma.playerInning.create({
            data: {
                PlayerInningID: playerInningId,
                InningsID: inningsId,
                PlayerID: newPlayerId,
                Status: 'In',
            },
        });

        await prisma.scorecard.create({
            data: {
                InningsID: inningsId,
                PlayerInningID: playerInningId,
                RunsScored: 0,
                BallsFaced: 0,
                Sixes: 0,
                Fours: 0,
            },
        });

        const currData = await prisma.innings.findUnique({
            where: {
                InningsID: inningsId,
            },
        });

        if (how === 'run out')
            await prisma.innings.update({
                where: {
                    InningsID: inningsId,
                },
                data: {
                    BatsmanStrikeId: position === 'striker' ? newPlayerId : currData.BatsmanStrikeId,
                    BatsmanNonStrikeId: position === 'nonstriker' ? newPlayerId : currData.BatsmanNonStrikeId,
                    TotalWickets: currData.TotalWickets + 1,
                },
            });
        else {
            await prisma.innings.update({
                where: {
                    InningsID: inningsId,
                },
                data: {
                    BatsmanStrikeId: newPlayerId,
                    TotalWickets: currData.TotalWickets + 1,
                },
            });
        }

        // match status = 2
        if (matchStatus === 2)
            if (currData.TotalWickets === 9) {
                // end inning
                await prisma.match.update({
                    where: {
                        MatchID: currData.MatchID,
                    },
                    data: {
                        MatchStatus: 3,
                    },
                });
            }

        //  match status = 4
        if (matchStatus === 4)
            if (currData.TotalWickets === 9) {
                // end match
                await prisma.match.update({
                    where: {
                        MatchID: currData.MatchID,
                    },
                    data: {
                        MatchStatus: 5,
                    },
                });
            }

        return res.status(201).json({ message: 'Scorecard Updated', currData });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internel Server Error' });
    }
};

export const startMatch = async (req, res, next) => {
    const {
        teamId1,
        matchId,
        wk1,
        cap1,
        vcap1,
        playing1Ids,
        teamId2,
        wk2,
        cap2,
        vcap2,
        playing2Ids,
        tossWinId,
        choose,
    } = req.body;

    if (
        !(
            teamId1 &&
            matchId &&
            wk1 &&
            cap1 &&
            vcap1 &&
            playing1Ids &&
            playing1Ids.length &&
            teamId2 &&
            wk2 &&
            cap2 &&
            vcap2 &&
            playing2Ids &&
            playing2Ids.length &&
            tossWinId &&
            choose
        )
    )
        return res.status(400).json({ message: 'bad request' });

    const Playing11ID1 = generateRandomId();
    const Playing11ID2 = generateRandomId();

    const playingTeam = [
        {
            Playing11ID: Playing11ID1,
            MatchID: matchId,
            TeamID: teamId1,
            Cap: cap1,
            Wk: wk1,
            VCap: vcap1,
        },
        {
            Playing11ID: Playing11ID2,
            MatchID: matchId,
            TeamID: teamId2,
            Cap: cap2,
            Wk: wk2,
            VCap: vcap2,
        },
    ];

    // console.log(playingTeam);

    try {
        const teamsData = await prisma.playing11.createMany({
            data: playingTeam,
        });
        // console.log(teamsData);
        const playing11_1 = playing1Ids.map((playerId) => ({
            PlayerID: playerId,
            Playing11ID: Playing11ID1,
        }));

        const playing11_2 = playing2Ids.map((playerId) => ({
            PlayerID: playerId,
            Playing11ID: Playing11ID2,
        }));

        const playing11_12 = playing11_1.concat(playing11_2);

        await prisma.playing11Player.createMany({
            data: playing11_12,
        });

        const tossWinTeam = await prisma.team.findFirst({
            where: {
                TeamID: tossWinId,
            },
        });

        await prisma.match.update({
            where: { MatchID: matchId },
            data: {
                TossWin: tossWinId,
                Choose: choose,
                Result: `${tossWinTeam.TeamName} won the toss and decided to ${choose} fisrt`,
                MatchStatus: 1,
            },
        });

        return res.status(201).json({ message: 'Inning Added' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internel Server Error' });
    }
};
