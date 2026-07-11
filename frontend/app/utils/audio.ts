export function playAudioFeedback(type: "correct" | "incorrect") {
    try {
        const AudioContext =
            window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        const audioCtx = new AudioContext();

        // Resume context if suspended (common in browsers until user interacts)
        if (audioCtx.state === "suspended") {
            void audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === "correct") {
            // Short, two-note ascending chime (e.g. C5 to E5)
            osc.type = "sine";
            osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
            osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5

            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.3);
        } else {
            // Descending low buzz/thud
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(150, audioCtx.currentTime); // Low pitch
            osc.frequency.exponentialRampToValueAtTime(
                100,
                audioCtx.currentTime + 0.2,
            ); // Descend

            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.2);
        }
    } catch (err) {
        // Fail silently, e.g. if autoplay policy blocked it
        console.warn("Audio playback failed or is blocked by the browser:", err);
    }
}
