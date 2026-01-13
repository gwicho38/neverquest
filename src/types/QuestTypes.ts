import { QuestObjectiveType } from '../models/QuestObjectiveType';
import { QuestStatus } from '../models/QuestStatus';

export interface IQuestObjective {
	id: number;
	type: QuestObjectiveType;
	description: string;
	targetId?: number; // Enemy ID, Item ID, NPC ID, or Location ID
	targetCount?: number; // Number required (kill 5 rats, collect 3 items)
	currentCount?: number; // Current progress
	completed: boolean;
}

export interface IQuestReward {
	xp?: number;
	gold?: number;
	items?: Array<{ id: number; count: number }>;
	unlockQuest?: number; // Quest ID to unlock upon completion
}

export interface IQuestConfig {
	id: number;
	name: string;
	description: string;
	questGiver?: string; // NPC name or ID
	questGiverLocation?: string; // Map/Scene name
	type: 'main' | 'side'; // Main quest line or side quest
	level: number; // Recommended level
	objectives: IQuestObjective[];
	rewards: IQuestReward;
	prerequisites?: number[]; // Quest IDs that must be completed first
	followUpQuests?: number[]; // Quests unlocked after completion
	dialogueStart?: string; // Initial dialogue when accepting quest
	dialogueProgress?: string; // Dialogue when quest is in progress
	dialogueComplete?: string; // Dialogue when turning in quest
	autoAccept?: boolean; // Automatically accept when conditions met
	repeatable?: boolean; // Can be repeated
}

export interface IActiveQuest extends IQuestConfig {
	status: QuestStatus;
	acceptedAt: number; // Timestamp
	completedAt?: number; // Timestamp
}

export interface IQuestProgress {
	questId: number;
	objectives: IQuestObjective[];
	status: QuestStatus;
}
