/**
 * @fileoverview Animated tilemap tiles plugin for Phaser 3
 *
 * This plugin enables animated tiles from Tiled map exports:
 * - Reads animation data from tileset definitions
 * - Updates tile frames based on animation timing
 * - Supports multiple tilemaps per scene
 * - Configurable animation rate
 * - Pause/resume functionality
 *
 * Animation data comes from Tiled's tileset animation editor.
 * Each tile can have multiple frames with individual durations.
 *
 * @author       Niklas Berg <nkholski@niklasberg.se>
 * @copyright    2018 Niklas Berg
 * @license      {@link https://github.com/nkholski/phaser3-animated-tiles/blob/master/LICENSE|MIT License}
 *
 * @see Tiled Map Editor - https://www.mapeditor.org/
 * @see phaser3-animated-tiles - Original plugin
 *
 * @module plugins/AnimatedTiles
 */

//
// This plugin is based on Photonstorms Phaser 3 plugin template with added support for ES6.
//

import { ErrorMessages } from '../consts/Messages';

/**
 * Interface for frame data from Tiled animation
 */
interface ITiledFrameData {
	duration: number;
	tileid: number;
}

/**
 * Interface for tile data with animation property
 */
interface ITileDataWithAnimation {
	animation?: ITiledFrameData[];
}

/**
 * Interface for tileset tileData property - maps tile indices to tile data
 */
interface ITilesetTileData {
	[index: string]: ITileDataWithAnimation;
}

interface TileAnimationFrame {
	duration: number;
	tileid: number;
}

interface AnimatedTileData {
	index: number;
	frames: TileAnimationFrame[];
	currentFrame: number;
	tiles: Phaser.Tilemaps.Tile[][];
	rate: number;
	next?: number;
}

interface MapAnimData {
	map: Phaser.Tilemaps.Tilemap;
	animatedTiles: AnimatedTileData[];
	active: boolean;
	rate: number;
	activeLayer: boolean[];
}

class AnimatedTiles extends Phaser.Plugins.ScenePlugin {
	/*

  TODO:
  1. Fix property names which is a mess after adding support for multiple maps, tilesets and layers.
  2. Helper functions: Get mapIndex by passing a map (and maybe support it as argument to methods), Get layerIndex, get tile index from properties.

  */

	map: Phaser.Tilemaps.Tilemap | null;
	animatedTiles: MapAnimData[];
	rate: number;
	active: boolean;
	activeLayer: boolean[];
	followTimeScale: boolean;

	constructor(scene: Phaser.Scene, pluginManager: Phaser.Plugins.PluginManager) {
		super(scene, pluginManager, 'AnimatedTiles');

		// TileMap the plugin belong to.
		// TODO: Array or object for multiple tilemaps support
		// TODO: reference to layers too, and which is activated or not
		this.map = null;

		// Array with all tiles to animate
		// TODO: Turn on and off certain tiles.
		this.animatedTiles = [];

		// Global playback rate
		this.rate = 1;

		// Should the animations play or not?
		this.active = false;

		// Should the animations play or not per layer. If global active is false this value makes no difference
		this.activeLayer = [];

		// Obey timescale?
		this.followTimeScale = true;

		if (!scene.sys.settings.isBooted) {
			scene.sys.events.once('boot', this.boot, this);
		}
	}

	//  Called when the Plugin is booted by the PluginManager.
	//  If you need to reference other systems in the Scene (like the Loader or DisplayList) then set-up those references now, not in the constructor.
	boot(): void {
		const eventEmitter = this.systems.events;
		eventEmitter.on('postupdate', this.postUpdate, this);
		eventEmitter.on('shutdown', this.shutdown, this);
		eventEmitter.on('destroy', this.destroy, this);
	}

	// Initilize support for animated tiles on given map
	init(map: Phaser.Tilemaps.Tilemap): void {
		// TODO: Check if map is initilized already, if so do it again but overwrite the old.
		const mapAnimData = this.getAnimatedTiles(map);
		const animatedTiles: MapAnimData = {
			map,
			animatedTiles: mapAnimData,
			active: true,
			rate: 1,
			activeLayer: [],
		};
		map.layers.forEach(() => animatedTiles.activeLayer.push(true));
		this.animatedTiles.push(animatedTiles);
		if (this.animatedTiles.length === 1) {
			this.active = true; // Start the animations by default
		}
		/* Needed?
      this.animatedTiles[this.animatedTiles.length-1].animatedTiles.forEach(
          (animatedTile) => {
              animatedTile.tiles.forEach((layer) => {
                  this.updateLayer(animatedTile,  layer);
              });
          }
      )*/
	}

	setRate(rate: number, gid: number | null = null, map: number | null = null): void {
		if (gid === null) {
			if (map === null) {
				this.rate = rate;
			} else {
				this.animatedTiles[map].rate = rate;
			}
		} else {
			const loopThrough = (animatedTiles: AnimatedTileData[]) => {
				animatedTiles.forEach((animatedTile) => {
					if (animatedTile.index === gid) {
						animatedTile.rate = rate;
					}
				});
			};
			if (map === null) {
				this.animatedTiles.forEach((animatedTiles) => {
					loopThrough(animatedTiles.animatedTiles);
				});
			} else {
				loopThrough(this.animatedTiles[map].animatedTiles);
			}
		}
		// if tile is number (gid) --> set rate for that tile
		// TODO: if passing an object -> check properties matching object and set rate
	}

	resetRates(mapIndex: number | null = null): void {
		if (mapIndex === null) {
			this.rate = 1;
			this.animatedTiles.forEach((mapAnimData) => {
				mapAnimData.rate = 1;
				mapAnimData.animatedTiles.forEach((tileAnimData) => {
					tileAnimData.rate = 1;
				});
			});
		} else {
			this.animatedTiles[mapIndex].rate = 1;
			this.animatedTiles[mapIndex].animatedTiles.forEach((tileAnimData) => {
				tileAnimData.rate = 1;
			});
		}
	}

	//  Start (or resume) animations
	resume(layerIndex: number | null = null, mapIndex: number | null = null): void {
		const scope = mapIndex === null ? this : this.animatedTiles[mapIndex];
		if (layerIndex === null) {
			scope.active = true;
		} else {
			scope.activeLayer[layerIndex] = true;
			(scope as MapAnimData).animatedTiles.forEach((animatedTile) => {
				this.updateLayer(animatedTile, animatedTile.tiles[layerIndex]);
			});
		}
	}

	// Stop (or pause) animations
	pause(layerIndex: number | null = null, mapIndex: number | null = null): void {
		const scope = mapIndex === null ? this : this.animatedTiles[mapIndex];
		if (layerIndex === null) {
			scope.active = false;
		} else {
			scope.activeLayer[layerIndex] = false;
		}
	}

	postUpdate(time: number, delta: number): void {
		if (!this.active) {
			return;
		}
		// Elapsed time is the delta multiplied by the global rate and the scene timeScale if folowTimeScale is true
		const globalElapsedTime = delta * this.rate * (this.followTimeScale ? this.scene.time.timeScale : 1);
		this.animatedTiles.forEach((mapAnimData) => {
			if (!mapAnimData.active) {
				return;
			}
			// Multiply with rate for this map
			const elapsedTime = globalElapsedTime * mapAnimData.rate;
			mapAnimData.animatedTiles.forEach((animatedTile) => {
				// Reduce time for current tile, multiply elapsedTime with this tile's private rate
				animatedTile.next! -= elapsedTime * animatedTile.rate;
				// Time for current tile is up!!!
				if (animatedTile.next! < 0) {
					// Remember current frame index
					const currentIndex = animatedTile.currentFrame;
					// Remember the tileId of current tile
					const oldTileId = animatedTile.frames[currentIndex].tileid;
					// Advance to next in line
					let newIndex = currentIndex + 1;
					// If we went beyond last frame, we just start over
					if (newIndex > animatedTile.frames.length - 1) {
						newIndex = 0;
					}
					// Set lifelength for current frame
					animatedTile.next = animatedTile.frames[newIndex].duration;
					// Set index of current frame
					animatedTile.currentFrame = newIndex;
					// Store the tileId (gid) we will shift to
					// Loop through all tiles (via layers)
					//this.updateLayer
					animatedTile.tiles.forEach((layer, layerIndex) => {
						if (!mapAnimData.activeLayer[layerIndex]) {
							return;
						}
						this.updateLayer(animatedTile, layer, oldTileId);
					});
				}
			}); // animData loop
		}); // Map loop
	}

	updateLayer(animatedTile: AnimatedTileData, layer: Phaser.Tilemaps.Tile[], oldTileId: number = -1): void {
		const tilesToRemove: Phaser.Tilemaps.Tile[] = [];
		const tileId = animatedTile.frames[animatedTile.currentFrame].tileid;
		layer.forEach((tile) => {
			// If the tile is removed or has another index than expected, it's
			// no longer animated. Mark for removal.
			if (oldTileId > -1 && (tile === null || tile.index !== oldTileId)) {
				tilesToRemove.push(tile);
			} else {
				// Finally we set the index of the tile to the one specified by current frame!!!
				tile.index = tileId;
			}
		});
		// Remove obselete tiles
		tilesToRemove.forEach((tile) => {
			const pos = layer.indexOf(tile);
			if (pos > -1) {
				layer.splice(pos, 1);
			} else {
				console.error(ErrorMessages.ANIMATED_TILES_UNEXPECTED_ERROR);
			}
		});
	}

	//  Called when a Scene shuts down, it may then come back again later (which will invoke the 'start' event) but should be considered dormant.
	shutdown(): void {}

	//  Called when a Scene is destroyed by the Scene Manager. There is no coming back from a destroyed Scene, so clear up all resources here.
	destroy(): void {
		this.shutdown();
		this.scene = undefined as unknown as Phaser.Scene;
	}

	getAnimatedTiles(map: Phaser.Tilemaps.Tilemap): AnimatedTileData[] {
		// this.animatedTiles is an array of objects with information on how to animate and which tiles.
		const animatedTiles: AnimatedTileData[] = [];
		// loop through all tilesets
		map.tilesets.forEach(
			// Go through the data stored on each tile (not tile on the tilemap but tile in the tileset)
			(tileset) => {
				const tileData = tileset.tileData as ITilesetTileData;
				Object.keys(tileData).forEach((index) => {
					let indexNum = parseInt(index);
					// If tile has animation info we'll dive into it
					if (Object.prototype.hasOwnProperty.call(tileData[indexNum], 'animation')) {
						const animatedTileData: AnimatedTileData = {
							index: indexNum + tileset.firstgid, // gid of the original tile
							frames: [], // array of frames
							currentFrame: 0, // start on first frame
							tiles: [], // array with one array per layer with list of tiles that depends on this animation data
							rate: 1, // multiplier, set to 2 for double speed or 0.25 quarter speed
						};
						// push all frames to the animatedTileData
						tileData[indexNum].animation!.forEach((frameData: ITiledFrameData) => {
							const frame: TileAnimationFrame = {
								duration: frameData.duration,
								tileid: frameData.tileid + tileset.firstgid,
							};
							animatedTileData.frames.push(frame);
						});
						// time until jumping to next frame
						animatedTileData.next = animatedTileData.frames[0].duration;
						// set correct currentFrame if animation starts with different tile than the one with animation flag
						animatedTileData.currentFrame = animatedTileData.frames.findIndex(
							(f) => f.tileid === indexNum + tileset.firstgid
						);
						// Go through all layers for tiles
						map.layers.forEach((layer) => {
							if (layer.tilemapLayer && layer.tilemapLayer.type === 'StaticTilemapLayer') {
								// We just push an empty array if the layer is static (impossible to animate).
								// If we just skip the layer, the layer order will be messed up
								// when updating animated tiles and things will look awful.
								animatedTileData.tiles.push([]);
								return;
							}
							// tiles array for current layer
							const tiles: Phaser.Tilemaps.Tile[] = [];
							// loop through all rows with tiles...
							layer.data.forEach((tileRow) => {
								// ...and loop through all tiles in that row
								tileRow.forEach((tile) => {
									// Tiled start index for tiles with 1 but animation with 0. Thus that wierd "-1"
									if (tile && tile.index - tileset.firstgid === indexNum) {
										tiles.push(tile);
									}
								});
							});
							// add the layer's array with tiles to the tiles array.
							// this will make it possible to control layers individually in the future
							animatedTileData.tiles.push(tiles);
						});
						// animatedTileData is finished for current animation, push it to the animatedTiles-property of the plugin
						animatedTiles.push(animatedTileData);
					}
				});
			}
		);
		map.layers.forEach((layer, layerIndex) => {
			// layer indices array of booleans whether to animate tiles on layer or not
			this.activeLayer[layerIndex] = true;
		});

		return animatedTiles;
	}

	putTileAt(
		_layer: Phaser.Tilemaps.TilemapLayer,
		_tile: Phaser.Tilemaps.Tile | number,
		_x: number,
		_y: number
	): void {
		// Replaces putTileAt of the native API, but updates the list of animatedTiles in the process.
		// No need to call updateAnimatedTiles as required for other modificatons of the tile-map
	}

	updateAnimatedTiles(): void {
		// future args: x=null, y=null, w=null, h=null, container=null
		let x: number | null = null,
			y: number | null = null,
			w: number | null = null,
			h: number | null = null,
			container: MapAnimData[] | null = null;
		// 1. If no container, loop through all initilized maps
		if (container === null) {
			container = [];
			this.animatedTiles.forEach((mapAnimData) => {
				container!.push(mapAnimData);
			});
		}
		// 2. If container is a map, loop through it's layers
		// container = [container];

		// 1 & 2: Update the map(s)
		container.forEach((mapAnimData) => {
			const chkX = x !== null ? x : 0;
			const chkY = y !== null ? y : 0;
			const chkW = w !== null ? mapAnimData.map.width : 10;
			const chkH = h !== null ? mapAnimData.map.height : 10;

			mapAnimData.animatedTiles.forEach((tileAnimData) => {
				tileAnimData.tiles.forEach((tiles, layerIndex) => {
					const layer = mapAnimData.map.layers[layerIndex];
					if (
						layer.tilemapLayer &&
						(layer.tilemapLayer as Phaser.Tilemaps.TilemapLayer).type === 'StaticTilemapLayer'
					) {
						return;
					}
					for (let x = chkX; x < chkX + chkW; x++) {
						for (let y = chkY; y < chkY + chkH; y++) {
							const tile = mapAnimData.map.layers[layerIndex].data[x][y];
							// should this tile be animated?
							if (tile.index == tileAnimData.index) {
								// is it already known? if not, add it to the list
								if (tiles.indexOf(tile) === -1) {
									tiles.push(tile);
								}
								// update index to match current fram of this animation
								tile.index = tileAnimData.frames[tileAnimData.currentFrame].tileid;
							}
						}
					}
				});
			});
		});
		// 3. If container is a layer, just loop through it's tiles
	}
}

/**
 * Extended PluginManager interface with register method
 */
interface IPluginManagerWithRegister extends Phaser.Plugins.PluginManager {
	register: (key: string, plugin: typeof Phaser.Plugins.ScenePlugin, mapping: string) => Phaser.Plugins.PluginManager;
}

//  Static function called by the PluginFile Loader.
(
	AnimatedTiles as typeof AnimatedTiles & {
		register: (PluginManager: Phaser.Plugins.PluginManager) => void;
	}
).register = function (PluginManager: Phaser.Plugins.PluginManager) {
	//  Register this plugin with the PluginManager, so it can be added to Scenes.
	(PluginManager as IPluginManagerWithRegister).register('AnimatedTiles', AnimatedTiles, 'animatedTiles');
};

export default AnimatedTiles;
