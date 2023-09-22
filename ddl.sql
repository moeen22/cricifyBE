-- CreateTable
CREATE TABLE `User` (
    `UserID` INTEGER NOT NULL AUTO_INCREMENT,
    `Username` VARCHAR(191) NOT NULL,
    `Email` VARCHAR(191) NOT NULL,
    `Password` VARCHAR(191) NOT NULL,
    `Role` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_Email_key`(`Email`),
    PRIMARY KEY (`UserID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Trophy` (
    `TrophyID` INTEGER NOT NULL AUTO_INCREMENT,
    `TrophyName` VARCHAR(191) NOT NULL,
    `OrganizerID` INTEGER NOT NULL,

    PRIMARY KEY (`TrophyID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Team` (
    `TeamID` INTEGER NOT NULL AUTO_INCREMENT,
    `TeamName` VARCHAR(191) NOT NULL,
    `TrophyID` INTEGER NOT NULL,

    PRIMARY KEY (`TeamID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Player` (
    `PlayerID` INTEGER NOT NULL AUTO_INCREMENT,
    `FirstName` VARCHAR(191) NOT NULL,
    `LastName` VARCHAR(191) NOT NULL,
    `TeamID` INTEGER NOT NULL,
    `IsWicketKeeper` BOOLEAN NOT NULL,

    PRIMARY KEY (`PlayerID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Match` (
    `MatchID` INTEGER NOT NULL AUTO_INCREMENT,
    `TrophyID` INTEGER NOT NULL,
    `Team1ID` INTEGER NOT NULL,
    `Team2ID` INTEGER NOT NULL,
    `MatchDateTime` DATETIME(3) NOT NULL,
    `Venue` VARCHAR(191) NOT NULL,
    `Result` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`MatchID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Innings` (
    `InningsID` INTEGER NOT NULL AUTO_INCREMENT,
    `MatchID` INTEGER NOT NULL,
    `BattingTeamID` INTEGER NOT NULL,
    `BowlingTeamID` INTEGER NOT NULL,
    `TotalRuns` INTEGER NOT NULL,
    `TotalWickets` INTEGER NOT NULL,
    `WicketKeeperID` INTEGER NULL,

    PRIMARY KEY (`InningsID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Scorecard` (
    `ScorecardID` INTEGER NOT NULL AUTO_INCREMENT,
    `InningsID` INTEGER NOT NULL,
    `PlayerID` INTEGER NOT NULL,
    `WicketsTaken` INTEGER NOT NULL,
    `RunsScored` INTEGER NOT NULL,
    `BallsFaced` INTEGER NOT NULL,
    `OversBowled` DOUBLE NOT NULL,

    PRIMARY KEY (`ScorecardID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BowlByBowl` (
    `BowlByBowlID` INTEGER NOT NULL AUTO_INCREMENT,
    `ScorecardID` INTEGER NOT NULL,
    `OverNumber` INTEGER NOT NULL,
    `BallNumber` INTEGER NOT NULL,
    `RunsScored` INTEGER NOT NULL,
    `WicketTaken` BOOLEAN NOT NULL,
    `ExtraRuns` INTEGER NOT NULL,

    PRIMARY KEY (`BowlByBowlID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminLog` (
    `LogID` INTEGER NOT NULL AUTO_INCREMENT,
    `UserID` INTEGER NOT NULL,
    `ActionDateTime` DATETIME(3) NOT NULL,
    `ActionDescription` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`LogID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Trophy` ADD CONSTRAINT `Trophy_OrganizerID_fkey` FOREIGN KEY (`OrganizerID`) REFERENCES `User`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `Team_TrophyID_fkey` FOREIGN KEY (`TrophyID`) REFERENCES `Trophy`(`TrophyID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Player` ADD CONSTRAINT `Player_TeamID_fkey` FOREIGN KEY (`TeamID`) REFERENCES `Team`(`TeamID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_TrophyID_fkey` FOREIGN KEY (`TrophyID`) REFERENCES `Trophy`(`TrophyID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_Team1ID_fkey` FOREIGN KEY (`Team1ID`) REFERENCES `Team`(`TeamID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_Team2ID_fkey` FOREIGN KEY (`Team2ID`) REFERENCES `Team`(`TeamID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Innings` ADD CONSTRAINT `Innings_MatchID_fkey` FOREIGN KEY (`MatchID`) REFERENCES `Match`(`MatchID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Innings` ADD CONSTRAINT `Innings_BattingTeamID_fkey` FOREIGN KEY (`BattingTeamID`) REFERENCES `Team`(`TeamID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Innings` ADD CONSTRAINT `Innings_BowlingTeamID_fkey` FOREIGN KEY (`BowlingTeamID`) REFERENCES `Team`(`TeamID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Innings` ADD CONSTRAINT `Innings_WicketKeeperID_fkey` FOREIGN KEY (`WicketKeeperID`) REFERENCES `Player`(`PlayerID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Scorecard` ADD CONSTRAINT `Scorecard_InningsID_fkey` FOREIGN KEY (`InningsID`) REFERENCES `Innings`(`InningsID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Scorecard` ADD CONSTRAINT `Scorecard_PlayerID_fkey` FOREIGN KEY (`PlayerID`) REFERENCES `Player`(`PlayerID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BowlByBowl` ADD CONSTRAINT `BowlByBowl_ScorecardID_fkey` FOREIGN KEY (`ScorecardID`) REFERENCES `Scorecard`(`ScorecardID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdminLog` ADD CONSTRAINT `AdminLog_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - Added the required column `AddressID` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `AddressID` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Address` (
    `AddressID` INTEGER NOT NULL AUTO_INCREMENT,
    `Line1` VARCHAR(191) NOT NULL,
    `Line2` VARCHAR(191) NOT NULL,
    `Landmark` VARCHAR(191) NOT NULL,
    `City` VARCHAR(191) NOT NULL,
    `StateName` VARCHAR(191) NOT NULL,
    `Pincode` INTEGER NOT NULL,

    PRIMARY KEY (`AddressID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrganizerDetail` (
    `OrganizerDetailID` INTEGER NOT NULL AUTO_INCREMENT,
    `UserID` INTEGER NOT NULL,
    `FirstName` VARCHAR(191) NOT NULL,
    `LastName` VARCHAR(191) NOT NULL,
    `Phone` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `OrganizerDetail_UserID_key`(`UserID`),
    PRIMARY KEY (`OrganizerDetailID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_AddressID_fkey` FOREIGN KEY (`AddressID`) REFERENCES `Address`(`AddressID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrganizerDetail` ADD CONSTRAINT `OrganizerDetail_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE `Otp` (
    `OtpID` INTEGER NOT NULL AUTO_INCREMENT,
    `UserID` INTEGER NOT NULL,
    `Code` VARCHAR(191) NOT NULL,
    `Expiry` DATETIME(3) NOT NULL,

    PRIMARY KEY (`OtpID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Otp` ADD CONSTRAINT `Otp_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;
/*
  Warnings:

  - You are about to drop the column `Username` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `Username`;
-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_AddressID_fkey`;

-- AlterTable
ALTER TABLE `User` MODIFY `AddressID` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_AddressID_fkey` FOREIGN KEY (`AddressID`) REFERENCES `Address`(`AddressID`) ON DELETE SET NULL ON UPDATE CASCADE;
-- AlterTable
ALTER TABLE `Otp` MODIFY `Expiry` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
-- AlterTable
ALTER TABLE `User` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT false;
/*
  Warnings:

  - You are about to drop the column `Landmark` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `Line1` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `Line2` on the `Address` table. All the data in the column will be lost.
  - Added the required column `Line` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Address` DROP COLUMN `Landmark`,
    DROP COLUMN `Line1`,
    DROP COLUMN `Line2`,
    ADD COLUMN `Line` VARCHAR(191) NOT NULL;
/*
  Warnings:

  - You are about to drop the column `AddressID` on the `User` table. All the data in the column will be lost.
  - Added the required column `UserId` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_AddressID_fkey`;

-- AlterTable
ALTER TABLE `Address` ADD COLUMN `UserId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `AddressID`;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_UserId_fkey` FOREIGN KEY (`UserId`) REFERENCES `User`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;
-- AlterTable
ALTER TABLE `Address` MODIFY `Pincode` VARCHAR(191) NOT NULL;
/*
  Warnings:

  - Added the required column `UserID` to the `Player` table without a default value. This is not possible if the table is not empty.
  - Added the required column `EndDate` to the `Trophy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Format` to the `Trophy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `StartDate` to the `Trophy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Venue` to the `Trophy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Player` ADD COLUMN `UserID` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Trophy` ADD COLUMN `EndDate` DATETIME(3) NOT NULL,
    ADD COLUMN `Format` VARCHAR(191) NOT NULL,
    ADD COLUMN `StartDate` DATETIME(3) NOT NULL,
    ADD COLUMN `Venue` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Player` ADD CONSTRAINT `Player_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;
/*
  Warnings:

  - Added the required column `IsCaptain` to the `Player` table without a default value. This is not possible if the table is not empty.
  - Added the required column `IsViseCaptain` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Player` ADD COLUMN `IsCaptain` BOOLEAN NOT NULL,
    ADD COLUMN `IsViseCaptain` BOOLEAN NOT NULL;
-- AlterTable
ALTER TABLE `Player` ADD COLUMN `Image` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Team` ADD COLUMN `Image` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Trophy` ADD COLUMN `Image` VARCHAR(191) NULL;
/*
  Warnings:

  - You are about to drop the column `UserID` on the `Player` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Player` DROP FOREIGN KEY `Player_UserID_fkey`;

-- AlterTable
ALTER TABLE `Player` DROP COLUMN `UserID`;
/*
  Warnings:

  - You are about to drop the column `OversBowled` on the `Scorecard` table. All the data in the column will be lost.
  - Added the required column `Fours` to the `Scorecard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Sixes` to the `Scorecard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Player` ADD COLUMN `BattingStyle` VARCHAR(191) NULL,
    ADD COLUMN `BowlingStyle` VARCHAR(191) NULL,
    ADD COLUMN `DOB` DATETIME(3) NULL,
    ADD COLUMN `Role` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Scorecard` DROP COLUMN `OversBowled`,
    ADD COLUMN `Fours` INTEGER NOT NULL,
    ADD COLUMN `Sixes` INTEGER NOT NULL;
/*
  Warnings:

  - The primary key for the `Address` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `AdminLog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `BowlByBowl` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Innings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Match` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OrganizerDetail` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Otp` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Player` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Scorecard` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Team` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Trophy` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `Address` DROP FOREIGN KEY `Address_UserId_fkey`;

-- DropForeignKey
ALTER TABLE `AdminLog` DROP FOREIGN KEY `AdminLog_UserID_fkey`;

-- DropForeignKey
ALTER TABLE `BowlByBowl` DROP FOREIGN KEY `BowlByBowl_ScorecardID_fkey`;

-- DropForeignKey
ALTER TABLE `Innings` DROP FOREIGN KEY `Innings_BattingTeamID_fkey`;

-- DropForeignKey
ALTER TABLE `Innings` DROP FOREIGN KEY `Innings_BowlingTeamID_fkey`;

-- DropForeignKey
ALTER TABLE `Innings` DROP FOREIGN KEY `Innings_MatchID_fkey`;

-- DropForeignKey
ALTER TABLE `Innings` DROP FOREIGN KEY `Innings_WicketKeeperID_fkey`;

-- DropForeignKey
ALTER TABLE `Match` DROP FOREIGN KEY `Match_Team1ID_fkey`;

-- DropForeignKey
ALTER TABLE `Match` DROP FOREIGN KEY `Match_Team2ID_fkey`;

-- DropForeignKey
ALTER TABLE `Match` DROP FOREIGN KEY `Match_TrophyID_fkey`;

-- DropForeignKey
ALTER TABLE `OrganizerDetail` DROP FOREIGN KEY `OrganizerDetail_UserID_fkey`;

-- DropForeignKey
ALTER TABLE `Otp` DROP FOREIGN KEY `Otp_UserID_fkey`;

-- DropForeignKey
ALTER TABLE `Player` DROP FOREIGN KEY `Player_TeamID_fkey`;

-- DropForeignKey
ALTER TABLE `Scorecard` DROP FOREIGN KEY `Scorecard_InningsID_fkey`;

-- DropForeignKey
ALTER TABLE `Scorecard` DROP FOREIGN KEY `Scorecard_PlayerID_fkey`;

-- DropForeignKey
ALTER TABLE `Team` DROP FOREIGN KEY `Team_TrophyID_fkey`;

-- DropForeignKey
ALTER TABLE `Trophy` DROP FOREIGN KEY `Trophy_OrganizerID_fkey`;

-- AlterTable
ALTER TABLE `Address` DROP PRIMARY KEY,
    MODIFY `AddressID` VARCHAR(191) NOT NULL,
    MODIFY `UserId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`AddressID`);

-- AlterTable
ALTER TABLE `AdminLog` DROP PRIMARY KEY,
    MODIFY `LogID` VARCHAR(191) NOT NULL,
    MODIFY `UserID` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`LogID`);

-- AlterTable
ALTER TABLE `BowlByBowl` DROP PRIMARY KEY,
    MODIFY `BowlByBowlID` VARCHAR(191) NOT NULL,
    MODIFY `ScorecardID` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`BowlByBowlID`);

-- AlterTable
ALTER TABLE `Innings` DROP PRIMARY KEY,
    MODIFY `InningsID` VARCHAR(191) NOT NULL,
    MODIFY `MatchID` VARCHAR(191) NOT NULL,
    MODIFY `BattingTeamID` VARCHAR(191) NOT NULL,
    MODIFY `BowlingTeamID` VARCHAR(191) NOT NULL,
    MODIFY `WicketKeeperID` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`InningsID`);

-- AlterTable
ALTER TABLE `Match` DROP PRIMARY KEY,
    MODIFY `MatchID` VARCHAR(191) NOT NULL,
    MODIFY `TrophyID` VARCHAR(191) NOT NULL,
    MODIFY `Team1ID` VARCHAR(191) NOT NULL,
    MODIFY `Team2ID` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`MatchID`);

-- AlterTable
ALTER TABLE `OrganizerDetail` DROP PRIMARY KEY,
    MODIFY `OrganizerDetailID` VARCHAR(191) NOT NULL,
    MODIFY `UserID` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`OrganizerDetailID`);

-- AlterTable
ALTER TABLE `Otp` DROP PRIMARY KEY,
    MODIFY `OtpID` VARCHAR(191) NOT NULL,
    MODIFY `UserID` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`OtpID`);

-- AlterTable
ALTER TABLE `Player` DROP PRIMARY KEY,
    MODIFY `PlayerID` VARCHAR(191) NOT NULL,
    MODIFY `TeamID` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`PlayerID`);

-- AlterTable
ALTER TABLE `Scorecard` DROP PRIMARY KEY,
    MODIFY `ScorecardID` VARCHAR(191) NOT NULL,
    MODIFY `InningsID` VARCHAR(191) NOT NULL,
    MODIFY `PlayerID` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`ScorecardID`);

-- AlterTable
ALTER TABLE `Team` DROP PRIMARY KEY,
    MODIFY `TeamID` VARCHAR(191) NOT NULL,
    MODIFY `TrophyID` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`TeamID`);

-- AlterTable
ALTER TABLE `Trophy` DROP PRIMARY KEY,
    MODIFY `TrophyID` VARCHAR(191) NOT NULL,
    MODIFY `OrganizerID` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`TrophyID`);

-- AlterTable
ALTER TABLE `User` DROP PRIMARY KEY,
    MODIFY `UserID` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`UserID`);

-- CreateTable
CREATE TABLE `Over` (
    `OverID` VARCHAR(191) NOT NULL,
    `InningsID` VARCHAR(191) NOT NULL,
    `BowlerID` VARCHAR(191) NOT NULL,
    `OverNumber` INTEGER NOT NULL,
    `MaidenOver` BOOLEAN NOT NULL DEFAULT false,
    `RunsConceded` INTEGER NOT NULL,
    `WicketsTaken` INTEGER NOT NULL,
    `Extras` INTEGER NOT NULL,

    PRIMARY KEY (`OverID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ball` (
    `BallID` VARCHAR(191) NOT NULL,
    `OverID` VARCHAR(191) NOT NULL,
    `BallNumber` INTEGER NOT NULL,
    `RunsScored` INTEGER NOT NULL,
    `WicketTaken` BOOLEAN NOT NULL,
    `Extras` INTEGER NOT NULL,

    PRIMARY KEY (`BallID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_UserId_fkey` FOREIGN KEY (`UserId`) REFERENCES `User`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrganizerDetail` ADD CONSTRAINT `OrganizerDetail_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trophy` ADD CONSTRAINT `Trophy_OrganizerID_fkey` FOREIGN KEY (`OrganizerID`) REFERENCES `User`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `Team_TrophyID_fkey` FOREIGN KEY (`TrophyID`) REFERENCES `Trophy`(`TrophyID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Player` ADD CONSTRAINT `Player_TeamID_fkey` FOREIGN KEY (`TeamID`) REFERENCES `Team`(`TeamID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_TrophyID_fkey` FOREIGN KEY (`TrophyID`) REFERENCES `Trophy`(`TrophyID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_Team1ID_fkey` FOREIGN KEY (`Team1ID`) REFERENCES `Team`(`TeamID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_Team2ID_fkey` FOREIGN KEY (`Team2ID`) REFERENCES `Team`(`TeamID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Innings` ADD CONSTRAINT `Innings_MatchID_fkey` FOREIGN KEY (`MatchID`) REFERENCES `Match`(`MatchID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Innings` ADD CONSTRAINT `Innings_BattingTeamID_fkey` FOREIGN KEY (`BattingTeamID`) REFERENCES `Team`(`TeamID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Innings` ADD CONSTRAINT `Innings_BowlingTeamID_fkey` FOREIGN KEY (`BowlingTeamID`) REFERENCES `Team`(`TeamID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Innings` ADD CONSTRAINT `Innings_WicketKeeperID_fkey` FOREIGN KEY (`WicketKeeperID`) REFERENCES `Player`(`PlayerID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Scorecard` ADD CONSTRAINT `Scorecard_InningsID_fkey` FOREIGN KEY (`InningsID`) REFERENCES `Innings`(`InningsID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Scorecard` ADD CONSTRAINT `Scorecard_PlayerID_fkey` FOREIGN KEY (`PlayerID`) REFERENCES `Player`(`PlayerID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BowlByBowl` ADD CONSTRAINT `BowlByBowl_ScorecardID_fkey` FOREIGN KEY (`ScorecardID`) REFERENCES `Scorecard`(`ScorecardID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Over` ADD CONSTRAINT `Over_InningsID_fkey` FOREIGN KEY (`InningsID`) REFERENCES `Innings`(`InningsID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Over` ADD CONSTRAINT `Over_BowlerID_fkey` FOREIGN KEY (`BowlerID`) REFERENCES `Player`(`PlayerID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ball` ADD CONSTRAINT `Ball_OverID_fkey` FOREIGN KEY (`OverID`) REFERENCES `Over`(`OverID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Otp` ADD CONSTRAINT `Otp_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdminLog` ADD CONSTRAINT `AdminLog_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;
/*
  Warnings:

  - Added the required column `BatsmanStrikeId` to the `Innings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CurrOver` to the `Innings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Innings` ADD COLUMN `BatsmanStrikeId` VARCHAR(191) NOT NULL,
    ADD COLUMN `CurrOver` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `OrganizerDetail` ADD COLUMN `Image` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Innings` ADD CONSTRAINT `Innings_BatsmanStrikeId_fkey` FOREIGN KEY (`BatsmanStrikeId`) REFERENCES `Player`(`PlayerID`) ON DELETE RESTRICT ON UPDATE CASCADE;
