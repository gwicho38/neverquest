# Neverquest - Claude Code Instructions

## Quick Reference

| Category  | Location             |
| --------- | -------------------- |
| Types     | `src/types/index.ts` |
| Constants | `src/consts/*.ts`    |
| Plugins   | `src/plugins/*.ts`   |
| Scenes    | `src/scenes/*.ts`    |
| Entities  | `src/entities/*.ts`  |
| Tests     | `src/__tests__/`     |

---

## State Management Patterns

### The Problem

Physics overlap callbacks run every frame, so any state management in them will continuously overwrite other systems' changes.

### The Solution

- Overlap callbacks should only manage UI visibility
- Let each system (dialog, battle, etc.) manage its own player state flags
- State changes should happen at transition points, not continuously

### The Specific Bug (Historical)

The overlap callback was disabling `canAtack` every frame when dialog was closed, preventing attacks after closing dialogs.

### Best Practices

- Overlap callbacks = UI only
- Each system owns its state changes
- Avoid frame-by-frame state changes
- Log state transitions (not every frame)
- Consider event-driven architecture

### Player State Ownership

| System                  | Owns These States                                |
| ----------------------- | ------------------------------------------------ |
| NeverquestMovement      | `isSwimming`, `isRunning`, speed                 |
| NeverquestBattleManager | `isAtacking`, `isBlocking`, combat flow          |
| NeverquestDialogBox     | `canMove`, `canAtack`, `canBlock` during dialogs |
| Player.jump()           | `isJumping`, `canJump`                           |
| Player.roll()           | `isRolling`, `canRoll`                           |

---

## Plugin Dependency Graph

```
Player
├── NeverquestKeyboardMouseController
│   └── NeverquestBattleManager (for attacks)
├── NeverquestMovement
│   ├── NeverquestAnimationManager
│   └── NeverquestGamePadController
├── NeverquestHealthBar
└── AttributesManager

NeverquestDialogBox
├── Player (reference)
├── NeverquestTypingSoundManager
└── NeverquestVideoOpener

NeverquestBattleManager
├── NeverquestEntityTextDisplay
├── ExpManager
└── PhaserJuice (external)

Scene Dependencies:
MainScene/DungeonScene
├── Player
├── NeverquestMapCreator
├── NeverquestEnemyZones
├── NeverquestEnvironmentParticles
├── NeverquestBattleManager
├── NeverquestDialogBox
├── NeverquestWarp
└── AnimatedTiles

HUDScene
├── NeverquestHUDProgressBar
└── Player (reference)
```

---

## TODO/FIXME Convention

Use these standardized markers for searchability:

```typescript
// TODO(issue-123): Description of work to be done
// FIXME: Known bug that needs fixing - description
// HACK: Temporary workaround - explain why and when to remove
// NOTE: Important information for understanding the code
// PERF: Performance consideration or optimization opportunity
// @deprecated Use X instead - will be removed in version Y
```

### Searching for markers

```bash
# Find all TODOs
grep -r "TODO" src/

# Find TODOs linked to issues
grep -r "TODO(issue-" src/

# Find all FIXMEs
grep -r "FIXME" src/
```

---

## Type Safety Guidelines

### Avoid `any` - Use These Instead

```typescript
// Instead of: any
// Use:
unknown; // When type is truly unknown
Record<string, unknown>; // For arbitrary objects
Phaser.GameObjects.GameObject; // For Phaser objects
Parameters<typeof fn>; // For function parameters
ReturnType<typeof fn>; // For function returns
```

### Common Phaser Types

```typescript
// Sprites
Phaser.Physics.Arcade.Sprite;
Phaser.GameObjects.Sprite;

// Bodies
Phaser.Physics.Arcade.Body;
Phaser.Physics.Arcade.StaticBody;

// Scenes
Phaser.Scene;
Phaser.Types.Scenes.SceneInitCallback;

// Input
Phaser.Input.Keyboard.Key;
Phaser.Types.Input.Keyboard.CursorKeys;

// Tilemaps
Phaser.Tilemaps.Tilemap;
Phaser.Tilemaps.TilemapLayer;
```

---

## File Organization

### Adding New Files

1. **Entities**: Extend `BaseEntity` or `Phaser.Physics.Arcade.Sprite`
2. **Plugins**: Create class in `src/plugins/`, prefix with `Neverquest`
3. **Scenes**: Extend `Phaser.Scene`, add to scene list in game config
4. **Constants**: Add to appropriate file in `src/consts/` - never hardcode
5. **Types**: Add interface to relevant file in `src/types/`, export from `index.ts`

### Naming Conventions

| Type       | Convention      | Example                   |
| ---------- | --------------- | ------------------------- |
| Classes    | PascalCase      | `NeverquestBattleManager` |
| Interfaces | IPascalCase     | `IBaseEntity`             |
| Types      | TPascalCase     | `TDirection`              |
| Constants  | SCREAMING_SNAKE | `ENTITY_SPEED`            |
| Files      | PascalCase.ts   | `NeverquestMovement.ts`   |

---

## Testing

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Test File Location

Tests mirror the source structure in `src/__tests__/`:

```
src/entities/Player.ts -> src/__tests__/entities/Player.test.ts
src/plugins/NeverquestMovement.ts -> src/__tests__/plugins/NeverquestMovement.test.ts
```

### Mocking Phaser

Use the mock in `src/__mocks__/phaserMock.ts` - it provides:

- MockSprite, MockScene, MockPhysics
- Animation stubs
- Input handling mocks

---

## CI/CD Requirements

### CRITICAL: CI Must Pass Before Work is Complete

**NEVER declare work complete until CI passes on GitHub.** This is a hard requirement.

### CI/CD Workflow

1. **Before starting work**: Check current CI status with `gh run list --limit 3`
2. **After pushing changes**: Monitor CI with `gh run watch` or `gh run list`
3. **If CI fails**: Fix immediately, push fix, wait for green CI
4. **Only after CI passes**: Declare the task complete

### CI Commands

```bash
gh run list --limit 5              # Check recent CI runs
gh run view <run-id> --log-failed  # View failure logs
gh run watch <run-id>              # Watch run in real-time
```

---

## Data Coherence

Always check for coherence and equality between production and dev data. Identify when there is a data mismatch.

---

## Common Debugging

### State Issues

```typescript
console.log('[ComponentName] State change:', {
	canAtack: player.canAtack,
	canMove: player.canMove,
	isAtacking: player.isAtacking,
});
```

### Animation Issues

```typescript
console.log('[ComponentName] Animation:', {
	currentAnim: sprite.anims.currentAnim?.key,
	isPlaying: sprite.anims.isPlaying,
	frame: sprite.anims.currentFrame?.index,
});
```

---

## Related Documentation

- `docs/ARCHITECTURE.md` - System architecture overview
- `docs/CREATE_NEW_SCENE_GUIDE.md` - Scene creation
- `docs/PLAYER_STATE_MANAGEMENT.md` - State patterns
- `docs/DEBUG_SYSTEM.md` - Debugging tools
- `docs/ROADMAP.md` - Project roadmap

---

## Tool Preferences: mcli & lsh (REQUIRED)

### mcli — Workflow Automation

- **ALWAYS** use `mcli` for workflow automation and script management
- Use `mcli init` to initialize a workflows directory — **NEVER** `mkdir -p .mcli/workflows/`
- Use `mcli new <name> -l python` or `mcli new <name> -l shell` to create commands — **NEVER** create workflow files manually
- Use `mcli run <name>` to execute workflows, `mcli list` to discover existing ones
- Check `mcli list` and `mcli list -g` **before** writing scripts — a workflow may already exist
- If you repeat `curl`, `python`, or shell logic more than twice in a session, wrap it in an mcli workflow
- **Bugs/missing features**: File issues immediately at https://github.com/gwicho38/mcli — do not defer

### lsh — Secrets Management

- **ALWAYS** use `lsh` for secrets and `.env` file management
- Use `lsh pull` to fetch secrets — **NEVER** create `.env` files manually
- Use `lsh set <key> <value>` to add/update secrets — **NEVER** `echo "KEY=val" >> .env`
- Use `lsh push` to sync secrets after changes, `lsh get <key>` to read individual values
- Use `lsh sync` for smart bidirectional sync
- **NEVER** commit `.env` files or hardcode secrets in source code
- **Bugs/missing features**: File issues immediately at https://github.com/gwicho38/lsh — do not defer
