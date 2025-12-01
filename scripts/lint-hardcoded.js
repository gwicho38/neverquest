#!/usr/bin/env node

/**
 * Hard-coded String and Property Linter
 *
 * Scans TypeScript files for hard-coded strings, magic numbers, and inline properties
 * that should be moved to constants files.
 *
 * Usage:
 *   node scripts/lint-hardcoded.js [options]
 *
 * Options:
 *   --fix         Show suggested fixes
 *   --json        Output as JSON
 *   --verbose     Show all matches including allowed ones
 *   --path <dir>  Scan specific directory (default: src)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
	srcDir: 'src',
	excludeDirs: ['__tests__', '__mocks__', 'consts', 'types', 'models', 'assets'],
	excludeFiles: ['.test.ts', '.spec.ts', '.d.ts'],
	fileExtensions: ['.ts'], // Only .ts files, not .tsx (Tiled map exports)
};

// Patterns that are allowed (not considered hard-coded violations)
const ALLOWED_PATTERNS = {
	strings: [
		/^['"`]$/, // Empty strings
		/^['"`]\s*['"`]$/, // Whitespace only
		/^['"`][a-z]+['"`]$/i, // Single word (likely event name or key)
		/^['"`]#[0-9a-f]{3,8}['"`]$/i, // Hex colors (should still be in constants though)
		/^['"`]rgba?\([^)]+\)['"`]$/i, // RGB/RGBA colors
		/^['"`]\.\/|\.\.\/|@\/['"`]/, // Relative imports
		/^['"`]phaser['"`]$/i, // Package names
		/^['"`][a-z-]+['"`]$/, // kebab-case (CSS properties, event names)
		/^['"`]update['"`]$/, // Common Phaser events
		/^['"`]create['"`]$/,
		/^['"`]preload['"`]$/,
		/^['"`]destroy['"`]$/,
		/^['"`]\[[\w]+\]/, // Log prefixes like [Scene], [Plugin]
		/^['"`]\$\{/, // Template literal expressions
		/^['"`]%[sdf]/, // Printf-style formatting
		/^['"`][A-Z_]+['"`]$/, // UPPER_CASE constants
		/^['"`]on[A-Z]/, // Event handlers (onClick, onUpdate)
		/^['"`]pointer/, // Pointer events
		/^['"`]keydown/, // Key events
		/^['"`]keyup/, // Key events
	],
	// Magic numbers that are commonly acceptable
	numbers: [
		0,
		1,
		2,
		3,
		4,
		5,
		-1,
		-2, // Common indices and small integers
		0.5,
		0.25,
		0.75, // Common fractions
		10,
		20,
		30,
		40,
		50,
		60,
		80, // Common spacing/padding values
		100,
		1000,
		10000, // Common multipliers
		360,
		180,
		90,
		45,
		270, // Degrees
		255, // Color max
		8,
		12,
		14,
		16,
		18,
		20,
		24,
		28,
		32, // Common font sizes
		48,
		64,
		96,
		128,
		256,
		512, // Common tile/power-of-2 sizes
		800,
		600, // Common screen dimensions
	],
};

// Categories of violations
const VIOLATION_TYPES = {
	HARDCODED_STRING: 'hardcoded-string',
	MAGIC_NUMBER: 'magic-number',
	INLINE_CONFIG: 'inline-config',
	HARDCODED_COLOR: 'hardcoded-color',
	HARDCODED_DIMENSION: 'hardcoded-dimension',
	HARDCODED_URL: 'hardcoded-url',
	HARDCODED_MESSAGE: 'hardcoded-message',
};

class HardcodedLinter {
	constructor(options = {}) {
		this.options = {
			fix: options.fix || false,
			json: options.json || false,
			verbose: options.verbose || false,
			path: options.path || CONFIG.srcDir,
			type: options.type || null,
			filesOnly: options.filesOnly || false,
		};
		this.violations = [];
		this.stats = {
			filesScanned: 0,
			filesWithViolations: 0,
			totalViolations: 0,
			byType: {},
		};
	}

	/**
	 * Main entry point
	 */
	run() {
		const targetPath = path.resolve(process.cwd(), this.options.path);

		if (!fs.existsSync(targetPath)) {
			console.error(`Error: Path not found: ${targetPath}`);
			process.exit(1);
		}

		this.scanDirectory(targetPath);
		this.outputResults();

		return this.stats.totalViolations;
	}

	/**
	 * Recursively scan directory for files
	 */
	scanDirectory(dirPath) {
		const entries = fs.readdirSync(dirPath, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = path.join(dirPath, entry.name);

			if (entry.isDirectory()) {
				if (!CONFIG.excludeDirs.includes(entry.name) && !entry.name.startsWith('.')) {
					this.scanDirectory(fullPath);
				}
			} else if (entry.isFile()) {
				if (this.shouldScanFile(entry.name)) {
					this.scanFile(fullPath);
				}
			}
		}
	}

	/**
	 * Check if file should be scanned
	 */
	shouldScanFile(filename) {
		const hasValidExtension = CONFIG.fileExtensions.some((ext) => filename.endsWith(ext));
		const isExcluded = CONFIG.excludeFiles.some((pattern) => filename.includes(pattern));
		return hasValidExtension && !isExcluded;
	}

	/**
	 * Scan a single file for violations
	 */
	scanFile(filePath) {
		this.stats.filesScanned++;

		const content = fs.readFileSync(filePath, 'utf8');
		const lines = content.split('\n');
		const relativePath = path.relative(process.cwd(), filePath);
		const fileViolations = [];

		lines.forEach((line, index) => {
			const lineNumber = index + 1;

			// Skip comments
			if (this.isComment(line)) return;

			// Skip import statements
			if (line.trim().startsWith('import ')) return;

			// Skip type annotations and interfaces
			if (this.isTypeAnnotation(line)) return;

			// Check for various violation types
			this.checkHardcodedStrings(line, lineNumber, relativePath, fileViolations);
			this.checkMagicNumbers(line, lineNumber, relativePath, fileViolations);
			this.checkHardcodedColors(line, lineNumber, relativePath, fileViolations);
			this.checkHardcodedMessages(line, lineNumber, relativePath, fileViolations);
			this.checkInlineConfigs(line, lineNumber, relativePath, fileViolations);
		});

		if (fileViolations.length > 0) {
			this.stats.filesWithViolations++;
			this.stats.totalViolations += fileViolations.length;
			this.violations.push({
				file: relativePath,
				violations: fileViolations,
			});
		}
	}

	/**
	 * Check if line is a comment
	 */
	isComment(line) {
		const trimmed = line.trim();
		return trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*');
	}

	/**
	 * Check if line is a type annotation
	 */
	isTypeAnnotation(line) {
		const trimmed = line.trim();
		return (
			trimmed.startsWith('type ') ||
			trimmed.startsWith('interface ') ||
			trimmed.startsWith('export type ') ||
			trimmed.startsWith('export interface ') ||
			/^\w+:\s*\w+(\[\])?[;,]?\s*$/.test(trimmed)
		);
	}

	/**
	 * Check for hard-coded strings
	 */
	checkHardcodedStrings(line, lineNumber, filePath, violations) {
		// Look for long strings that appear to be user-facing text or configuration
		const stringMatches = line.matchAll(/['"`]([^'"`\n]{10,})['"`]/g);

		for (const match of stringMatches) {
			const value = match[1];
			const fullMatch = match[0];

			// Skip if it's an allowed pattern
			if (this.isAllowedString(fullMatch)) continue;

			// Skip if it looks like a template path or asset key
			if (/^[a-z0-9/_-]+$/i.test(value)) continue;

			// Skip console.log messages (developer only)
			if (line.includes('console.')) continue;

			// Check if it looks like a user-facing message
			if (/^[A-Z].*[.!?]$/.test(value) || value.includes(' ')) {
				this.addViolation(violations, {
					type: VIOLATION_TYPES.HARDCODED_STRING,
					line: lineNumber,
					column: match.index,
					value: fullMatch,
					message: `Hard-coded string should be in constants: "${value.substring(0, 40)}${value.length > 40 ? '...' : ''}"`,
					severity: 'warning',
				});
			}
		}
	}

	/**
	 * Check for magic numbers
	 */
	checkMagicNumbers(line, lineNumber, filePath, violations) {
		// Skip lines that are clearly configurations or declarations
		if (line.includes('const ') || line.includes('let ') || line.includes('var ')) {
			// Allow magic numbers in variable declarations
			return;
		}

		const numberMatches = line.matchAll(/(?<![a-zA-Z_.[\d])((?:\d+\.\d+)|(?:\d{3,}))(?![.\d\w])/g);

		for (const match of numberMatches) {
			const value = parseFloat(match[1]);

			// Skip allowed numbers
			if (ALLOWED_PATTERNS.numbers.includes(value)) continue;

			// Skip if inside a string
			if (this.isInsideString(line, match.index)) continue;

			// Skip array indices
			if (line.charAt(match.index - 1) === '[') continue;

			// Skip if part of a color (0x prefix handled separately)
			if (/0x[0-9a-f]/i.test(line.substring(match.index - 2, match.index + 10))) continue;

			this.addViolation(violations, {
				type: VIOLATION_TYPES.MAGIC_NUMBER,
				line: lineNumber,
				column: match.index,
				value: match[1],
				message: `Magic number ${match[1]} should be a named constant`,
				severity: 'info',
			});
		}
	}

	/**
	 * Check for hard-coded colors
	 */
	checkHardcodedColors(line, lineNumber, filePath, violations) {
		// Check for hex colors in strings
		const hexStringMatches = line.matchAll(/['"`](#[0-9a-fA-F]{3,8})['"`]/g);
		for (const match of hexStringMatches) {
			this.addViolation(violations, {
				type: VIOLATION_TYPES.HARDCODED_COLOR,
				line: lineNumber,
				column: match.index,
				value: match[1],
				message: `Hard-coded color ${match[1]} should be in a colors constant`,
				severity: 'warning',
			});
		}

		// Check for 0x colors (common in Phaser)
		const hexNumMatches = line.matchAll(/(?<![a-zA-Z_])(0x[0-9a-fA-F]{6,8})(?![0-9a-fA-F])/g);
		for (const match of hexNumMatches) {
			// Skip if in a constant declaration
			if (line.includes('const ') && line.includes('=')) continue;

			this.addViolation(violations, {
				type: VIOLATION_TYPES.HARDCODED_COLOR,
				line: lineNumber,
				column: match.index,
				value: match[1],
				message: `Hard-coded color ${match[1]} should be in a colors constant`,
				severity: 'warning',
			});
		}
	}

	/**
	 * Check for hard-coded user messages
	 */
	checkHardcodedMessages(line, lineNumber, filePath, violations) {
		// Look for strings that appear to be user-facing messages
		const messageMatches = line.matchAll(/['"`]([A-Z][^'"`]{15,}[.!?])['"`]/g);

		for (const match of messageMatches) {
			// Skip console messages
			if (line.includes('console.')) continue;
			// Skip error messages in throw
			if (line.includes('throw ')) continue;

			this.addViolation(violations, {
				type: VIOLATION_TYPES.HARDCODED_MESSAGE,
				line: lineNumber,
				column: match.index,
				value: match[0],
				message: `User-facing message should be in strings/messages constant`,
				severity: 'warning',
			});
		}
	}

	/**
	 * Check for inline configuration objects
	 */
	checkInlineConfigs(line, lineNumber, filePath, violations) {
		// Look for object literals with 4+ properties that could be configuration
		const configMatches = line.matchAll(/\{\s*(\w+:\s*[^,}]+,?\s*){4,}\}/g);

		for (const match of configMatches) {
			// Skip if it's a type or interface
			if (line.includes('type ') || line.includes('interface ')) continue;

			this.addViolation(violations, {
				type: VIOLATION_TYPES.INLINE_CONFIG,
				line: lineNumber,
				column: match.index,
				value: match[0].substring(0, 50) + '...',
				message: 'Large inline config object should be extracted to constants',
				severity: 'info',
			});
		}
	}

	/**
	 * Check if a string value is allowed
	 */
	isAllowedString(fullMatch) {
		return ALLOWED_PATTERNS.strings.some((pattern) => pattern.test(fullMatch));
	}

	/**
	 * Check if position is inside a string
	 */
	isInsideString(line, position) {
		let inString = false;
		let stringChar = null;

		for (let i = 0; i < position; i++) {
			const char = line[i];
			if ((char === '"' || char === "'" || char === '`') && line[i - 1] !== '\\') {
				if (!inString) {
					inString = true;
					stringChar = char;
				} else if (char === stringChar) {
					inString = false;
					stringChar = null;
				}
			}
		}

		return inString;
	}

	/**
	 * Add a violation to the list
	 */
	addViolation(violations, violation) {
		violations.push(violation);

		if (!this.stats.byType[violation.type]) {
			this.stats.byType[violation.type] = 0;
		}
		this.stats.byType[violation.type]++;
	}

	/**
	 * Output results
	 */
	outputResults() {
		// Filter violations by type if specified
		let filteredViolations = this.violations;
		if (this.options.type) {
			filteredViolations = this.violations
				.map((f) => ({
					...f,
					violations: f.violations.filter((v) => v.type === this.options.type),
				}))
				.filter((f) => f.violations.length > 0);
		}

		if (this.options.json) {
			console.log(
				JSON.stringify(
					{
						stats: this.stats,
						violations: filteredViolations,
					},
					null,
					2
				)
			);
			return;
		}

		// Files-only mode for piping to other tools
		if (this.options.filesOnly) {
			for (const fileResult of filteredViolations) {
				console.log(fileResult.file);
			}
			return;
		}

		console.log('\n=== Hard-coded Linter Results ===\n');

		if (filteredViolations.length === 0) {
			console.log('No violations found!');
		} else {
			// Sort files by violation count (most violations first)
			const sortedViolations = [...filteredViolations].sort((a, b) => b.violations.length - a.violations.length);

			// Group and display violations by file
			for (const fileResult of sortedViolations) {
				const count = fileResult.violations.length;
				console.log(`\n${fileResult.file} (${count} violation${count > 1 ? 's' : ''})`);
				console.log('-'.repeat(fileResult.file.length + 15));

				for (const violation of fileResult.violations) {
					const icon = violation.severity === 'warning' ? '\x1b[33m!\x1b[0m' : '\x1b[34mi\x1b[0m';
					console.log(`  ${icon} Line ${violation.line}: ${violation.message}`);

					if (this.options.verbose) {
						console.log(`    Value: ${violation.value}`);
					}

					if (this.options.fix) {
						console.log(`    Suggested: Move to src/consts/ directory`);
					}
				}
			}
		}

		// Summary
		console.log('\n=== Summary ===');
		console.log(`Files scanned: ${this.stats.filesScanned}`);
		console.log(`Files with violations: ${this.stats.filesWithViolations}`);
		console.log(`Total violations: ${this.stats.totalViolations}`);

		if (Object.keys(this.stats.byType).length > 0) {
			console.log('\nBy type:');
			for (const [type, count] of Object.entries(this.stats.byType)) {
				console.log(`  ${type}: ${count}`);
			}
		}

		console.log('');
	}
}

// Parse command line arguments
function parseArgs() {
	const args = process.argv.slice(2);
	const options = {};

	for (let i = 0; i < args.length; i++) {
		switch (args[i]) {
			case '--fix':
				options.fix = true;
				break;
			case '--json':
				options.json = true;
				break;
			case '--verbose':
			case '-v':
				options.verbose = true;
				break;
			case '--path':
			case '-p':
				options.path = args[++i];
				break;
			case '--type':
			case '-t':
				options.type = args[++i];
				break;
			case '--files-only':
				options.filesOnly = true;
				break;
			case '--help':
			case '-h':
				console.log(`
Hard-coded String and Property Linter

Usage: node scripts/lint-hardcoded.js [options]

Options:
  --fix           Show suggested fixes
  --json          Output as JSON
  --verbose       Show all details
  --path <dir>    Scan specific directory (default: src)
  --type <type>   Filter by violation type
  --files-only    Only output file paths (for piping)
  --help          Show this help

Violation Types:
  hardcoded-string   - String literals that should be constants
  magic-number       - Numbers that should be named constants
  hardcoded-color    - Color values (hex, 0x) that need constants
  hardcoded-message  - User-facing messages
  inline-config      - Large inline config objects

Examples:
  npm run lint:hardcoded                     # Full report
  npm run lint:hardcoded -- --type hardcoded-color   # Only colors
  npm run lint:hardcoded -- --files-only     # Just file paths
  npm run lint:hardcoded -- --json           # JSON output for tools
        `);
				process.exit(0);
		}
	}

	return options;
}

// Main execution
const options = parseArgs();
const linter = new HardcodedLinter(options);
const violationCount = linter.run();

// Exit with error code if violations found (for CI integration)
process.exit(violationCount > 0 ? 1 : 0);
