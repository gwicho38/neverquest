/**
 * Quest Objective Types
 * Defines the different types of objectives a quest can have
 */
export enum QuestObjectiveType {
	KILL_ENEMY = 'KILL_ENEMY', // Kill X number of specific enemy type
	COLLECT_ITEM = 'COLLECT_ITEM', // Collect X number of specific item
	TALK_TO_NPC = 'TALK_TO_NPC', // Talk to a specific NPC
	REACH_LOCATION = 'REACH_LOCATION', // Reach a specific location/map
	ESCORT = 'ESCORT', // Escort an NPC safely
	EXPLORE = 'EXPLORE', // Explore a specific area
	USE_ITEM = 'USE_ITEM', // Use a specific item at a location
	SURVIVE = 'SURVIVE', // Survive for X seconds/waves
	DEFEAT_BOSS = 'DEFEAT_BOSS', // Defeat a specific boss enemy
	DELIVER_ITEM = 'DELIVER_ITEM', // Deliver an item to an NPC
	CRAFT_ITEM = 'CRAFT_ITEM', // Craft a specific item (future feature)
	LEVEL_UP = 'LEVEL_UP', // Reach a specific level
	EQUIP_ITEM = 'EQUIP_ITEM', // Equip a specific item type
	COMPLETE_DUNGEON = 'COMPLETE_DUNGEON', // Complete a dungeon
}
