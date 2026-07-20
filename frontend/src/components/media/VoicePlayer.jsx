import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Trash2, Mic, Square, Loader2, AlertCircle } from 'lucide-react';

/**
 * Individual Audio Player Component for a single voice note.
 */
const AudioPlayerInstance = ({ voice, isEditable, onDelete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(voice.duration || 0);
  const audioRef = useRef(null);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const handleTogglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          progressIntervalRef.current = setInterval(() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime);
            }
          }, 100);
        })
        .catch((err) => {
          console.error('Audio play error:', err);
        });
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isUploading = voice.status === 'uploading';
  const isFailed = voice.status === 'failed';

  return (
    <div className="flex items-center gap-4 bg-warm-ivory border border-warm-gray/10 px-5 py-3.5 rounded-2xl w-full shadow-sm relative group">
      {/* Audio Element */}
      {!isUploading && !isFailed && (
        <audio
          ref={audioRef}
          src={voice.url}
          onEnded={handleAudioEnded}
          onLoadedMetadata={handleLoadedMetadata}
          preload="metadata"
        />
      )}

      {/* Play/Pause Button */}
      {isUploading ? (
        <div className="w-10 h-10 rounded-full bg-dusty-rose/10 flex items-center justify-center shrink-0">
          <Loader2 size={16} className="text-dusty-rose animate-spin" />
        </div>
      ) : isFailed ? (
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 text-red-400">
          <AlertCircle size={18} />
        </div>
      ) : (
        <button
          onClick={handleTogglePlay}
          className="w-10 h-10 rounded-full bg-deep-brown hover:bg-dusty-rose text-white flex items-center justify-center transition-all duration-200 shadow-sm shrink-0 active:scale-95"
        >
          {isPlaying ? <Pause size={15} fill="white" /> : <Play size={15} className="ml-0.5" fill="white" />}
        </button>
      )}

      {/* Time & Waveform slider */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-center text-[10px] text-warm-gray/60 font-semibold mb-1 uppercase tracking-wider">
          <span>{isUploading ? 'Uploading Note...' : isFailed ? 'Failed to upload' : 'Voice Note'}</span>
          <span>{isUploading ? '' : isFailed ? '' : `${formatTime(currentTime)} / ${formatTime(duration)}`}</span>
        </div>

        {/* CSS Waveform & Slider Stack */}
        <div className="relative w-full h-4 flex items-center">
          {/* Animated mockup waveform in background */}
          <div className="absolute inset-0 flex items-center justify-between gap-[3px] opacity-20 pointer-events-none select-none px-1">
            {Array.from({ length: 28 }).map((_, i) => {
              // Create dynamic wave height
              const heightPct = [40, 60, 20, 80, 50, 90, 30, 70, 45, 85, 35, 60, 75, 20, 50, 80, 40, 65, 85, 30, 90, 50, 75, 20, 60, 40, 55, 30][i];
              // Animate on play
              return (
                <motion.div
                  key={i}
                  className="bg-deep-brown rounded-full w-[2px]"
                  style={{ height: `${heightPct}%` }}
                  animate={isPlaying ? {
                    scaleY: [1, 1.3, 0.7, 1],
                    transition: { repeat: Infinity, duration: 1.2, delay: i * 0.04 }
                  } : { scaleY: 1 }}
                />
              );
            })}
          </div>

          {/* Seek Input Slider */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            disabled={isUploading || isFailed}
            className="w-full h-full opacity-60 hover:opacity-100 cursor-pointer accent-dusty-rose bg-transparent absolute inset-0 z-10 appearance-none outline-none slider-thumb-styled"
          />
        </div>
      </div>

      {/* Delete Trigger */}
      {isEditable && !isUploading && (
        <button
          onClick={() => {
            if (window.confirm('Delete this voice note?')) {
              onDelete(voice._id || voice.id);
            }
          }}
          className="text-warm-gray hover:text-red-400 p-2 rounded-full hover:bg-red-50 transition-colors shrink-0 md:opacity-0 md:group-hover:opacity-100"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
};

/**
 * Main VoicePlayer Component
 * Displays a list of recordings and triggers live MediaRecorder recording.
 */
const VoicePlayer = ({ voiceNotes, isEditable, onAddVoice, onDeleteVoice }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    // Cleanup recording timer on unmount
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const handleStartRecording = async () => {
    audioChunksRef.current = [];
    setErrorMsg(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Close stream tracks to stop microphone recording light
        stream.getTracks().forEach((track) => track.stop());

        if (audioBlob.size > 0) {
          onAddVoice(audioBlob);
        }
      };

      // Start timer
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access failed:', err);
      setErrorMsg('Could not access microphone. Please check permissions.');
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const formatRecordingTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-3 mt-4 select-none">
      {/* List of active players */}
      {voiceNotes && voiceNotes.length > 0 && (
        <div className="space-y-2.5 max-w-xl">
          {voiceNotes.map((voice) => (
            <AudioPlayerInstance
              key={voice._id || voice.id || voice.url}
              voice={voice}
              isEditable={isEditable}
              onDelete={onDeleteVoice}
            />
          ))}
        </div>
      )}

      {/* Recording status panel */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-4 bg-dusty-rose/10 border border-dusty-rose/20 px-5 py-3 rounded-2xl max-w-xl text-deep-brown"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
            <div className="flex-1 text-sm font-serif italic text-deep-brown/80">
              Recording live voice note...
            </div>
            <div className="text-sm font-semibold tracking-wider font-mono text-dusty-rose bg-white px-2.5 py-0.5 rounded-md border border-dusty-rose/10 shadow-sm shrink-0">
              {formatRecordingTimer(recordingSeconds)}
            </div>
            <button
              onClick={handleStopRecording}
              className="bg-red-500 hover:bg-red-600 hover:scale-105 active:scale-95 text-white p-2.5 rounded-full shadow-md transition-all shrink-0 flex items-center justify-center"
            >
              <Square size={13} fill="white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic permission or setup warning */}
      {errorMsg && (
        <p className="text-xs font-semibold text-red-500 flex items-center gap-1">
          <AlertCircle size={12} /> {errorMsg}
        </p>
      )}

      {/* Trigger recording or show recorder button in writing/edit mode */}
      {isEditable && !isRecording && (
        <div className="flex gap-2">
          <button
            onClick={handleStartRecording}
            className="flex items-center gap-2 text-xs font-semibold text-deep-brown hover:text-dusty-rose transition-colors bg-soft-beige hover:bg-dusty-rose/10 px-4 py-2.5 rounded-full border border-warm-gray/10"
          >
            <Mic size={13} className="text-dusty-rose" />
            Record Live Note
          </button>
        </div>
      )}
    </div>
  );
};

export default VoicePlayer;
