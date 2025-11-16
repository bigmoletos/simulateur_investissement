/**
 * Infrastructure de logging structuré
 *
 * Conformité Constitution: Logging structuré pour le débogage
 *
 * @author Simulateur de Placement
 * @version 1.0.0
 * @date 2025-11-15
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
	level: LogLevel;
	message: string;
	timestamp: Date;
	context?: Record<string, unknown>;
}

class Logger {
	private logs: LogEntry[] = [];
	private maxLogs = 1000;

	log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
		const entry: LogEntry = {
			level,
			message,
			timestamp: new Date(),
			context
		};

		this.logs.push(entry);

		// Garder seulement les N derniers logs
		if (this.logs.length > this.maxLogs) {
			this.logs.shift();
		}

		// Afficher dans la console selon le niveau
		const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
		const prefix = `[${level.toUpperCase()}] ${entry.timestamp.toISOString()}`;

		if (context) {
			console[consoleMethod](prefix, message, context);
		} else {
			console[consoleMethod](prefix, message);
		}
	}

	debug(message: string, context?: Record<string, unknown>): void {
		this.log('debug', message, context);
	}

	info(message: string, context?: Record<string, unknown>): void {
		this.log('info', message, context);
	}

	warn(message: string, context?: Record<string, unknown>): void {
		this.log('warn', message, context);
	}

	error(message: string, context?: Record<string, unknown>): void {
		this.log('error', message, context);
	}

	getLogs(level?: LogLevel): LogEntry[] {
		if (level) {
			return this.logs.filter((log) => log.level === level);
		}
		return [...this.logs];
	}

	clear(): void {
		this.logs = [];
	}
}

export const logger = new Logger();

