#!/usr/bin/env node

/**
 * @fileoverview Master Repository Analyzer for Neverquest
 *
 * This script provides a comprehensive snapshot of the repository state
 * to help continue iterating on code quality, tests, and documentation.
 *
 * Usage:
 *   npm run analyze           # Full analysis
 *   npm run analyze -- --quick # Quick analysis (skip slow operations)
 *   npm run analyze -- --json  # Output as JSON
 *
 * Categories analyzed:
 *   1. Code Quality (ESLint errors/warnings)
 *   2. Type Safety (TypeScript errors)
 *   3. Test Coverage
 *   4. TODO/FIXME Tracking
 *   5. Code Metrics (file counts, lines of code)
 *   6. Dependencies (outdated, security)
 *   7. Documentation Coverage
 *   8. Assets Inventory
 *   9. Git Status
 *
 * @module scripts/repo-analyzer
 */

const { execSync } = require('child_process');
const fs = require('fs');

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
	srcDir: 'src',
	testDir: 'src/__tests__',
	assetsDir: 'src/assets',
	docsDir: 'docs',
	outputFile: 'repo-analysis.json',
};

const COLORS = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	gray: '\x1b[90m',
};

// =============================================================================
// UTILITIES
// =============================================================================

function runCommand(command, options = {}) {
	try {
		return execSync(command, {
			encoding: 'utf8',
			maxBuffer: 10 * 1024 * 1024,
			...options,
		}).trim();
	} catch (error) {
		if (options.ignoreError) {
			return error.stdout?.trim() || error.stderr?.trim() || '';
		}
		return null;
	}
}

function countLines(pattern, dir = CONFIG.srcDir) {
	const result = runCommand(`find ${dir} -name "${pattern}" -type f -exec wc -l {} + 2>/dev/null | tail -1`, {
		ignoreError: true,
	});
	if (result) {
		const match = result.match(/(\d+)/);
		return match ? parseInt(match[1], 10) : 0;
	}
	return 0;
}

function countFiles(pattern, dir = CONFIG.srcDir) {
	const result = runCommand(`find ${dir} -name "${pattern}" -type f 2>/dev/null | wc -l`, { ignoreError: true });
	return parseInt(result, 10) || 0;
}

function printHeader(title) {
	console.log('\n' + COLORS.bright + COLORS.cyan + '═'.repeat(60) + COLORS.reset);
	console.log(COLORS.bright + COLORS.cyan + ' ' + title + COLORS.reset);
	console.log(COLORS.cyan + '═'.repeat(60) + COLORS.reset);
}

function printSection(title) {
	console.log(
		'\n' + COLORS.bright + COLORS.blue + '── ' + title + ' ' + '─'.repeat(50 - title.length) + COLORS.reset
	);
}

function printMetric(label, value, status = 'neutral') {
	const statusColors = {
		good: COLORS.green,
		warning: COLORS.yellow,
		bad: COLORS.red,
		neutral: COLORS.reset,
	};
	console.log(`  ${COLORS.gray}${label}:${COLORS.reset} ${statusColors[status]}${value}${COLORS.reset}`);
}

function printProgress(message) {
	process.stdout.write(COLORS.gray + '  ' + message + '...' + COLORS.reset);
}

function printDone() {
	console.log(COLORS.green + ' done' + COLORS.reset);
}

// =============================================================================
// ANALYZERS
// =============================================================================

function analyzeGitStatus() {
	printSection('Git Status');

	const branch = runCommand('git branch --show-current');
	const status = runCommand('git status --porcelain');
	const uncommitted = status ? status.split('\n').filter((l) => l).length : 0;
	const lastCommit = runCommand('git log -1 --format="%h %s"');
	const totalCommits = runCommand('git rev-list --count HEAD');
	const contributors = runCommand('git shortlog -sn --all | wc -l');

	printMetric('Branch', branch);
	printMetric('Uncommitted changes', uncommitted, uncommitted > 0 ? 'warning' : 'good');
	printMetric('Last commit', lastCommit);
	printMetric('Total commits', totalCommits);
	printMetric('Contributors', contributors);

	return { branch, uncommitted, lastCommit, totalCommits: parseInt(totalCommits, 10) };
}

function analyzeCodeMetrics() {
	printSection('Code Metrics');

	const tsFiles = countFiles('*.ts');
	const jsFiles = countFiles('*.js');
	const testFiles = countFiles('*.test.ts', CONFIG.testDir);
	const tsLines = countLines('*.ts');
	const jsLines = countLines('*.js');

	// Count by category
	const sceneFiles = countFiles('*.ts', `${CONFIG.srcDir}/scenes`);
	const pluginFiles = countFiles('*.ts', `${CONFIG.srcDir}/plugins`);
	const entityFiles = countFiles('*.ts', `${CONFIG.srcDir}/entities`);
	const constFiles = countFiles('*.ts', `${CONFIG.srcDir}/consts`);

	printMetric('TypeScript files', tsFiles);
	printMetric('JavaScript files', jsFiles);
	printMetric('Test files', testFiles);
	printMetric('Total lines (TS)', tsLines.toLocaleString());
	printMetric('Total lines (JS)', jsLines.toLocaleString());
	console.log('');
	printMetric('Scene files', sceneFiles);
	printMetric('Plugin files', pluginFiles);
	printMetric('Entity files', entityFiles);
	printMetric('Const files', constFiles);

	return {
		tsFiles,
		jsFiles,
		testFiles,
		tsLines,
		jsLines,
		categories: { sceneFiles, pluginFiles, entityFiles, constFiles },
	};
}

function analyzeLinting() {
	printSection('Linting (ESLint)');

	printProgress('Running ESLint');
	const result = runCommand('npm run lint 2>&1', { ignoreError: true });
	printDone();

	const errorMatch = result.match(/(\d+)\s+error/);
	const warningMatch = result.match(/(\d+)\s+warning/);
	const errors = errorMatch ? parseInt(errorMatch[1], 10) : 0;
	const warnings = warningMatch ? parseInt(warningMatch[1], 10) : 0;

	printMetric('Errors', errors, errors > 0 ? 'bad' : 'good');
	printMetric('Warnings', warnings, warnings > 10 ? 'warning' : 'good');

	// Top warning types
	if (warnings > 0) {
		const warningTypes = {};
		const lines = result.split('\n');
		for (const line of lines) {
			const match = line.match(/warning\s+.+?\s+(\S+)$/);
			if (match) {
				warningTypes[match[1]] = (warningTypes[match[1]] || 0) + 1;
			}
		}
		const topWarnings = Object.entries(warningTypes)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5);

		if (topWarnings.length > 0) {
			console.log(COLORS.gray + '  Top warnings:' + COLORS.reset);
			for (const [type, count] of topWarnings) {
				console.log(COLORS.gray + `    ${count}x ${type}` + COLORS.reset);
			}
		}
	}

	return { errors, warnings };
}

function analyzeTypeScript() {
	printSection('TypeScript');

	printProgress('Running type check');
	const result = runCommand('npm run typecheck 2>&1', { ignoreError: true });
	printDone();

	const errorLines = result.split('\n').filter((l) => l.includes('error TS'));
	const errorCount = errorLines.length;

	// Count by category
	const byCategory = {
		tests: errorLines.filter((l) => l.includes('__tests__')).length,
		source: errorLines.filter((l) => !l.includes('__tests__')).length,
	};

	// Count by error type
	const errorTypes = {};
	for (const line of errorLines) {
		const match = line.match(/error (TS\d+)/);
		if (match) {
			errorTypes[match[1]] = (errorTypes[match[1]] || 0) + 1;
		}
	}

	printMetric('Total errors', errorCount, errorCount > 0 ? 'warning' : 'good');
	printMetric('In tests', byCategory.tests);
	printMetric('In source', byCategory.source);

	const topErrors = Object.entries(errorTypes)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5);

	if (topErrors.length > 0) {
		console.log(COLORS.gray + '  Top error types:' + COLORS.reset);
		for (const [type, count] of topErrors) {
			console.log(COLORS.gray + `    ${count}x ${type}` + COLORS.reset);
		}
	}

	return { errors: errorCount, byCategory, topErrors };
}

function analyzeTests(quick = false) {
	printSection('Tests');

	if (quick) {
		const testFiles = countFiles('*.test.ts', CONFIG.testDir);
		printMetric('Test files', testFiles);
		printMetric('Coverage', 'skipped (quick mode)', 'neutral');
		return { testFiles, skipped: true };
	}

	printProgress('Running tests with coverage');
	const result = runCommand('npm test -- --coverage --coverageReporters=text-summary 2>&1', { ignoreError: true });
	printDone();

	// Parse coverage
	const stmtMatch = result.match(/Statements\s*:\s*([\d.]+)%/);
	const branchMatch = result.match(/Branches\s*:\s*([\d.]+)%/);
	const funcMatch = result.match(/Functions\s*:\s*([\d.]+)%/);
	const lineMatch = result.match(/Lines\s*:\s*([\d.]+)%/);

	const coverage = {
		statements: stmtMatch ? parseFloat(stmtMatch[1]) : 0,
		branches: branchMatch ? parseFloat(branchMatch[1]) : 0,
		functions: funcMatch ? parseFloat(funcMatch[1]) : 0,
		lines: lineMatch ? parseFloat(lineMatch[1]) : 0,
	};

	// Parse test results
	const passMatch = result.match(/Tests:\s*(\d+)\s*passed/);
	const failMatch = result.match(/(\d+)\s*failed/);
	const skipMatch = result.match(/(\d+)\s*skipped/);

	const tests = {
		passed: passMatch ? parseInt(passMatch[1], 10) : 0,
		failed: failMatch ? parseInt(failMatch[1], 10) : 0,
		skipped: skipMatch ? parseInt(skipMatch[1], 10) : 0,
	};

	const getStatus = (val) => (val >= 80 ? 'good' : val >= 60 ? 'warning' : 'bad');

	printMetric('Statements', `${coverage.statements}%`, getStatus(coverage.statements));
	printMetric('Branches', `${coverage.branches}%`, getStatus(coverage.branches));
	printMetric('Functions', `${coverage.functions}%`, getStatus(coverage.functions));
	printMetric('Lines', `${coverage.lines}%`, getStatus(coverage.lines));
	console.log('');
	printMetric('Passed', tests.passed, 'good');
	printMetric('Failed', tests.failed, tests.failed > 0 ? 'bad' : 'good');
	printMetric('Skipped', tests.skipped, tests.skipped > 0 ? 'warning' : 'neutral');

	return { coverage, tests };
}

function analyzeTodos() {
	printSection('TODO/FIXME Tracking');

	const todoResult = runCommand('grep -rn "TODO" src/ --include="*.ts" --include="*.js" 2>/dev/null | wc -l', {
		ignoreError: true,
	});
	const fixmeResult = runCommand('grep -rn "FIXME" src/ --include="*.ts" --include="*.js" 2>/dev/null | wc -l', {
		ignoreError: true,
	});
	const hackResult = runCommand('grep -rn "HACK" src/ --include="*.ts" --include="*.js" 2>/dev/null | wc -l', {
		ignoreError: true,
	});
	const noteResult = runCommand('grep -rn "NOTE:" src/ --include="*.ts" --include="*.js" 2>/dev/null | wc -l', {
		ignoreError: true,
	});

	const todos = parseInt(todoResult, 10) || 0;
	const fixmes = parseInt(fixmeResult, 10) || 0;
	const hacks = parseInt(hackResult, 10) || 0;
	const notes = parseInt(noteResult, 10) || 0;

	printMetric('TODOs', todos, todos > 20 ? 'warning' : 'neutral');
	printMetric('FIXMEs', fixmes, fixmes > 5 ? 'bad' : fixmes > 0 ? 'warning' : 'good');
	printMetric('HACKs', hacks, hacks > 0 ? 'warning' : 'good');
	printMetric('NOTEs', notes, 'neutral');

	// List FIXMEs if any
	if (fixmes > 0) {
		console.log(COLORS.gray + '  FIXMEs found:' + COLORS.reset);
		const fixmeList = runCommand('grep -rn "FIXME" src/ --include="*.ts" --include="*.js" 2>/dev/null | head -5', {
			ignoreError: true,
		});
		if (fixmeList) {
			const lines = fixmeList.split('\n');
			for (const line of lines) {
				const short = line.length > 80 ? line.substring(0, 77) + '...' : line;
				console.log(COLORS.gray + '    ' + short + COLORS.reset);
			}
		}
	}

	return { todos, fixmes, hacks, notes };
}

function analyzeDocumentation() {
	printSection('Documentation');

	// Count JSDoc coverage
	const filesWithJsdoc = runCommand('grep -rl "@fileoverview" src/ --include="*.ts" 2>/dev/null | wc -l', {
		ignoreError: true,
	});
	const totalTsFiles = countFiles('*.ts');
	const jsdocCoverage = totalTsFiles > 0 ? Math.round((parseInt(filesWithJsdoc, 10) / totalTsFiles) * 100) : 0;

	// Count markdown docs
	const mdFiles = runCommand('find docs/ -name "*.md" -type f 2>/dev/null | wc -l', { ignoreError: true });
	const readmeExists = fs.existsSync('README.md');
	const claudeMdExists = fs.existsSync('CLAUDE.md');
	const contributingExists = fs.existsSync('CONTRIBUTING.md');

	printMetric('Files with @fileoverview', `${filesWithJsdoc}/${totalTsFiles} (${jsdocCoverage}%)`);
	printMetric('Markdown docs', mdFiles);
	printMetric('README.md', readmeExists ? 'exists' : 'missing', readmeExists ? 'good' : 'bad');
	printMetric('CLAUDE.md', claudeMdExists ? 'exists' : 'missing', claudeMdExists ? 'good' : 'warning');
	printMetric('CONTRIBUTING.md', contributingExists ? 'exists' : 'missing', contributingExists ? 'good' : 'neutral');

	return {
		jsdocCoverage,
		mdFiles: parseInt(mdFiles, 10) || 0,
		hasReadme: readmeExists,
		hasClaudeMd: claudeMdExists,
		hasContributing: contributingExists,
	};
}

function analyzeAssets() {
	printSection('Assets');

	const images = countFiles('*.png', CONFIG.assetsDir) + countFiles('*.jpg', CONFIG.assetsDir);
	const audio = countFiles('*.mp3', CONFIG.assetsDir) + countFiles('*.wav', CONFIG.assetsDir);
	const maps = countFiles('*.json', `${CONFIG.assetsDir}/maps`);
	const sprites = runCommand(`find ${CONFIG.assetsDir}/sprites -type f 2>/dev/null | wc -l`, { ignoreError: true });
	const tilesets = runCommand(`find ${CONFIG.assetsDir}/maps/tilesets -type f 2>/dev/null | wc -l`, {
		ignoreError: true,
	});

	printMetric('Images', images);
	printMetric('Audio files', audio);
	printMetric('Map files', maps);
	printMetric('Sprite files', parseInt(sprites, 10) || 0);
	printMetric('Tileset files', parseInt(tilesets, 10) || 0);

	return {
		images,
		audio,
		maps,
		sprites: parseInt(sprites, 10) || 0,
		tilesets: parseInt(tilesets, 10) || 0,
	};
}

function analyzeDependencies(quick = false) {
	printSection('Dependencies');

	// Count dependencies
	const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
	const deps = Object.keys(pkg.dependencies || {}).length;
	const devDeps = Object.keys(pkg.devDependencies || {}).length;

	printMetric('Dependencies', deps);
	printMetric('Dev dependencies', devDeps);

	if (quick) {
		printMetric('Outdated', 'skipped (quick mode)', 'neutral');
		printMetric('Vulnerabilities', 'skipped (quick mode)', 'neutral');
		return { deps, devDeps, skipped: true };
	}

	// Check outdated
	printProgress('Checking outdated packages');
	const outdated = runCommand('npm outdated --json 2>/dev/null', { ignoreError: true });
	printDone();

	let outdatedCount = 0;
	if (outdated) {
		try {
			outdatedCount = Object.keys(JSON.parse(outdated)).length;
		} catch {
			outdatedCount = 0;
		}
	}

	// Check vulnerabilities
	printProgress('Checking vulnerabilities');
	const audit = runCommand('npm audit --json 2>/dev/null', { ignoreError: true });
	printDone();

	let vulnCount = 0;
	if (audit) {
		try {
			const auditData = JSON.parse(audit);
			vulnCount = auditData.metadata?.vulnerabilities?.total || 0;
		} catch {
			vulnCount = 0;
		}
	}

	printMetric('Outdated', outdatedCount, outdatedCount > 10 ? 'warning' : 'good');
	printMetric('Vulnerabilities', vulnCount, vulnCount > 0 ? 'bad' : 'good');

	return { deps, devDeps, outdated: outdatedCount, vulnerabilities: vulnCount };
}

function analyzeComplexity() {
	printSection('Code Complexity');

	// Count large files
	const largeFiles = runCommand('find src/ -name "*.ts" -type f -exec wc -l {} + 2>/dev/null | sort -rn | head -10', {
		ignoreError: true,
	});

	if (largeFiles) {
		console.log(COLORS.gray + '  Largest files:' + COLORS.reset);
		const lines = largeFiles.split('\n').filter((l) => l && !l.includes('total'));
		for (const line of lines.slice(0, 5)) {
			const match = line.trim().match(/(\d+)\s+(.+)/);
			if (match) {
				const [, count, file] = match;
				console.log(`    ${COLORS.gray}${count.padStart(5)}${COLORS.reset} ${file}`);
			}
		}
	}

	// Count any types
	const anyCount = runCommand('grep -rn ": any" src/ --include="*.ts" 2>/dev/null | wc -l', { ignoreError: true });
	printMetric("'any' type usages", parseInt(anyCount, 10) || 0, parseInt(anyCount, 10) > 50 ? 'warning' : 'good');

	// Count console.logs
	const consoleLogs = runCommand('grep -rn "console.log" src/ --include="*.ts" 2>/dev/null | wc -l', {
		ignoreError: true,
	});
	printMetric('console.log statements', parseInt(consoleLogs, 10) || 0);

	return {
		anyTypes: parseInt(anyCount, 10) || 0,
		consoleLogs: parseInt(consoleLogs, 10) || 0,
	};
}

function generateSummary(results) {
	printHeader('Summary');

	const issues = [];
	const improvements = [];

	// Analyze results and generate recommendations
	if (results.linting.errors > 0) {
		issues.push(`${results.linting.errors} ESLint errors need fixing`);
	}
	if (results.linting.warnings > 20) {
		improvements.push(`Reduce ESLint warnings (currently ${results.linting.warnings})`);
	}

	if (results.typescript.errors > 0) {
		issues.push(`${results.typescript.errors} TypeScript errors need fixing`);
	}

	if (results.tests?.coverage?.lines < 80) {
		improvements.push(`Increase test coverage (currently ${results.tests.coverage?.lines || 0}%)`);
	}
	if (results.tests?.tests?.failed > 0) {
		issues.push(`${results.tests.tests.failed} failing tests`);
	}

	if (results.todos.fixmes > 0) {
		issues.push(`${results.todos.fixmes} FIXMEs in codebase`);
	}

	if (results.documentation.jsdocCoverage < 50) {
		improvements.push(`Add @fileoverview to more files (currently ${results.documentation.jsdocCoverage}%)`);
	}

	if (results.complexity.anyTypes > 50) {
		improvements.push(`Reduce 'any' type usage (currently ${results.complexity.anyTypes})`);
	}

	if (results.dependencies?.vulnerabilities > 0) {
		issues.push(`${results.dependencies.vulnerabilities} security vulnerabilities`);
	}

	// Print summary
	if (issues.length > 0) {
		console.log(COLORS.red + COLORS.bright + '\n Issues to address:' + COLORS.reset);
		for (const issue of issues) {
			console.log(COLORS.red + '  - ' + issue + COLORS.reset);
		}
	}

	if (improvements.length > 0) {
		console.log(COLORS.yellow + COLORS.bright + '\n Suggested improvements:' + COLORS.reset);
		for (const improvement of improvements) {
			console.log(COLORS.yellow + '  - ' + improvement + COLORS.reset);
		}
	}

	if (issues.length === 0 && improvements.length === 0) {
		console.log(COLORS.green + COLORS.bright + '\n Repository is in great shape!' + COLORS.reset);
	}

	// Health score
	let score = 100;
	score -= results.linting.errors * 5;
	score -= results.linting.warnings * 0.5;
	score -= results.typescript.errors * 2;
	score -= results.todos.fixmes * 2;
	if (results.tests?.coverage?.lines) {
		score -= Math.max(0, 80 - results.tests.coverage.lines);
	}
	if (results.tests?.tests?.failed > 0) {
		score -= results.tests.tests.failed * 10;
	}
	score = Math.max(0, Math.min(100, Math.round(score)));

	const scoreStatus = score >= 80 ? 'good' : score >= 60 ? 'warning' : 'bad';
	console.log('\n' + COLORS.bright + '  Health Score: ');
	console.log(
		(scoreStatus === 'good' ? COLORS.green : scoreStatus === 'warning' ? COLORS.yellow : COLORS.red) +
			`  ${score}/100` +
			COLORS.reset
	);

	return { issues, improvements, score };
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
	const args = process.argv.slice(2);
	const quick = args.includes('--quick');
	const jsonOutput = args.includes('--json');

	const startTime = Date.now();

	if (!jsonOutput) {
		printHeader('Neverquest Repository Analysis');
		console.log(COLORS.gray + `  Mode: ${quick ? 'quick' : 'full'}` + COLORS.reset);
		console.log(COLORS.gray + `  Time: ${new Date().toISOString()}` + COLORS.reset);
	}

	const results = {
		timestamp: new Date().toISOString(),
		mode: quick ? 'quick' : 'full',
		git: analyzeGitStatus(),
		codeMetrics: analyzeCodeMetrics(),
		linting: analyzeLinting(),
		typescript: analyzeTypeScript(),
		tests: analyzeTests(quick),
		todos: analyzeTodos(),
		documentation: analyzeDocumentation(),
		assets: analyzeAssets(),
		dependencies: analyzeDependencies(quick),
		complexity: analyzeComplexity(),
	};

	const summary = generateSummary(results);
	results.summary = summary;

	const duration = ((Date.now() - startTime) / 1000).toFixed(1);

	if (jsonOutput) {
		console.log(JSON.stringify(results, null, 2));
	} else {
		console.log(COLORS.gray + `\n  Completed in ${duration}s` + COLORS.reset);
	}

	// Save results to file
	if (!jsonOutput) {
		fs.writeFileSync(CONFIG.outputFile, JSON.stringify(results, null, 2));
		console.log(COLORS.gray + `  Results saved to ${CONFIG.outputFile}` + COLORS.reset + '\n');
	}

	// Exit with error code if there are critical issues
	if (results.linting.errors > 0 || (results.tests?.tests?.failed || 0) > 0) {
		process.exit(1);
	}
}

main().catch(console.error);
