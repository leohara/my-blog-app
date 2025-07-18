// テストでNODE_ENVを動的に変更するため、jest.resetModulesが必要
import { LogLevel } from "@/lib/utils/logger";

/* eslint-disable @typescript-eslint/no-require-imports */
// NODE_ENVに基づく動的な挙動をテストするため、requireを使用する必要がある

describe("Logger Utility", () => {
  const originalEnv = process.env.NODE_ENV;
  const originalConsole = {
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug,
    group: console.group,
    groupEnd: console.groupEnd,
  };

  // process.envの型定義を拡張
  const env = process.env as { NODE_ENV?: string };

  beforeEach(() => {
    // モジュールキャッシュをクリア
    jest.resetModules();

    // モックをリセット
    console.error = jest.fn();
    console.warn = jest.fn();
    console.info = jest.fn();
    console.debug = jest.fn();
    console.group = jest.fn();
    console.groupEnd = jest.fn();
  });

  afterEach(() => {
    // 元の状態に戻す
    env.NODE_ENV = originalEnv;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
    console.debug = originalConsole.debug;
    console.group = originalConsole.group;
    console.groupEnd = originalConsole.groupEnd;

    // モジュールキャッシュをクリア
    jest.resetModules();
  });

  describe("logger", () => {
    describe("in development environment", () => {
      beforeEach(() => {
        env.NODE_ENV = "development";
      });

      it("should log error messages", () => {
        const { logger } = require("@/lib/utils/logger");
        logger.error("Test error", { details: "error details" });
        expect(console.error).toHaveBeenCalledWith("Test error", {
          details: "error details",
        });
      });

      it("should log warning messages", () => {
        const { logger } = require("@/lib/utils/logger");
        logger.warn("Test warning");
        expect(console.warn).toHaveBeenCalledWith("Test warning");
      });

      it("should log info messages", () => {
        const { logger } = require("@/lib/utils/logger");
        logger.info("Test info");
        expect(console.info).toHaveBeenCalledWith("Test info");
      });

      it("should log debug messages", () => {
        const { logger } = require("@/lib/utils/logger");
        logger.debug("Test debug");
        expect(console.debug).toHaveBeenCalledWith("Test debug");
      });

      it("should create console groups", () => {
        const { logger } = require("@/lib/utils/logger");
        logger.group("Test Group");
        expect(console.group).toHaveBeenCalledWith("Test Group");

        logger.groupEnd();
        expect(console.groupEnd).toHaveBeenCalled();
      });
    });

    describe("in production environment", () => {
      beforeEach(() => {
        env.NODE_ENV = "production";
      });

      it("should log error messages", () => {
        const { logger } = require("@/lib/utils/logger");
        logger.error("Test error");
        expect(console.error).toHaveBeenCalledWith("Test error");
      });

      it("should not log warning messages", () => {
        const { logger } = require("@/lib/utils/logger");
        logger.warn("Test warning");
        expect(console.warn).not.toHaveBeenCalled();
      });

      it("should not log info messages", () => {
        const { logger } = require("@/lib/utils/logger");
        logger.info("Test info");
        expect(console.info).not.toHaveBeenCalled();
      });

      it("should not log debug messages", () => {
        const { logger } = require("@/lib/utils/logger");
        logger.debug("Test debug");
        expect(console.debug).not.toHaveBeenCalled();
      });

      it("should not create console groups", () => {
        const { logger } = require("@/lib/utils/logger");
        logger.group("Test Group");
        expect(console.group).not.toHaveBeenCalled();

        logger.groupEnd();
        expect(console.groupEnd).not.toHaveBeenCalled();
      });
    });
  });

  describe("createLogger", () => {
    beforeEach(() => {
      env.NODE_ENV = "development";
    });

    it("should create a logger with component prefix", () => {
      const { createLogger } = require("@/lib/utils/logger");
      const componentLogger = createLogger("TestComponent");

      componentLogger.error("Error message");
      expect(console.error).toHaveBeenCalledWith(
        "[TestComponent] Error message",
      );

      componentLogger.warn("Warning message");
      expect(console.warn).toHaveBeenCalledWith(
        "[TestComponent] Warning message",
      );

      componentLogger.info("Info message");
      expect(console.info).toHaveBeenCalledWith("[TestComponent] Info message");

      componentLogger.debug("Debug message");
      expect(console.debug).toHaveBeenCalledWith(
        "[TestComponent] Debug message",
      );
    });

    it("should pass additional arguments correctly", () => {
      const { createLogger } = require("@/lib/utils/logger");
      const componentLogger = createLogger("TestComponent");
      const errorDetails = { code: "ERR_001", stack: "stack trace" };

      componentLogger.error("Error occurred", errorDetails);
      expect(console.error).toHaveBeenCalledWith(
        "[TestComponent] Error occurred",
        errorDetails,
      );
    });
  });

  describe("LogLevel", () => {
    it("should have correct log level constants", () => {
      expect(LogLevel.ERROR).toBe("error");
      expect(LogLevel.WARN).toBe("warn");
      expect(LogLevel.INFO).toBe("info");
      expect(LogLevel.DEBUG).toBe("debug");
    });
  });
});
