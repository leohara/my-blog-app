/**
 * Logger utility for centralized logging
 * 環境に応じて適切なログレベルを管理
 */

/**
 * ログレベルの定義
 */
export const LogLevel = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
} as const;

export type LogLevelType = (typeof LogLevel)[keyof typeof LogLevel];

/**
 * ロガーユーティリティ
 */
export const logger = {
  /**
   * エラーログ
   * 開発環境・本番環境両方で出力
   */
  error: (message: string, ...args: unknown[]) => {
    console.error(message, ...args);
    // 本番環境では、将来的にエラー監視サービスへの送信も可能
    // if (process.env.NODE_ENV !== "development") {
    //   sendToErrorMonitoring(message, args);
    // }
  },

  /**
   * 警告ログ
   * 開発環境でのみ出力
   */
  warn: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.warn(message, ...args);
    }
  },

  /**
   * 情報ログ
   * 開発環境でのみ出力
   */
  info: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.info(message, ...args);
    }
  },

  /**
   * デバッグログ
   * 開発環境でのみ出力
   */
  debug: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(message, ...args);
    }
  },

  /**
   * グループ化されたログ
   * 開発環境でのみ出力
   */
  group: (label: string) => {
    if (process.env.NODE_ENV === "development") {
      console.group(label);
    }
  },

  groupEnd: () => {
    if (process.env.NODE_ENV === "development") {
      console.groupEnd();
    }
  },
};

/**
 * コンポーネント固有のロガーを作成
 * @param componentName コンポーネント名
 * @returns コンポーネント名をプレフィックスに持つロガー
 */
export const createLogger = (componentName: string) => {
  const prefix = `[${componentName}]`;

  return {
    error: (message: string, ...args: unknown[]) =>
      logger.error(`${prefix} ${message}`, ...args),
    warn: (message: string, ...args: unknown[]) =>
      logger.warn(`${prefix} ${message}`, ...args),
    info: (message: string, ...args: unknown[]) =>
      logger.info(`${prefix} ${message}`, ...args),
    debug: (message: string, ...args: unknown[]) =>
      logger.debug(`${prefix} ${message}`, ...args),
  };
};
