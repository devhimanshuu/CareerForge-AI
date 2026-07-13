"use client";

import { useCallback, useRef } from "react";
import { useTrackUsage } from "./use-track-usage";

/** Structured events tracked by the Interview Lab monitoring system. */
export type LiveAudioEvent =
  | { type: "tts_success"; durationMs: number }
  | { type: "tts_error"; error: string; usedFallback: boolean }
  | { type: "tts_cancelled" }
  | { type: "tts_muted_skip" }
  | { type: "transcribe_success"; audioSize: number; textLength: number }
  | { type: "transcribe_error"; error: string }
  | { type: "transcribe_fallback"; textLength: number }
  | { type: "transcribe_empty_audio" }
  | { type: "transcribe_small_blob"; size: number }
  | { type: "silence_detected"; silenceDurationMs: number }
  | { type: "silence_reset" }
  | { type: "silence_prolonged_speaking"; durationMs: number }
  | { type: "session_start" }
  | { type: "session_end"; reason: "manual" | "error" | "completed" }
  | { type: "session_error"; errorType: string; errorMessage: string };

const PROLONGED_SPEAKING_MS = 30_000; // 30 seconds

/**
 * Monitors the live mode audio capture pipeline.
 *
 * Tracks TTS generation, transcription, silence detection, and session lifecycle
 * events through the existing `useTrackUsage` infrastructure, which provides
 *   • 800ms deduplication — prevents accidental double-tracks
 *   • 500ms batching — coalesces bursts into fewer HTTP calls
 *   • sendBeacon delivery — survives page navigation
 *
 * Also provides a prolonged-speaking watchdog that fires a callback if the
 * user has been speaking continuously for >30s without silence being detected.
 */
export function useInterviewMonitoring(onProlongedSpeaking?: () => void) {
  const { track } = useTrackUsage();

  const prolongedSpeakingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speakingStartTime = useRef<number | null>(null);

  const trackAudioEvent = useCallback(
    (event: LiveAudioEvent) => {
      switch (event.type) {
        case "tts_success":
          track({
            featureId: "interview_live_tts",
            action: "success",
            durationMs: event.durationMs,
          });
          break;
        case "tts_error":
          track({
            featureId: "interview_live_tts",
            action: "error",
            metadata: { error: event.error, fallback: event.usedFallback },
          });
          console.warn("[Interview Monitor] TTS error:", event.error);
          break;
        case "tts_cancelled":
          track({ featureId: "interview_live_tts", action: "cancelled" });
          break;
        case "tts_muted_skip":
          track({ featureId: "interview_live_tts", action: "muted_skip" });
          break;
        case "transcribe_success":
          track({
            featureId: "interview_live_transcribe",
            action: "success",
            metadata: {
              audioSize: event.audioSize,
              textLength: event.textLength,
            },
          });
          break;
        case "transcribe_error":
          track({
            featureId: "interview_live_transcribe",
            action: "error",
            metadata: { error: event.error },
          });
          console.warn("[Interview Monitor] Transcription error:", event.error);
          break;
        case "transcribe_fallback":
          track({
            featureId: "interview_live_transcribe",
            action: "fallback",
            metadata: { textLength: event.textLength },
          });
          break;
        case "transcribe_empty_audio":
          track({ featureId: "interview_live_transcribe", action: "empty_audio" });
          break;
        case "transcribe_small_blob":
          track({
            featureId: "interview_live_transcribe",
            action: "small_blob",
            metadata: { size: event.size },
          });
          break;
        case "silence_detected":
          track({
            featureId: "interview_live_silence",
            action: "detected",
            durationMs: event.silenceDurationMs,
          });
          break;
        case "silence_reset":
          track({ featureId: "interview_live_silence", action: "reset" });
          break;
        case "silence_prolonged_speaking":
          track({
            featureId: "interview_live_silence",
            action: "prolonged_speaking",
            durationMs: event.durationMs,
          });
          console.warn(
            `[Interview Monitor] Prolonged speaking: ${event.durationMs}ms — forcing silence detection`,
          );
          break;
        case "session_start":
          track({ featureId: "interview_live_session", action: "start" });
          break;
        case "session_end":
          track({
            featureId: "interview_live_session",
            action: "end",
            metadata: { reason: event.reason },
          });
          break;
        case "session_error":
          track({
            featureId: "interview_live_session",
            action: "error",
            metadata: {
              errorType: event.errorType,
              errorMessage: event.errorMessage,
            },
          });
          console.error(
            `[Interview Monitor] Session error [${event.errorType}]: ${event.errorMessage}`,
          );
          break;
        // Exhaustiveness check: if a new event type is added to the
        // LiveAudioEvent union but not handled above, TypeScript will
        // flag this line as an error.
        default:
          const _exhaustive: never = event;
          break;
      }
    },
    [track],
  );

  /**
   * Call when the user starts speaking (audio level > threshold).
   * Starts a watchdog timer that fires `onProlongedSpeaking` if the user
   * speaks continuously for >30s without silence being detected.
   */
  const startSpeakingTimer = useCallback(() => {
    if (speakingStartTime.current !== null) return; // Already timing
    speakingStartTime.current = Date.now();

    if (prolongedSpeakingTimer.current) {
      clearTimeout(prolongedSpeakingTimer.current);
    }

    prolongedSpeakingTimer.current = setTimeout(() => {
      const duration = Date.now() - (speakingStartTime.current || Date.now());
      trackAudioEvent({ type: "silence_prolonged_speaking", durationMs: duration });
      onProlongedSpeaking?.();
    }, PROLONGED_SPEAKING_MS);
  }, [trackAudioEvent, onProlongedSpeaking]);

  /**
   * Call when the user stops speaking (audio level drops below threshold).
   * Cancels the prolonged-speaking watchdog.
   */
  const stopSpeakingTimer = useCallback(() => {
    speakingStartTime.current = null;
    if (prolongedSpeakingTimer.current) {
      clearTimeout(prolongedSpeakingTimer.current);
      prolongedSpeakingTimer.current = null;
      // Emit silence_reset when the user actually transitions from
      // speaking → silent (i.e. a prolonged-speaking timer was active).
      // This fires only once per speaking→silent transition,
      // not on every 150ms poll when the user is already silent.
      trackAudioEvent({ type: "silence_reset" });
    }
  }, [trackAudioEvent]);

  /**
   * Cleanup all timers. Call on unmount or session end.
   */
  const clearMonitoring = useCallback(() => {
    stopSpeakingTimer();
  }, [stopSpeakingTimer]);

  return {
    trackAudioEvent,
    startSpeakingTimer,
    stopSpeakingTimer,
    clearMonitoring,
  };
}
