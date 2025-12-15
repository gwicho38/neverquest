# Neverquest Architecture Overview

This document provides a high-level view of the Neverquest game architecture for developers and AI assistants.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Game Engine | Phaser 3 |
| Language | TypeScript |
| Build | Webpack + Babel |
| Testing | Jest + jsdom |
| Platforms | Web, Electron, Mobile, Terminal |

---

## Directory Structure

```
neverquest/
├── src/
│   ├── scenes/          # Phaser scenes (game screens)
│   ├── entities/        # Game objects (Player, Enemy, etc.)
│   ├── plugins/         # Reusable game systems
│   ├── consts/          # Constants (never hardcode values)
│   ├── types/           # TypeScript interfaces
│   ├── models/          # Data models
│   ├── components/      # UI components
│   ├── utils/           # Utility functions
│   ├── terminal/        # Terminal version implementation
│   ├── __tests__/       # Test files
│   └── __mocks__/       # Jest mocks
├── docs/                # Documentation
├── webpack/             # Build configuration
└── dist/                # Build output
```

---

## Scene Lifecycle

```
                    ┌─────────────┐
                    │ PreloadScene│
                    │  (assets)   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  IntroScene │
                    │   (logos)   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │MainMenuScene│
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │  MainScene  │ │ TownScene   │ │TutorialScene│
    │ (overworld) │ │   (hub)     │ │  (intro)    │
    └──────┬──────┘ └──────┬──────┘ └─────────────┘
           │               │
    ┌──────▼──────┐ ┌──────▼──────┐
    │DungeonScene │ │  CaveScene  │
    │ (generated) │ │  (fixed)    │
    └─────────────┘ └─────────────┘

Overlay Scenes (run parallel):
├── HUDScene        (health, exp, log)
├── DialogScene     (NPC conversations)
├── InventoryScene  (items)
├── AttributeScene  (stats)
├── SpellWheelScene (magic selection)
└── JoystickScene   (mobile controls)
```

---

## Entity Hierarchy

```
Phaser.Physics.Arcade.Sprite
└── Player
    ├── IBaseEntity (interface)
    ├── EntityAttributes
    ├── Container (physics body)
    ├── HealthBar
    ├── HitZone
    └── Controllers
        ├── NeverquestKeyboardMouseController
        └── NeverquestMovement

Phaser.Physics.Arcade.Sprite
└── Enemy (extends BaseEntity pattern)
    ├── IEnemyConfig
    ├── EntityAttributes
    ├── AI/Pathfinding
    └── HealthBar
```

---

## Plugin System

Plugins are modular game systems that can be attached to scenes or entities.

### Core Plugins

| Plugin | Responsibility |
|--------|----------------|
| `NeverquestMovement` | Player movement, swimming, running |
| `NeverquestBattleManager` | Combat, damage, hitboxes |
| `NeverquestDialogBox` | Conversations, typewriter effect |
| `NeverquestMapCreator` | Tilemap loading, collision setup |
| `NeverquestAnimationManager` | Sprite animation control |
| `NeverquestSaveManager` | Game state persistence |

### HUD Plugins

| Plugin | Responsibility |
|--------|----------------|
| `NeverquestHealthBar` | Entity health display |
| `NeverquestHUDProgressBar` | Player stats in HUD |
| `NeverquestEntityTextDisplay` | Floating damage numbers |

### World Plugins

| Plugin | Responsibility |
|--------|----------------|
| `NeverquestEnemyZones` | Enemy spawn areas |
| `NeverquestWarp` | Scene transitions |
| `NeverquestLightingManager` | Dynamic lighting |
| `NeverquestFogWarManager` | Fog of war |
| `AnimatedTiles` | Tilemap animations |

---

## Data Flow

### Combat Flow
```
Player Input (Space/J)
    │
    ▼
NeverquestKeyboardMouseController.attack()
    │
    ▼
NeverquestBattleManager.atack(player)
    │
    ├── Create hitbox sprite
    ├── Play attack animation
    ├── Check overlaps with enemies
    │
    ▼
NeverquestBattleManager.takeDamage(attacker, target)
    │
    ├── Calculate damage (with variation, crit, hit/miss)
    ├── Update health
    ├── Display damage number
    ├── Log to HUD
    │
    ▼
If target.health <= 0:
    ├── Award XP
    ├── Drop items
    └── Destroy enemy
```

### Dialog Flow
```
Player overlaps NPC trigger
    │
    ▼
NeverquestDialogBox.isOverlapingChat = true
    │
    ▼
Player presses E
    │
    ▼
NeverquestDialogBox.showDialog()
    │
    ├── Disable player controls
    ├── Show dialog box
    ├── Start typewriter animation
    │
    ▼
Player presses E (during animation)
    │
    ▼
Fast-forward text
    │
    ▼
Player presses E (text complete)
    │
    ▼
Next page or next chat message
    │
    ▼
NeverquestDialogBox.hideDialog()
    │
    └── Re-enable player controls
```

---

## State Management

### Player Capability States

These flags control what actions the player can perform:

```typescript
interface IPlayerCapabilities {
    canMove: boolean;      // Can use movement controls
    canAtack: boolean;     // Can initiate attacks
    canBlock: boolean;     // Can raise shield
    canTakeDamage: boolean; // Can receive damage
    canSwim: boolean;      // Can enter water
    canJump: boolean;      // Can jump
    canRoll: boolean;      // Can dodge roll
}
```

### Player Activity States

These flags indicate what the player is currently doing:

```typescript
interface IPlayerState {
    isAtacking: boolean;   // Currently in attack animation
    isBlocking: boolean;   // Shield is raised
    isSwimming: boolean;   // In water
    isRunning: boolean;    // Shift held/toggled
    isJumping: boolean;    // Mid-jump
    isRolling: boolean;    // Mid-roll
}
```

### State Ownership Rules

1. **Each system manages its own states**
2. **Overlap callbacks only manage UI** - never set state in overlap handlers
3. **State changes happen at transitions** - not every frame
4. **Log state changes for debugging** - but not every frame

---

## Constants Organization

All game values are centralized in `src/consts/`:

| File | Contents |
|------|----------|
| `Numbers.ts` | Numeric constants (speeds, timings, sizes) |
| `Colors.ts` | Color values (hex and numeric) |
| `Messages.ts` | User-facing text (for i18n) |
| `AnimationNames.ts` | Animation key strings |
| `GameAssets.ts` | Asset keys |
| `Entities.ts` | Entity type identifiers |
| `Battle.ts` | Combat constants |
| `Spells.ts` | Magic system constants |

**Rule**: Never hardcode values in source files. Always use constants.

---

## Testing Strategy

### Unit Tests
- Test individual functions and methods
- Mock Phaser using `src/__mocks__/phaserMock.ts`
- Focus on business logic, not Phaser internals

### Integration Tests
- Test plugin interactions
- Test scene transitions
- Located in `src/__tests__/integration/`

### Manual Testing
See `docs/TESTING_STRATEGY.md` for the pre-commit checklist.

---

## Performance Considerations

### Object Pooling
- Use particle pooling for effects (see `docs/PARTICLE_POOLING.md`)
- Reuse hitbox sprites where possible
- Clean up event listeners on scene shutdown

### Update Loop
- Minimize work in `update()` methods
- Use events for state changes instead of polling
- Cache frequently accessed values

### Memory
- Destroy sprites and containers when done
- Remove event listeners when removing objects
- Use `scene.events.once()` for one-time handlers

---

## Adding New Features

### New Scene
See `docs/CREATE_NEW_SCENE_GUIDE.md`

### New Entity
1. Create class extending appropriate Phaser class
2. Implement `IBaseEntity` interface
3. Add to scene's create method
4. Register with physics groups

### New Plugin
1. Create class in `src/plugins/`
2. Prefix name with `Neverquest`
3. Accept `scene` and relevant objects in constructor
4. Implement `create()` for initialization
5. Add to scene that uses it

### New Constant
1. Identify appropriate file in `src/consts/`
2. Add with `as const` for type inference
3. Use descriptive name following existing patterns
4. Group with related constants using comment headers

---

## Related Documentation

- [Scene Creation Guide](./CREATE_NEW_SCENE_GUIDE.md)
- [Scene Modification Guide](./SCENE_MODIFICATION_GUIDE.md)
- [Player State Management](./PLAYER_STATE_MANAGEMENT.md)
- [Debug System](./DEBUG_SYSTEM.md)
- [Particle Pooling](./PARTICLE_POOLING.md)
- [LDtk Integration](./LDTK_INTEGRATION_GUIDE.md)
