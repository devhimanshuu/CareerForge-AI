/**
 * InterviewSessionManager
 * WebRTC session manager for real-time live interview mode.
 * Handles media capture, audio chunking, silence detection, and transcription.
 */

export interface SessionConfig {
  audio: boolean;
  video: boolean;
}

export interface TranscriptionResult {
  success: boolean;
  text: string;
  provider?: string;
  error?: string;
}

export class InterviewSessionManager {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private chunks: Blob[] = [];
  private isRecordingActive = false;

  /**
   * Start a WebRTC media session (camera + microphone).
   */
  async startSession(config: SessionConfig): Promise<MediaStream> {
    // Clean up any existing session first
    this.cleanup();

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: config.audio,
      video: config.video
        ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        }
        : false,
    });

    // Set up AudioContext + AnalyserNode for volume monitoring
    if (config.audio) {
      this.audioContext = new AudioContext();
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      source.connect(this.analyser);
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }

    return this.mediaStream;
  }

  /**
   * Start recording audio in chunks of `intervalMs` milliseconds.
   * Each chunk is passed to the `onChunk` callback.
   */
  startRecording(): void {
    if (!this.mediaStream) {
      throw new Error("No active media stream. Call startSession() first.");
    }

    // If already recording, stop first
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.stop();
    }

    this.chunks = [];
    this.isRecordingActive = true;

    // Determine supported MIME type
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/ogg";

    this.mediaRecorder = new MediaRecorder(this.mediaStream, { mimeType });

    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      this.isRecordingActive = false;
    };

    this.mediaRecorder.start();
  }

  /**
   * Stop recording audio.
   */
  stopRecording(): void {
    if (this.mediaRecorder && this.isRecordingActive) {
      this.mediaRecorder.stop();
      this.isRecordingActive = false;
    }
  }

  /**
   * Get current audio level (0-1) from the AnalyserNode.
   * Returns 0 if analyser is not set up.
   */
  getAudioLevel(): number {
    if (!this.analyser || !this.dataArray) return 0;

    this.analyser.getByteFrequencyData(this.dataArray);

    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }

    const average = sum / this.dataArray.length;
    return Math.min(1, average / 128); // Normalize to 0-1
  }

  /**
   * Transcribe an audio chunk by sending it to the /api/audio/transcribe endpoint.
   */
  async transcribeChunk(audioBlob: Blob, keyterms?: string): Promise<TranscriptionResult> {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "chunk.webm");

      if (keyterms) {
        formData.append("keyterms", keyterms);
      }

      const response = await fetch("/api/audio/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.text) {
        return {
          success: true,
          text: data.text,
          provider: data.provider,
        };
      }

      return {
        success: false,
        text: "",
        error: data.message || "Transcription returned empty result",
      };
    } catch (error: any) {
      return {
        success: false,
        text: "",
        error: error.message || "Failed to transcribe chunk",
      };
    }
  }

  /**
   * Get the combined recorded audio as a single Blob.
   */
  getFullRecording(): Blob | null {
    if (this.chunks.length === 0) return null;
    const mimeType = this.mediaRecorder?.mimeType || "audio/webm";
    return new Blob(this.chunks, { type: mimeType });
  }

  /**
   * Whether recording is currently active.
   */
  get isRecording(): boolean {
    return this.isRecordingActive;
  }

  /**
   * Get the active media stream (for video preview).
   */
  get stream(): MediaStream | null {
    return this.mediaStream;
  }

  /**
   * Release all resources.
   */
  cleanup(): void {
    this.stopRecording();

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close().catch(() => { });
      this.audioContext = null;
    }

    this.analyser = null;
    this.dataArray = null;
    this.chunks = [];
    this.mediaRecorder = null;
    this.isRecordingActive = false;
  }
}

/**
 * Utility: Detect silence from audio levels over time.
 * Returns true when audio has been below threshold for the specified duration.
 */
export function createSilenceDetector(
  threshold: number = 0.08,
  silenceDurationMs: number = 2000,
) {
  let silenceStart: number | null = null;

  return {
    /** Feed the current audio level. Returns true if silence was detected. */
    check(audioLevel: number): boolean {
      const now = Date.now();

      if (audioLevel < threshold) {
        if (silenceStart === null) {
          silenceStart = now;
        }
        return now - silenceStart >= silenceDurationMs;
      } else {
        silenceStart = null;
        return false;
      }
    },
    /** Reset the silence detection state. */
    reset(): void {
      silenceStart = null;
    },
  };
}
