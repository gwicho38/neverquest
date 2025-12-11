import { IQuestConfig } from '../../types/QuestTypes';
import { MAIN_QUESTS } from './quests/main-quests';
import { SIDE_QUESTS } from './quests/side-quests';

/**
 * NEVERQUEST - ALL QUESTS
 * Main quest line + side quests
 */
export const DB_SEED_QUESTS: IQuestConfig[] = [...MAIN_QUESTS, ...SIDE_QUESTS];
