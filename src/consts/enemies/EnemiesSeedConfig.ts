/**
 * @fileoverview Enemy registry - all enemy type configurations
 *
 * This file aggregates all enemy configs for the game:
 * - Original enemies: Rat, Bat, Ogre
 * - Crossroads enemies: Bandit, Wolf, ShadowScout
 * - Ice Caverns enemies: FrostSpider, IceElemental, Yeti, FrostGiant
 * - Volcanic Dungeons enemies: FireImp, LavaGolem, FireDrake, MagmaWorm, FireDragon
 * - Sky Islands enemies: Harpy, WindElemental, SkySerpent, ThunderBird, StormPhoenix
 * - Underwater Temple enemies: Shark, WaterElemental, ElectricEel, AnglerFish, Leviathan
 *
 * Used by NeverquestEnemyZones to spawn enemies from map data.
 *
 * @see NeverquestEnemyZones - Spawns enemies
 * @see Enemy - Enemy entity class
 *
 * @module consts/enemies/EnemiesSeedConfig
 */

import { AnglerFishConfig } from './anglerFish';
import { BanditConfig } from './bandit';
import { BatConfig } from './bat';
import { ElectricEelConfig } from './electricEel';
import { FireDragonConfig } from './fireDragon';
import { FireDrakeConfig } from './fireDrake';
import { FireImpConfig } from './fireImp';
import { FrostGiantConfig } from './frostGiant';
import { FrostSpiderConfig } from './frostSpider';
import { HarpyConfig } from './harpy';
import { IceElementalConfig } from './iceElemental';
import { LavaGolemConfig } from './lavaGolem';
import { LeviathanConfig } from './leviathan';
import { MagmaWormConfig } from './magmaWorm';
import { OgreConfig } from './ogre';
import { RatConfig } from './rat';
import { ShadowScoutConfig } from './shadowScout';
import { SharkConfig } from './shark';
import { SkySerpentConfig } from './skySerpent';
import { StormPhoenixConfig } from './stormPhoenix';
import { ThunderBirdConfig } from './thunderBird';
import { WaterElementalConfig } from './waterElemental';
import { WindElementalConfig } from './windElemental';
import { WolfConfig } from './wolf';
import { YetiConfig } from './yeti';

export const EnemiesSeedConfig = [
	// Original enemies (ID 1-3)
	RatConfig,
	BatConfig,
	OgreConfig,
	// Crossroads enemies (ID 4-6)
	BanditConfig,
	WolfConfig,
	ShadowScoutConfig,
	// Ice Caverns enemies (ID 10-13)
	FrostSpiderConfig,
	IceElementalConfig,
	YetiConfig,
	FrostGiantConfig,
	// Volcanic Dungeons enemies (ID 14-18)
	FireImpConfig,
	LavaGolemConfig,
	FireDrakeConfig,
	MagmaWormConfig,
	FireDragonConfig,
	// Sky Islands enemies (ID 19-23)
	HarpyConfig,
	WindElementalConfig,
	SkySerpentConfig,
	ThunderBirdConfig,
	StormPhoenixConfig,
	// Underwater Temple enemies (ID 24-28)
	SharkConfig,
	WaterElementalConfig,
	ElectricEelConfig,
	AnglerFishConfig,
	LeviathanConfig,
];
