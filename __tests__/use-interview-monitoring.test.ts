/**
 * useInterviewMonitoring — Comprehensive Unit Tests
 *
 * Covers all 15 LiveAudioEvent types (transformed into track() calls
 * with the correct featureId, action, and metadata), plus the
 * prolonged-speaking watchdog timer (startSpeakingTimer,
 * stopSpeakingTimer, clearMonitoring).
 *
 * Since the hook uses only useCallback and useRef (no useState/useEffect),
 * we mock those React hooks so the hook can be called as a plain function.
 * useTrackUsage is mocked so we can assert on the track() spy.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// ─── Mock React hooks so useInterviewMonitoring works without a renderer ───
vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useCallback: <T extends (...args: never[]) => unknown>(
      fn: T,
      _deps: unknown[],
    ): T => fn,
    useRef: <T>(initialValue: T): { current: T } => ({ current: initialValue }),
  };
});

// ─── Mock useTrackUsage — stable vi.fn() reference for assertions ─────────
const mockTrack = vi.fn();

vi.mock("@/hooks/use-track-usage", () => ({
  useTrackUsage: () => ({ track: mockTrack }),
}));

import { useInterviewMonitoring } from "@/hooks/use-interview-monitoring";

// ═══════════════════════════════════════════════════════════════════════════════
//  Test suite
// ═══════════════════════════════════════════════════════════════════════════════

describe("useInterviewMonitoring", () => {
  let onProlongedSpeaking: ReturnType<typeof vi.fn>;
  let hook: ReturnType<typeof useInterviewMonitoring>;

  beforeEach(() => {
    mockTrack.mockClear();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.useFakeTimers();

    onProlongedSpeaking = vi.fn();
    hook = useInterviewMonitoring(onProlongedSpeaking as () => void);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //  trackAudioEvent — all 15 event types + edge cases
  // ═══════════════════════════════════════════════════════════════════════════

  describe("trackAudioEvent", () => {
    // ── TTS events (4 types) ──────────────────────────────────────

    describe("tts_success", () => {
      it("tracks with featureId interview_live_tts and action success", () => {
        hook.trackAudioEvent({ type: "tts_success", durationMs: 150 });
        expect(mockTrack).toHaveBeenCalledTimes(1);
        expect(mockTrack).toHaveBeenCalledWith({
          featureId: "interview_live_tts",
          action: "success",
          durationMs: 150,
        });
      });

      it("passes the exact durationMs", () => {
        hook.trackAudioEvent({ type: "tts_success", durationMs: 0 });
        expect(mockTrack).toHaveBeenCalledWith(
          expect.objectContaining({ durationMs: 0 }),
        );
      });

      it("accepts large durationMs values", () => {
        hook.trackAudioEvent({ type: "tts_success", durationMs: 999999 });
        expect(mockTrack).toHaveBeenCalledWith(
          expect.objectContaining({ durationMs: 999999 }),
        );
      });
    });

    describe("tts_error", () => {
      it("tracks with error metadata", () => {
        hook.trackAudioEvent({
          type: "tts_error",
          error: "ElevenLabs API timeout",
          usedFallback: true,
        });
        expect(mockTrack).toHaveBeenCalledTimes(1);
        expect(mockTrack).toHaveBeenCalledWith({
          featureId: "interview_live_tts",
          action: "error",
          metadata: { error: "ElevenLabs API timeout", fallback: true },
        });
      });

      it("logs a warning to console", () => {
        hook.trackAudioEvent({
          type: "tts_error",
          error: "network error",
          usedFallback: false,
        });
        expect(console.warn).toHaveBeenCalledWith(
          "[Interview Monitor] TTS error:",
          "network error",
        );
      });

      it("handles usedFallback: false", () => {
        hook.trackAudioEvent({
          type: "tts_error",
          error: "playback failed",
          usedFallback: false,
        });
        expect(mockTrack).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: { error: "playback failed", fallback: false },
          }),
        );
      });
    });

    describe("tts_cancelled", () => {
      it("tracks without extra metadata", () => {
        hook.trackAudioEvent({ type: "tts_cancelled" });
        expect(mockTrack).toHaveBeenCalledTimes(1);
        expect(mockTrack).toHaveBeenCalledWith({
          featureId: "interview_live_tts",
          action: "cancelled",
        });
      });
    });

    describe("tts_muted_skip", () => {
      it("tracks when TTS is skipped due to mute", () => {
        hook.trackAudioEvent({ type: "tts_muted_skip" });
        expect(mockTrack).toHaveBeenCalledTimes(1);
        expect(mockTrack).toHaveBeenCalledWith({
          featureId: "interview_live_tts",
          action: "muted_skip",
        });
      });
    });

    // ── Transcription events (5 types) ────────────────────────────

    describe("transcribe_success", () => {
      it("tracks with audioSize and textLength metadata", () => {
        hook.trackAudioEvent({
          type: "transcribe_success",
          audioSize: 64000,
          textLength: 120,
        });
        expect(mockTrack).toHaveBeenCalledTimes(1);
        expect(mockTrack).toHaveBeenCalledWith({
          featureId: "interview_live_transcribe",
          action: "success",
          metadata: { audioSize: 64000, textLength: 120 },
        });
      });

      it("handles zero-size audio", () => {
        hook.trackAudioEvent({
          type: "transcribe_success",
          audioSize: 0,
          textLength: 0,
        });
        expect(mockTrack).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: { audioSize: 0, textLength: 0 },
          }),
        );
      });
    });

    describe("transcribe_error", () => {
      it("tracks with error message", () => {
        hook.trackAudioEvent({
          type: "transcribe_error",
          error: "No speech detected",
        });
        expect(mockTrack).toHaveBeenCalledTimes(1);
        expect(mockTrack).toHaveBeenCalledWith({
          featureId: "interview_live_transcribe",
          action: "error",
          metadata: { error: "No speech detected" },
        });
      });

      it("logs a warning to console", () => {
        hook.trackAudioEvent({
          type: "transcribe_error",
          error: "server returned 500",
        });
        expect(console.warn).toHaveBeenCalledWith(
          "[Interview Monitor] Transcription error:",
          "server returned 500",
        );
      });
    });

    describe("transcribe_fallback", () => {
      it("tracks with textLength", () => {
        hook.trackAudioEvent({
          type: "transcribe_fallback",
          textLength: 85,
        });
        expect(mockTrack).toHaveBeenCalledTimes(1);
        expect(mockTrack).toHaveBeenCalledWith({
          featureId: "interview_live_transcribe",
          action: "fallback",
          metadata: { textLength: 85 },
        });
      });

      it("handles textLength of 0", () => {
        hook.trackAudioEvent({ type: "transcribe_fallback", textLength: 0 });
        expect(mockTrack).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: { textLength: 0 },
          }),
        );
      });
    });

    describe("transcribe_empty_audio", () => {
      it("tracks without extra metadata", () => {
        hook.trackAudioEvent({ type: "transcribe_empty_audio" });
        expect(mockTrack).toHaveBeenCalledTimes(1);
        expect(mockTrack).toHaveBeenCalledWith({
          featureId: "interview_live_transcribe",
          action: "empty_audio",
        });
      });
    });

    describe("transcribe_small_blob", () => {
      it("tracks with size metadata", () => {
        hook.trackAudioEvent({ type: "transcribe_small_blob", size: 200 });
        expect(mockTrack).toHaveBeenCalledTimes(1);
        expect(mockTrack).toHaveBeenCalledWith({
          featureId: "interview_live_transcribe",
          action: "small_blob",
          metadata: { size: 200 },
        });
      });

      it("handles size of 0", () => {
        hook.trackAudioEvent({ type: "transcribe_small_blob", size: 0 });
        expect(mockTrack).toHaveBeenCalledWith(
          expect.objectContaining({ metadata: { size: 0 } }),
        );
      });
    });

    // ── Silence detection events (3 types) ────────────────────────

    describe("silence_detected", () => {
      it("tracks with silenceDurationMs", () => {
        hook.trackAudioEvent({
          type: "silence_detected",
          silenceDurationMs: 2000,
        });
        expect(mockTrack).toHaveBeenCalledTimes(1);
        expect(mockTrack).toHaveBeenCalledWith({
          featureId: "interview_live_silence",
          action: "detected",
          durationMs: 2000,
        });
      });

      it("handles zero silence duration", () => {
        hook.trackAudioEvent({
          type: "silence_detected",
          silenceDurationMs: 0,
        });
        expect(mockTrack).toHaveBeenCalledWith(
          expect.objectContaining({ durationMs: 0 }),
        );
      });
    });

    describe("silence_reset", () => {
      it("tracks without extra metadata", () => {
        hook.trackAudioEvent({ type: "silence_reset" });
        expect(mockTrack).toHaveBeenCalledTimes(1);
        expect(mockTrack).toHaveBeenCalledWith({
          featureId: "interview_live_silence",
          action: "reset",
        });
      });
    });

    describe("silence_prolonged_speaking", () => {
      it("tracks with durationMs", () => {
        hook.trackAudioEvent({
          type: "silence_prolonged_speaking",
          durationMs: 35000,
        });
        expect(mockTrack).toHaveBeenCalledTimes(1);
        expect(mockTrack).toHaveBeenCalledWith({
          featureId: "interview_live_silence",
          action: "prolonged_speaking",
          durationMs: 35000,
        });
      });

      it("logs a warning to console", () => {
        hook.trackAudioEvent({
          type: "silence_prolonged_speaking",
          durationMs: 30001,
        });
        expect(console.warn).toHaveBeenCalledWith(
          "[Interview Monitor] Prolonged speaking: 30001ms — forcing silence detection",
        );
      });
    });

    // ── Session lifecycle events (3 types) ────────────────────────

    describe("session_start", () => {
      it("tracks without extra metadata", () => {
        hook.trackAudioEvent({ type: "session_start" });
        expect(mockTrack).toHaveBeenCalledTimes(1);
        expect(mockTrack).toHaveBeenCalledWith({
          featureId: "interview_live_session",
          action: "start",
        });
      });
    });

    describe("session_end", () => {
      it("tracks with reason: manual", () => {
        hook.trackAudioEvent({ type: "session_end", reason: "manual" });
        expect(mockTrack).toHaveBeenCalledTimes(1);
        expect(mockTrack).toHaveBeenCalledWith({
          featureId: "interview_live_session",
          action: "end",
          metadata: { reason: "manual" },
        });
      });

      it("tracks with reason: completed", () => {
        hook.trackAudioEvent({ type: "session_end", reason: "completed" });
        expect(mockTrack).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: { reason: "completed" },
          }),
        );
      });

      it("tracks with reason: error", () => {
        hook.trackAudioEvent({ type: "session_end", reason: "error" });
        expect(mockTrack).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: { reason: "error" },
          }),
        );
      });
    });

    describe("session_error", () => {
      it("tracks with errorType and errorMessage", () => {
        hook.trackAudioEvent({
          type: "session_error",
          errorType: "NotAllowedError",
          errorMessage: "Camera access denied",
        });
        expect(mockTrack).toHaveBeenCalledTimes(1);
        expect(mockTrack).toHaveBeenCalledWith({
          featureId: "interview_live_session",
          action: "error",
          metadata: {
            errorType: "NotAllowedError",
            errorMessage: "Camera access denied",
          },
        });
      });

      it("logs an error to console", () => {
        hook.trackAudioEvent({
          type: "session_error",
          errorType: "NotFoundError",
          errorMessage: "No device found",
        });
        expect(console.error).toHaveBeenCalledWith(
          "[Interview Monitor] Session error [NotFoundError]: No device found",
        );
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //  Prolonged-speaking watchdog (startSpeakingTimer / stopSpeakingTimer /
  //  clearMonitoring)
  // ═══════════════════════════════════════════════════════════════════════════

  describe("startSpeakingTimer", () => {
    it("calls onProlongedSpeaking after 30 seconds of continuous speaking", () => {
      expect(onProlongedSpeaking).not.toHaveBeenCalled();

      hook.startSpeakingTimer();
      vi.advanceTimersByTime(29_999);
      expect(onProlongedSpeaking).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(onProlongedSpeaking).toHaveBeenCalledTimes(1);
    });

    it("is idempotent — calling twice does not start a second timer", () => {
      hook.startSpeakingTimer();
      hook.startSpeakingTimer();
      vi.advanceTimersByTime(30_000);

      expect(onProlongedSpeaking).toHaveBeenCalledTimes(1);
    });

    it("triggers the silence_prolonged_speaking track call when timer elapses", () => {
      hook.startSpeakingTimer();
      vi.advanceTimersByTime(30_000);

      // The timer fires trackAudioEvent which translates to a track() call
      // with featureId "interview_live_silence" and action "prolonged_speaking"
      expect(mockTrack).toHaveBeenCalledWith(
        expect.objectContaining({
          featureId: "interview_live_silence",
          action: "prolonged_speaking",
        }),
      );
    });

    it("records durationMs close to 30000 when timer fires", () => {
      hook.startSpeakingTimer();
      vi.advanceTimersByTime(30_000);

      const trackCall = mockTrack.mock.calls.find(
        (args: unknown[]) =>
          typeof args[0] === "object" &&
          args[0] !== null &&
          (args[0] as Record<string, unknown>).featureId === "interview_live_silence" &&
          (args[0] as Record<string, unknown>).action === "prolonged_speaking",
      );

      expect(trackCall).toBeDefined();
      if (trackCall) {
        const payload = trackCall[0] as Record<string, unknown>;
        expect(Number(payload.durationMs)).toBeGreaterThanOrEqual(29_000);
        expect(Number(payload.durationMs)).toBeLessThanOrEqual(31_000);
      }
    });
  });

  describe("stopSpeakingTimer", () => {
    it("cancels the prolonged-speaking timer", () => {
      hook.startSpeakingTimer();
      hook.stopSpeakingTimer();
      vi.advanceTimersByTime(30_000);

      expect(onProlongedSpeaking).not.toHaveBeenCalled();
    });

    it("is safe to call when no timer is running", () => {
      expect(() => hook.stopSpeakingTimer()).not.toThrow();
    });

    it("allows a fresh timer to be started after being stopped", () => {
      hook.startSpeakingTimer();
      hook.stopSpeakingTimer();
      hook.startSpeakingTimer();
      vi.advanceTimersByTime(30_000);

      expect(onProlongedSpeaking).toHaveBeenCalledTimes(1);
    });

    it("can be called multiple times without error", () => {
      hook.startSpeakingTimer();
      hook.stopSpeakingTimer();
      hook.stopSpeakingTimer();
      hook.stopSpeakingTimer();
    });
  });

  describe("clearMonitoring", () => {
    it("cancels any running timer", () => {
      hook.startSpeakingTimer();
      hook.clearMonitoring();
      vi.advanceTimersByTime(30_000);

      expect(onProlongedSpeaking).not.toHaveBeenCalled();
    });

    it("is safe to call when no timer is running", () => {
      expect(() => hook.clearMonitoring()).not.toThrow();
    });

    it("is safe to call multiple times", () => {
      hook.clearMonitoring();
      hook.clearMonitoring();
      hook.clearMonitoring();
    });
  });
});
