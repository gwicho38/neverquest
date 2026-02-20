/**
 * @fileoverview Enemy type definitions for combat system
 *
 * This file defines TypeScript interfaces for enemy configuration:
 * - IEnemyConfig: Complete enemy stats, drops, and display settings
 *
 * @see EnemiesSeedConfig - Enemy data definitions
 * @see Enemy - Enemy entity class
 * @see NeverquestBattleManager - Combat system
 *
 * @module types/EnemyTypes
 */

import { EntityDrops } from '../models/EntityDrops';

export interface IEnemyConfig {
	id: number;
	name: string;
	texture: string;
	baseHealth: number;
	atack: number;
	defense: number;
	speed: number;
	flee: number;
	hit: number;
	exp: number;
	healthBarOffsetX: number;
	healthBarOffsetY: number;
	drops: EntityDrops[];
}
