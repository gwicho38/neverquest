/**
 * Quest Status
 * Represents the current state of a quest
 */
export enum QuestStatus {
	LOCKED = 'LOCKED', // Quest not yet available
	AVAILABLE = 'AVAILABLE', // Quest can be accepted
	ACTIVE = 'ACTIVE', // Quest accepted and in progress
	COMPLETED = 'COMPLETED', // Quest objectives completed, ready to turn in
	TURNED_IN = 'TURNED_IN', // Quest turned in, rewards claimed
	FAILED = 'FAILED', // Quest failed (optional for time-limited quests)
}
