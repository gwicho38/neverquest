import Phaser from 'phaser';
import { IQuestConfig, IActiveQuest, IQuestProgress } from '../types/QuestTypes';
import { QuestObjectiveType } from '../models/QuestObjectiveType';
import { QuestStatus } from '../models/QuestStatus';
import { DB_SEED_QUESTS } from '../consts/DB_SEED/Quests';

/**
 * Manages the quest system including tracking active quests,
 * quest progress, objectives, and rewards
 */
export class NeverquestQuestManager {
	public scene: Phaser.Scene;
	public allQuests: Map<number, IQuestConfig>;
	public activeQuests: Map<number, IActiveQuest>;
	public completedQuests: Set<number>;
	public turnedInQuests: Set<number>;
	public questProgress: Map<number, IQuestProgress>;

	// Events
	public static readonly QUEST_ACCEPTED = 'quest:accepted';
	public static readonly QUEST_UPDATED = 'quest:updated';
	public static readonly QUEST_OBJECTIVE_COMPLETED = 'quest:objective:completed';
	public static readonly QUEST_COMPLETED = 'quest:completed';
	public static readonly QUEST_TURNED_IN = 'quest:turned_in';
	public static readonly QUEST_FAILED = 'quest:failed';

	constructor(scene: Phaser.Scene) {
		this.scene = scene;
		this.allQuests = new Map();
		this.activeQuests = new Map();
		this.completedQuests = new Set();
		this.turnedInQuests = new Set();
		this.questProgress = new Map();

		// Load all quests from seed data
		this.loadQuests();
	}

	/**
	 * Load all quests from the database seed
	 */
	private loadQuests(): void {
		DB_SEED_QUESTS.forEach((quest) => {
			this.allQuests.set(quest.id, quest);
		});
		console.log(`Loaded ${this.allQuests.size} quests`);
	}

	/**
	 * Initialize the quest manager
	 */
	create(): void {
		console.log('NeverquestQuestManager initialized');

		// Auto-accept any quests marked with autoAccept
		this.checkAutoAcceptQuests();
	}

	/**
	 * Check for and auto-accept quests that meet criteria
	 */
	private checkAutoAcceptQuests(): void {
		this.allQuests.forEach((quest) => {
			if (quest.autoAccept && this.canAcceptQuest(quest.id)) {
				this.acceptQuest(quest.id);
			}
		});
	}

	/**
	 * Check if a quest can be accepted
	 */
	canAcceptQuest(questId: number): boolean {
		const quest = this.allQuests.get(questId);
		if (!quest) return false;

		// Already active or completed
		if (this.activeQuests.has(questId) || this.turnedInQuests.has(questId)) {
			return false;
		}

		// Check if repeatable and already turned in
		if (!quest.repeatable && this.turnedInQuests.has(questId)) {
			return false;
		}

		// Check prerequisites
		if (quest.prerequisites) {
			for (const prereqId of quest.prerequisites) {
				if (!this.turnedInQuests.has(prereqId)) {
					return false;
				}
			}
		}

		return true;
	}

	/**
	 * Accept a quest
	 */
	acceptQuest(questId: number): boolean {
		if (!this.canAcceptQuest(questId)) {
			console.warn(`Cannot accept quest ${questId}`);
			return false;
		}

		const quest = this.allQuests.get(questId);
		if (!quest) return false;

		// Create active quest
		const activeQuest: IActiveQuest = {
			...quest,
			status: QuestStatus.ACTIVE,
			acceptedAt: Date.now(),
			// Deep clone objectives to track progress
			objectives: quest.objectives.map((obj) => ({
				...obj,
				currentCount: obj.currentCount || 0,
				completed: false,
			})),
		};

		this.activeQuests.set(questId, activeQuest);

		// Initialize quest progress
		this.questProgress.set(questId, {
			questId,
			objectives: activeQuest.objectives,
			status: QuestStatus.ACTIVE,
		});

		console.log(`Quest accepted: ${quest.name}`);
		this.scene.events.emit(NeverquestQuestManager.QUEST_ACCEPTED, activeQuest);

		return true;
	}

	/**
	 * Update quest progress for a specific objective type
	 */
	updateQuestProgress(objectiveType: QuestObjectiveType, targetId?: number, count: number = 1): void {
		this.activeQuests.forEach((quest) => {
			if (quest.status !== QuestStatus.ACTIVE) return;

			quest.objectives.forEach((objective) => {
				if (objective.completed) return;

				// Check if this objective matches
				if (objective.type === objectiveType) {
					// If targetId is specified, it must match
					if (targetId !== undefined && objective.targetId !== targetId) {
						return;
					}

					// Update count
					if (objective.targetCount !== undefined) {
						objective.currentCount = (objective.currentCount || 0) + count;

						// Check if objective completed
						if (objective.currentCount >= objective.targetCount) {
							objective.currentCount = objective.targetCount;
							objective.completed = true;
							console.log(`Objective completed: ${objective.description} for quest ${quest.name}`);
							this.scene.events.emit(NeverquestQuestManager.QUEST_OBJECTIVE_COMPLETED, quest, objective);
						}
					} else {
						// For objectives without count, just mark as completed
						objective.completed = true;
						this.scene.events.emit(NeverquestQuestManager.QUEST_OBJECTIVE_COMPLETED, quest, objective);
					}

					// Emit progress update
					this.scene.events.emit(NeverquestQuestManager.QUEST_UPDATED, quest, objective);

					// Check if all objectives completed
					this.checkQuestCompletion(quest.id);
				}
			});
		});
	}

	/**
	 * Manually complete an objective
	 */
	completeObjective(questId: number, objectiveId: number): void {
		const quest = this.activeQuests.get(questId);
		if (!quest) return;

		const objective = quest.objectives.find((obj) => obj.id === objectiveId);
		if (!objective) return;

		objective.completed = true;
		if (objective.targetCount !== undefined) {
			objective.currentCount = objective.targetCount;
		}

		console.log(`Objective manually completed: ${objective.description}`);
		this.scene.events.emit(NeverquestQuestManager.QUEST_OBJECTIVE_COMPLETED, quest, objective);
		this.scene.events.emit(NeverquestQuestManager.QUEST_UPDATED, quest, objective);

		this.checkQuestCompletion(questId);
	}

	/**
	 * Check if all objectives are completed
	 */
	private checkQuestCompletion(questId: number): void {
		const quest = this.activeQuests.get(questId);
		if (!quest) return;

		const allCompleted = quest.objectives.every((obj) => obj.completed);

		if (allCompleted && quest.status !== QuestStatus.COMPLETED) {
			quest.status = QuestStatus.COMPLETED;
			quest.completedAt = Date.now();

			console.log(`Quest completed: ${quest.name}`);
			this.scene.events.emit(NeverquestQuestManager.QUEST_COMPLETED, quest);

			// Update quest progress
			const progress = this.questProgress.get(questId);
			if (progress) {
				progress.status = QuestStatus.COMPLETED;
			}
		}
	}

	/**
	 * Turn in a completed quest and claim rewards
	 */
	turnInQuest(questId: number): boolean {
		const quest = this.activeQuests.get(questId);
		if (!quest || quest.status !== QuestStatus.COMPLETED) {
			console.warn(`Cannot turn in quest ${questId}`);
			return false;
		}

		// Mark as turned in
		quest.status = QuestStatus.TURNED_IN;
		this.turnedInQuests.add(questId);
		this.completedQuests.add(questId);

		// Remove from active quests
		this.activeQuests.delete(questId);

		console.log(`Quest turned in: ${quest.name}`);
		console.log('Rewards:', quest.rewards);

		// Emit turn in event with rewards
		this.scene.events.emit(NeverquestQuestManager.QUEST_TURNED_IN, quest, quest.rewards);

		// Unlock follow-up quests
		if (quest.followUpQuests) {
			quest.followUpQuests.forEach((followUpId) => {
				if (this.canAcceptQuest(followUpId)) {
					console.log(`Follow-up quest ${followUpId} is now available`);
				}
			});
		}

		// Check for auto-accept follow-up quests
		this.checkAutoAcceptQuests();

		return true;
	}

	/**
	 * Fail a quest
	 */
	failQuest(questId: number): void {
		const quest = this.activeQuests.get(questId);
		if (!quest) return;

		quest.status = QuestStatus.FAILED;
		this.activeQuests.delete(questId);

		console.log(`Quest failed: ${quest.name}`);
		this.scene.events.emit(NeverquestQuestManager.QUEST_FAILED, quest);
	}

	/**
	 * Get a quest by ID
	 */
	getQuest(questId: number): IQuestConfig | undefined {
		return this.allQuests.get(questId);
	}

	/**
	 * Get an active quest
	 */
	getActiveQuest(questId: number): IActiveQuest | undefined {
		return this.activeQuests.get(questId);
	}

	/**
	 * Get all active quests
	 */
	getActiveQuests(): IActiveQuest[] {
		return Array.from(this.activeQuests.values());
	}

	/**
	 * Get all available quests (can be accepted)
	 */
	getAvailableQuests(): IQuestConfig[] {
		const available: IQuestConfig[] = [];
		this.allQuests.forEach((quest) => {
			if (this.canAcceptQuest(quest.id)) {
				available.push(quest);
			}
		});
		return available;
	}

	/**
	 * Get completed quests
	 */
	getCompletedQuests(): number[] {
		return Array.from(this.completedQuests);
	}

	/**
	 * Check if a quest is completed
	 */
	isQuestCompleted(questId: number): boolean {
		return this.completedQuests.has(questId);
	}

	/**
	 * Check if a quest is active
	 */
	isQuestActive(questId: number): boolean {
		return this.activeQuests.has(questId);
	}

	/**
	 * Get quest progress for a specific quest
	 */
	getQuestProgress(questId: number): IQuestProgress | undefined {
		return this.questProgress.get(questId);
	}

	/**
	 * Get all quests by type
	 */
	getQuestsByType(type: 'main' | 'side'): IQuestConfig[] {
		return Array.from(this.allQuests.values()).filter((quest) => quest.type === type);
	}

	/**
	 * Save quest state to storage
	 */
	saveQuestState(): object {
		return {
			activeQuests: Array.from(this.activeQuests.entries()),
			completedQuests: Array.from(this.completedQuests),
			turnedInQuests: Array.from(this.turnedInQuests),
			questProgress: Array.from(this.questProgress.entries()),
		};
	}

	/**
	 * Load quest state from storage
	 */
	loadQuestState(state: any): void {
		if (state.activeQuests) {
			this.activeQuests = new Map(state.activeQuests);
		}
		if (state.completedQuests) {
			this.completedQuests = new Set(state.completedQuests);
		}
		if (state.turnedInQuests) {
			this.turnedInQuests = new Set(state.turnedInQuests);
		}
		if (state.questProgress) {
			this.questProgress = new Map(state.questProgress);
		}

		console.log('Quest state loaded:', {
			active: this.activeQuests.size,
			completed: this.completedQuests.size,
			turnedIn: this.turnedInQuests.size,
		});
	}

	/**
	 * Reset all quest progress (for debugging/testing)
	 */
	resetAllQuests(): void {
		this.activeQuests.clear();
		this.completedQuests.clear();
		this.turnedInQuests.clear();
		this.questProgress.clear();
		console.log('All quest progress reset');
	}

	/**
	 * Destroy and cleanup
	 */
	destroy(): void {
		this.activeQuests.clear();
		this.questProgress.clear();
		console.log('NeverquestQuestManager destroyed');
	}
}
