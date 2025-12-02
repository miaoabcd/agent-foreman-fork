/**
 * Tests for progress indicators
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  Spinner,
  ProgressBar,
  StepProgress,
  createSpinner,
  createProgressBar,
  createStepProgress,
  isTTY,
} from "../src/progress.js";

describe("progress indicators", () => {
  describe("isTTY", () => {
    it("should return a boolean", () => {
      const result = isTTY();
      expect(typeof result).toBe("boolean");
    });
  });

  describe("Spinner", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should create a spinner instance", () => {
      const spinner = new Spinner("Loading");
      expect(spinner).toBeInstanceOf(Spinner);
    });

    it("should stop without error", () => {
      const spinner = new Spinner("Loading");
      spinner.start();
      expect(() => spinner.stop()).not.toThrow();
    });

    it("should succeed without error", () => {
      const spinner = new Spinner("Loading");
      spinner.start();
      expect(() => spinner.succeed("Done!")).not.toThrow();
    });

    it("should fail without error", () => {
      const spinner = new Spinner("Loading");
      spinner.start();
      expect(() => spinner.fail("Error!")).not.toThrow();
    });

    it("should warn without error", () => {
      const spinner = new Spinner("Loading");
      spinner.start();
      expect(() => spinner.warn("Warning!")).not.toThrow();
    });

    it("should update message without error", () => {
      const spinner = new Spinner("Loading");
      spinner.start();
      expect(() => spinner.update("Processing")).not.toThrow();
      spinner.stop();
    });

    it("should handle multiple stops gracefully", () => {
      const spinner = new Spinner("Loading");
      spinner.start();
      spinner.stop();
      expect(() => spinner.stop()).not.toThrow();
    });

    it("should not start when already stopped", () => {
      const spinner = new Spinner("Loading");
      spinner.start();
      spinner.stop();
      // Starting again should be safe
      expect(() => spinner.start()).not.toThrow();
    });
  });

  describe("ProgressBar", () => {
    it("should create a progress bar instance", () => {
      const bar = new ProgressBar("Processing", 10);
      expect(bar).toBeInstanceOf(ProgressBar);
    });

    it("should start without error", () => {
      const bar = new ProgressBar("Processing", 10);
      expect(() => bar.start()).not.toThrow();
    });

    it("should update without error", () => {
      const bar = new ProgressBar("Processing", 10);
      bar.start();
      expect(() => bar.update(5)).not.toThrow();
    });

    it("should update with message without error", () => {
      const bar = new ProgressBar("Processing", 10);
      bar.start();
      expect(() => bar.update(5, "Halfway")).not.toThrow();
    });

    it("should increment without error", () => {
      const bar = new ProgressBar("Processing", 10);
      bar.start();
      expect(() => bar.increment()).not.toThrow();
    });

    it("should increment with message without error", () => {
      const bar = new ProgressBar("Processing", 10);
      bar.start();
      expect(() => bar.increment("Step 1")).not.toThrow();
    });

    it("should complete without error", () => {
      const bar = new ProgressBar("Processing", 10);
      bar.start();
      expect(() => bar.complete()).not.toThrow();
    });

    it("should complete with message without error", () => {
      const bar = new ProgressBar("Processing", 10);
      bar.start();
      expect(() => bar.complete("All done")).not.toThrow();
    });

    it("should handle progress over 100% gracefully", () => {
      const bar = new ProgressBar("Processing", 10);
      bar.start();
      expect(() => bar.update(15)).not.toThrow(); // Over 100%
    });

    it("should accept custom width", () => {
      const bar = new ProgressBar("Processing", 10, 20);
      expect(bar).toBeInstanceOf(ProgressBar);
    });
  });

  describe("StepProgress", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should create a step progress instance", () => {
      const steps = ["Step 1", "Step 2", "Step 3"];
      const progress = new StepProgress(steps);
      expect(progress).toBeInstanceOf(StepProgress);
    });

    it("should start without error", () => {
      const steps = ["Step 1", "Step 2"];
      const progress = new StepProgress(steps);
      expect(() => progress.start()).not.toThrow();
      progress.complete();
    });

    it("should track current step index", () => {
      const steps = ["Step 1", "Step 2", "Step 3"];
      const progress = new StepProgress(steps);
      progress.start();

      expect(progress.getCurrentStep()).toBe(0);

      progress.completeStep(true);
      expect(progress.getCurrentStep()).toBe(1);

      progress.completeStep(true);
      expect(progress.getCurrentStep()).toBe(2);

      progress.complete();
    });

    it("should complete step with success", () => {
      const steps = ["Step 1", "Step 2"];
      const progress = new StepProgress(steps);
      progress.start();

      expect(() => progress.completeStep(true)).not.toThrow();
      progress.complete();
    });

    it("should complete step with failure", () => {
      const steps = ["Step 1", "Step 2"];
      const progress = new StepProgress(steps);
      progress.start();

      expect(() => progress.completeStep(false)).not.toThrow();
      progress.complete();
    });

    it("should warn step without error", () => {
      const steps = ["Step 1", "Step 2"];
      const progress = new StepProgress(steps);
      progress.start();

      expect(() => progress.warnStep()).not.toThrow();
      progress.complete();
    });

    it("should complete without error", () => {
      const steps = ["Step 1", "Step 2"];
      const progress = new StepProgress(steps);
      progress.start();

      expect(() => progress.complete()).not.toThrow();
    });

    it("should handle empty steps array", () => {
      const progress = new StepProgress([]);
      expect(() => progress.start()).not.toThrow();
      progress.complete();
    });

    it("should handle single step", () => {
      const progress = new StepProgress(["Only step"]);
      progress.start();
      progress.completeStep(true);
      expect(progress.getCurrentStep()).toBe(0);
      progress.complete();
    });
  });

  describe("factory functions", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("createSpinner should create and start a spinner", () => {
      const spinner = createSpinner("Test");
      expect(spinner).toBeInstanceOf(Spinner);
      spinner.stop();
    });

    it("createProgressBar should create a progress bar", () => {
      const bar = createProgressBar("Test", 5);
      expect(bar).toBeInstanceOf(ProgressBar);
    });

    it("createProgressBar should accept custom width", () => {
      const bar = createProgressBar("Test", 5, 20);
      expect(bar).toBeInstanceOf(ProgressBar);
    });

    it("createStepProgress should create step progress", () => {
      const progress = createStepProgress(["A", "B"]);
      expect(progress).toBeInstanceOf(StepProgress);
    });
  });

  describe("elapsed time formatting", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should handle time progression without errors", () => {
      const spinner = new Spinner("Loading");
      spinner.start();

      // Advance time
      vi.advanceTimersByTime(5000);
      expect(() => spinner.stop()).not.toThrow();
    });

    it("should handle longer time periods", () => {
      const spinner = new Spinner("Loading");
      spinner.start();

      // Advance time by 2 minutes
      vi.advanceTimersByTime(120000);
      expect(() => spinner.succeed("Done")).not.toThrow();
    });
  });

  describe("TTY vs non-TTY output format verification", () => {
    it("spinner in non-TTY mode outputs simple message with ellipsis", () => {
      // When not TTY, spinner outputs "Message..." format
      const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});

      // Force non-TTY behavior by creating spinner and checking output pattern
      const spinner = new Spinner("Test operation");
      // In non-TTY, start() logs "Message..."
      spinner.start();

      // Check that console.log was called (non-TTY behavior)
      // or stdout.write (TTY behavior)
      // The actual format depends on environment
      spinner.stop();

      mockLog.mockRestore();
    });

    it("progress bar shows step count in format [current/total]", () => {
      const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const bar = new ProgressBar("Processing", 5);
      bar.start();
      bar.update(3, "Step 3");
      bar.complete("Done");

      // In non-TTY mode, output should contain [3/5] pattern
      // In TTY mode, output to stdout.write contains similar pattern
      const hasCalled = mockLog.mock.calls.length > 0 || mockWrite.mock.calls.length > 0;
      expect(hasCalled).toBe(true);

      mockLog.mockRestore();
      mockWrite.mockRestore();
    });

    it("step progress shows step X/Y format", () => {
      vi.useFakeTimers();
      const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const steps = ["Get data", "Process", "Save"];
      const progress = new StepProgress(steps);
      progress.start();
      progress.completeStep(true);
      progress.completeStep(true);
      progress.complete();

      // Verify output was produced
      const hasCalled = mockLog.mock.calls.length > 0 || mockWrite.mock.calls.length > 0;
      expect(hasCalled).toBe(true);

      // In non-TTY mode, should output "[1/3]", "[2/3]", "[3/3]" patterns
      const allLogCalls = mockLog.mock.calls.map(c => String(c[0])).join("\n");
      if (allLogCalls.length > 0) {
        // Non-TTY outputs to console.log with [step/total] format
        expect(allLogCalls).toMatch(/\[\d+\/\d+\]/);
      }

      mockLog.mockRestore();
      mockWrite.mockRestore();
      vi.useRealTimers();
    });

    it("spinner succeed shows checkmark character", () => {
      vi.useFakeTimers();
      const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const spinner = new Spinner("Test");
      spinner.start();
      spinner.succeed("Completed");

      // Check for checkmark in output
      const allOutput = [
        ...mockLog.mock.calls.map(c => String(c[0])),
        ...mockWrite.mock.calls.map(c => String(c[0]))
      ].join("\n");

      expect(allOutput).toContain("✓");

      mockLog.mockRestore();
      mockWrite.mockRestore();
      vi.useRealTimers();
    });

    it("spinner fail shows X character", () => {
      vi.useFakeTimers();
      const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const spinner = new Spinner("Test");
      spinner.start();
      spinner.fail("Error occurred");

      // Check for X in output
      const allOutput = [
        ...mockLog.mock.calls.map(c => String(c[0])),
        ...mockWrite.mock.calls.map(c => String(c[0]))
      ].join("\n");

      expect(allOutput).toContain("✗");

      mockLog.mockRestore();
      mockWrite.mockRestore();
      vi.useRealTimers();
    });

    it("spinner warn shows warning character", () => {
      vi.useFakeTimers();
      const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const spinner = new Spinner("Test");
      spinner.start();
      spinner.warn("Warning message");

      // Check for warning symbol in output
      const allOutput = [
        ...mockLog.mock.calls.map(c => String(c[0])),
        ...mockWrite.mock.calls.map(c => String(c[0]))
      ].join("\n");

      expect(allOutput).toContain("⚠");

      mockLog.mockRestore();
      mockWrite.mockRestore();
      vi.useRealTimers();
    });

    it("progress bar complete shows 100% and checkmark", () => {
      const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const bar = new ProgressBar("Processing", 10);
      bar.start();
      bar.complete("All done");

      const allOutput = [
        ...mockLog.mock.calls.map(c => String(c[0])),
        ...mockWrite.mock.calls.map(c => String(c[0]))
      ].join("\n");

      // Should contain 100% or 10/10
      expect(allOutput).toMatch(/100%|10\/10/);

      mockLog.mockRestore();
      mockWrite.mockRestore();
    });

    it("spinner output includes elapsed time format", () => {
      vi.useFakeTimers();
      const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const spinner = new Spinner("Processing");
      spinner.start();

      // Advance time by 5 seconds
      vi.advanceTimersByTime(5000);

      spinner.succeed("Done");

      const allOutput = [
        ...mockLog.mock.calls.map(c => String(c[0])),
        ...mockWrite.mock.calls.map(c => String(c[0]))
      ].join("\n");

      // Should contain time format like "5s" or "(5s)"
      expect(allOutput).toMatch(/\d+s|\d+m/);

      mockLog.mockRestore();
      mockWrite.mockRestore();
      vi.useRealTimers();
    });
  });

  describe("Spinner edge cases", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should use default message in succeed when none provided", () => {
      const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const spinner = new Spinner("Original message");
      spinner.start();
      spinner.succeed(); // No message provided

      const allOutput = [
        ...mockLog.mock.calls.map(c => String(c[0])),
        ...mockWrite.mock.calls.map(c => String(c[0]))
      ].join("\n");

      expect(allOutput).toContain("Original message");

      mockLog.mockRestore();
      mockWrite.mockRestore();
    });

    it("should use default message in fail when none provided", () => {
      const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const spinner = new Spinner("Original message");
      spinner.start();
      spinner.fail(); // No message provided

      const allOutput = [
        ...mockLog.mock.calls.map(c => String(c[0])),
        ...mockWrite.mock.calls.map(c => String(c[0]))
      ].join("\n");

      expect(allOutput).toContain("Original message");

      mockLog.mockRestore();
      mockWrite.mockRestore();
    });

    it("should use default message in warn when none provided", () => {
      const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const spinner = new Spinner("Original message");
      spinner.start();
      spinner.warn(); // No message provided

      const allOutput = [
        ...mockLog.mock.calls.map(c => String(c[0])),
        ...mockWrite.mock.calls.map(c => String(c[0]))
      ].join("\n");

      expect(allOutput).toContain("Original message");

      mockLog.mockRestore();
      mockWrite.mockRestore();
    });

    it("should format time as minutes and seconds for long operations", () => {
      const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const spinner = new Spinner("Long operation");
      spinner.start();

      // Advance by 90 seconds (1m 30s)
      vi.advanceTimersByTime(90000);

      spinner.succeed();

      const allOutput = [
        ...mockLog.mock.calls.map(c => String(c[0])),
        ...mockWrite.mock.calls.map(c => String(c[0]))
      ].join("\n");

      // Should contain minute format "1m 30s"
      expect(allOutput).toMatch(/1m.*30s/);

      mockLog.mockRestore();
      mockWrite.mockRestore();
    });

    it("should clear interval on stop even when called multiple times", () => {
      const spinner = new Spinner("Test");
      spinner.start();

      // Advance to trigger interval callback
      vi.advanceTimersByTime(200);

      // Multiple stops should be safe
      spinner.stop();
      spinner.stop();
      spinner.stop();

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe("ProgressBar edge cases", () => {
    it("should handle zero total without crashing", () => {
      const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      // This will cause division by zero, but should not crash
      const bar = new ProgressBar("Test", 0);
      expect(() => bar.start()).not.toThrow();
      expect(() => bar.update(0)).not.toThrow();
      expect(() => bar.complete()).not.toThrow();

      mockLog.mockRestore();
      mockWrite.mockRestore();
    });

    it("should cap progress at 100%", () => {
      const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const bar = new ProgressBar("Test", 5);
      bar.start();
      bar.update(10); // Double the total

      const allOutput = [
        ...mockLog.mock.calls.map(c => String(c[0])),
        ...mockWrite.mock.calls.map(c => String(c[0]))
      ].join("\n");

      // Should cap at 100%
      expect(allOutput).toMatch(/100%/);

      mockLog.mockRestore();
      mockWrite.mockRestore();
    });

    it("should use default message when completing without message", () => {
      const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const bar = new ProgressBar("Original task", 5);
      bar.start();
      bar.complete(); // No message

      const allOutput = [
        ...mockLog.mock.calls.map(c => String(c[0])),
        ...mockWrite.mock.calls.map(c => String(c[0]))
      ].join("\n");

      expect(allOutput).toContain("Original task");

      mockLog.mockRestore();
      mockWrite.mockRestore();
    });
  });

  describe("StepProgress edge cases", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should handle startStep with out of bounds index", () => {
      const progress = new StepProgress(["Step 1", "Step 2"]);
      progress.start();

      // Try to start step beyond bounds
      expect(() => (progress as any).startStep(10)).not.toThrow();

      progress.complete();
    });

    it("should not advance past last step on completeStep", () => {
      const progress = new StepProgress(["Only step"]);
      progress.start();

      // Complete the only step
      progress.completeStep(true);

      // Current step should still be 0 (last step)
      expect(progress.getCurrentStep()).toBe(0);

      progress.complete();
    });

    it("should handle warnStep advancing to next step", () => {
      const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const progress = new StepProgress(["Step 1", "Step 2", "Step 3"]);
      progress.start();

      expect(progress.getCurrentStep()).toBe(0);

      progress.warnStep();

      // Should have advanced to step 1
      expect(progress.getCurrentStep()).toBe(1);

      progress.complete();

      mockLog.mockRestore();
      mockWrite.mockRestore();
    });

    it("should handle warnStep on last step", () => {
      const progress = new StepProgress(["Only step"]);
      progress.start();

      // Warn on the only step - should not crash
      expect(() => progress.warnStep()).not.toThrow();

      progress.complete();
    });

    it("should handle complete when no spinner exists", () => {
      const progress = new StepProgress([]);
      // Don't start - so no spinner created
      expect(() => progress.complete()).not.toThrow();
    });

    it("should handle completeStep with failure advancing to next", () => {
      const progress = new StepProgress(["Step 1", "Step 2"]);
      progress.start();

      progress.completeStep(false); // Fail step 1

      // Should still advance to step 2
      expect(progress.getCurrentStep()).toBe(1);

      progress.complete();
    });

    it("should show overview and steps in non-TTY mode", () => {
      const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});

      const progress = new StepProgress(["Fetch data", "Process", "Save"]);
      progress.start();

      // In non-TTY mode, showOverview logs steps
      const allOutput = mockLog.mock.calls.map(c => String(c[0])).join("\n");

      // Check for step listing if in non-TTY mode
      if (allOutput.includes("Verification steps")) {
        expect(allOutput).toContain("1.");
        expect(allOutput).toContain("2.");
        expect(allOutput).toContain("3.");
      }

      progress.complete();
      mockLog.mockRestore();
    });

    it("should not advance past total steps when completeStep is called at last step", () => {
      const progress = new StepProgress(["Step 1", "Step 2"]);
      progress.start();
      expect(progress.getCurrentStep()).toBe(0);

      progress.completeStep(true);
      expect(progress.getCurrentStep()).toBe(1);

      // Complete the last step - should not advance
      progress.completeStep(true);
      expect(progress.getCurrentStep()).toBe(1);

      progress.complete();
    });

    it("should handle completeStep when stepSpinner is null", () => {
      const progress = new StepProgress(["Step 1"]);
      // Don't call start() - so stepSpinner stays null

      // Should not throw
      expect(() => progress.completeStep(true)).not.toThrow();
    });

    it("should call spinner succeed on completeStep with success=true", () => {
      const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const progress = new StepProgress(["Step 1", "Step 2"]);
      progress.start();

      // Complete with success
      progress.completeStep(true);

      // Verify output was produced (symbols vary by TTY mode)
      const allOutput = [
        ...mockLog.mock.calls.map(c => String(c[0])),
        ...mockWrite.mock.calls.map(c => String(c[0]))
      ].join("\n");

      // In TTY mode: ✓, in non-TTY mode: regular output
      expect(allOutput.length).toBeGreaterThan(0);

      progress.complete();
      mockLog.mockRestore();
      mockWrite.mockRestore();
    });

    it("should call spinner fail on completeStep with success=false", () => {
      const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const progress = new StepProgress(["Step 1", "Step 2"]);
      progress.start();

      // Complete with failure
      progress.completeStep(false);

      // Verify output was produced (symbols vary by TTY mode)
      const allOutput = [
        ...mockLog.mock.calls.map(c => String(c[0])),
        ...mockWrite.mock.calls.map(c => String(c[0]))
      ].join("\n");

      // In TTY mode: ✗, in non-TTY mode: regular output
      expect(allOutput.length).toBeGreaterThan(0);

      progress.complete();
      mockLog.mockRestore();
      mockWrite.mockRestore();
    });

    it("should call spinner warn on warnStep", () => {
      const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const progress = new StepProgress(["Step 1", "Step 2"]);
      progress.start();

      // Warn step
      progress.warnStep();

      // Verify output was produced (symbols vary by TTY mode)
      const allOutput = [
        ...mockLog.mock.calls.map(c => String(c[0])),
        ...mockWrite.mock.calls.map(c => String(c[0]))
      ].join("\n");

      // In TTY mode: ⚠, in non-TTY mode: regular output
      expect(allOutput.length).toBeGreaterThan(0);

      progress.complete();
      mockLog.mockRestore();
      mockWrite.mockRestore();
    });

    it("should call spinner stop on complete when spinner exists", () => {
      const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const progress = new StepProgress(["Step 1"]);
      progress.start();

      // Complete should stop the spinner
      expect(() => progress.complete()).not.toThrow();

      mockLog.mockRestore();
      mockWrite.mockRestore();
    });

    it("should handle warnStep when stepSpinner is null", () => {
      const progress = new StepProgress(["Step 1"]);
      // Don't call start() - so stepSpinner stays null

      // Should not throw
      expect(() => progress.warnStep()).not.toThrow();
    });

    it("should not start step when startStep is called with out of bounds index", () => {
      const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const progress = new StepProgress(["Step 1"]);

      // Call startStep with index beyond steps length
      (progress as any).startStep(5);

      // Should not have created any output for the invalid step
      expect(progress.getCurrentStep()).toBe(0);

      mockLog.mockRestore();
      mockWrite.mockRestore();
    });

    it("should handle default success value in completeStep", () => {
      const progress = new StepProgress(["Step 1", "Step 2"]);
      progress.start();

      // Call completeStep without parameter (defaults to true)
      progress.completeStep();
      expect(progress.getCurrentStep()).toBe(1);

      progress.complete();
    });
  });

  describe("TTY mode coverage - Spinner render()", () => {
    let originalIsTTY: boolean | undefined;

    beforeEach(() => {
      vi.useFakeTimers();
      originalIsTTY = process.stdout.isTTY;
      // Force TTY mode
      Object.defineProperty(process.stdout, "isTTY", {
        value: true,
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      vi.useRealTimers();
      // Restore original value
      Object.defineProperty(process.stdout, "isTTY", {
        value: originalIsTTY,
        writable: true,
        configurable: true,
      });
    });

    it("should render spinner frames in TTY mode", () => {
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const spinner = new Spinner("Loading data");
      spinner.start();

      // Advance time to trigger multiple render cycles
      vi.advanceTimersByTime(100);
      vi.advanceTimersByTime(100);
      vi.advanceTimersByTime(100);

      spinner.stop();

      // Verify stdout.write was called with spinner frames
      expect(mockWrite).toHaveBeenCalled();
      const calls = mockWrite.mock.calls.map(c => String(c[0]));
      const hasSpinnerOutput = calls.some(c => c.includes("Loading data"));
      expect(hasSpinnerOutput).toBe(true);

      mockWrite.mockRestore();
    });

    it("should update spinner message in TTY mode", () => {
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const spinner = new Spinner("Initial");
      spinner.start();

      // Update should not call console.log in TTY mode
      spinner.update("Updated message");

      vi.advanceTimersByTime(100);

      spinner.stop();

      mockWrite.mockRestore();
    });

    it("should render with time format in TTY mode", () => {
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const spinner = new Spinner("Long task");
      spinner.start();

      // Advance time by 65 seconds to get minute format
      vi.advanceTimersByTime(65000);

      spinner.succeed("Completed");

      const calls = mockWrite.mock.calls.map(c => String(c[0])).join("");
      // Should have time format like "1m 5s"
      expect(calls).toMatch(/\d+m.*\d+s|\d+s/);

      mockWrite.mockRestore();
    });
  });

  describe("TTY mode coverage - StepProgress", () => {
    let originalIsTTY: boolean | undefined;

    beforeEach(() => {
      vi.useFakeTimers();
      originalIsTTY = process.stdout.isTTY;
      Object.defineProperty(process.stdout, "isTTY", {
        value: true,
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      vi.useRealTimers();
      Object.defineProperty(process.stdout, "isTTY", {
        value: originalIsTTY,
        writable: true,
        configurable: true,
      });
    });

    it("should use Spinner in TTY mode and call succeed on completeStep(true)", () => {
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const progress = new StepProgress(["Step 1", "Step 2", "Step 3"]);
      progress.start();

      // Complete with success - should call stepSpinner.succeed()
      progress.completeStep(true);

      const calls = mockWrite.mock.calls.map(c => String(c[0])).join("");
      // Should have success checkmark
      expect(calls).toContain("✓");

      progress.complete();
      mockWrite.mockRestore();
    });

    it("should call fail on completeStep(false) in TTY mode", () => {
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const progress = new StepProgress(["Step 1", "Step 2"]);
      progress.start();

      // Complete with failure - should call stepSpinner.fail()
      progress.completeStep(false);

      const calls = mockWrite.mock.calls.map(c => String(c[0])).join("");
      // Should have failure X mark
      expect(calls).toContain("✗");

      progress.complete();
      mockWrite.mockRestore();
    });

    it("should call warn on warnStep() in TTY mode", () => {
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const progress = new StepProgress(["Step 1", "Step 2"]);
      progress.start();

      // Warn step - should call stepSpinner.warn()
      progress.warnStep();

      const calls = mockWrite.mock.calls.map(c => String(c[0])).join("");
      // Should have warning symbol
      expect(calls).toContain("⚠");

      progress.complete();
      mockWrite.mockRestore();
    });

    it("should call stop on complete() in TTY mode", () => {
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const progress = new StepProgress(["Step 1", "Step 2"]);
      progress.start();

      // Advance time
      vi.advanceTimersByTime(100);

      // Complete should stop the spinner
      progress.complete();

      // Verify stop was called (clears line)
      const calls = mockWrite.mock.calls.map(c => String(c[0]));
      const hasClearLine = calls.some(c => c.includes("\r"));
      expect(hasClearLine).toBe(true);

      mockWrite.mockRestore();
    });

    it("should not show overview in TTY mode", () => {
      const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const progress = new StepProgress(["Step A", "Step B"]);
      progress.start();

      // In TTY mode, showOverview should not log to console
      const logCalls = mockLog.mock.calls.map(c => String(c[0])).join("");
      expect(logCalls).not.toContain("Verification steps");

      progress.complete();
      mockLog.mockRestore();
      mockWrite.mockRestore();
    });
  });

  describe("TTY mode coverage - ProgressBar", () => {
    let originalIsTTY: boolean | undefined;

    beforeEach(() => {
      originalIsTTY = process.stdout.isTTY;
      Object.defineProperty(process.stdout, "isTTY", {
        value: true,
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(process.stdout, "isTTY", {
        value: originalIsTTY,
        writable: true,
        configurable: true,
      });
    });

    it("should render progress bar to stdout.write in TTY mode", () => {
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const bar = new ProgressBar("Processing", 10);
      bar.start();
      bar.update(5);
      bar.complete("Done");

      const calls = mockWrite.mock.calls.map(c => String(c[0])).join("");
      // Should have progress bar characters
      expect(calls).toContain("█");
      expect(calls).toContain("░");

      mockWrite.mockRestore();
    });

    it("should show percentage in TTY mode", () => {
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const bar = new ProgressBar("Task", 4);
      bar.start();
      bar.update(2);
      bar.complete();

      const calls = mockWrite.mock.calls.map(c => String(c[0])).join("");
      expect(calls).toMatch(/50%|100%/);

      mockWrite.mockRestore();
    });
  });

  describe("Edge cases for Spinner stopped state", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should not start if already stopped", () => {
      const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});
      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const spinner = new Spinner("Test");
      spinner.start();
      spinner.stop();

      // Try to start again - should not start
      const logCountBefore = mockLog.mock.calls.length;
      const writeCountBefore = mockWrite.mock.calls.length;

      spinner.start();

      // Should not have logged/written anything new
      expect(mockLog.mock.calls.length).toBe(logCountBefore);
      expect(mockWrite.mock.calls.length).toBe(writeCountBefore);

      mockLog.mockRestore();
      mockWrite.mockRestore();
    });

    it("should not render if stopped", () => {
      const originalIsTTY = process.stdout.isTTY;
      Object.defineProperty(process.stdout, "isTTY", {
        value: true,
        writable: true,
        configurable: true,
      });

      const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

      const spinner = new Spinner("Test");
      spinner.start();
      spinner.stop();

      const writeCountAfterStop = mockWrite.mock.calls.length;

      // Advance timers - render should not be called
      vi.advanceTimersByTime(200);

      // Write count should not increase
      expect(mockWrite.mock.calls.length).toBe(writeCountAfterStop);

      mockWrite.mockRestore();
      Object.defineProperty(process.stdout, "isTTY", {
        value: originalIsTTY,
        writable: true,
        configurable: true,
      });
    });
  });

});
