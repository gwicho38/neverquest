/**
 * @fileoverview Dialog registry - all game dialogs
 *
 * This file aggregates all dialog content for the game:
 * - Original dialogs (9): IntroductionChat, LumberjackHouse, etc.
 * - Crossroads dialogs (5): CrossroadsWelcome, MerchantGreeting, etc.
 *
 * Dialogs are referenced by their ID in Tiled map objects.
 *
 * @see NeverquestDialogBox - Displays dialogs
 * @see NeverquestTiledInfoBox - Triggers dialogs
 *
 * @module consts/DB_SEED/Chats
 */

import BadChair from './chats/BadChair';
import BedRest from './chats/BedRest';
import CrossroadsWelcome from './chats/CrossroadsWelcome';
import DungeonEntrance from './chats/DungeonEntrance';
import FallenKnightEncounter from './chats/FallenKnightEncounter';
import GateGuardian from './chats/GateGuardian';
import HousePlates from './chats/HousePlates';
import IntroductionChat from './chats/IntroductionChat';
import LakeView from './chats/LakeView';
import LogsInfo from './chats/LogsInfo';
import LumberjackHouse from './chats/LumberjackHouse';
import MerchantGreeting from './chats/MerchantGreeting';
import OracleVision from './chats/OracleVision';
import RoomBooksInfo from './chats/RoomBooksInfo';

export const CHATS = [
	IntroductionChat,
	LumberjackHouse,
	LogsInfo,
	RoomBooksInfo,
	BedRest,
	BadChair,
	DungeonEntrance,
	HousePlates,
	LakeView,
	CrossroadsWelcome,
	MerchantGreeting,
	FallenKnightEncounter,
	OracleVision,
	GateGuardian,
];
