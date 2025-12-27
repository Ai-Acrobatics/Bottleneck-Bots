import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  ExternalLink,
  Download,
  AlertCircle,
} from 'lucide-react';

interface SessionRecordingViewerProps {
  recordingUrl?: string;
  recordingStatus?: string;
  sessionId: string;
  className?: string;
}

export function SessionRecordingViewer({
  recordingUrl,
  recordingStatus,
  sessionId,
  className = '',
}: SessionRecordingViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value[0];
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = value[0];
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const restart = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play();
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const openInNewTab = () => {
    if (recordingUrl) {
      window.open(recordingUrl, '_blank');
    }
  };

  const downloadRecording = () => {
    if (recordingUrl) {
      const a = document.createElement('a');
      a.href = recordingUrl;
      a.download = `session-${sessionId}-recording.mp4`;
      a.click();
    }
  };

  // Determine recording availability
  const isRecordingAvailable = recordingUrl && recordingStatus === 'COMPLETE';
  const isRecordingProcessing = recordingStatus === 'PROCESSING';
  const isRecordingFailed = recordingStatus === 'FAILED';

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Video className="h-4 w-4" />
            Session Recording
          </CardTitle>
          {recordingStatus && (
            <Badge
              variant={
                isRecordingAvailable
                  ? 'default'
                  : isRecordingProcessing
                  ? 'secondary'
                  : 'destructive'
              }
            >
              {recordingStatus}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isRecordingProcessing ? (
          <div className="text-center py-12 text-slate-500">
            <Video className="h-12 w-12 mx-auto mb-3 animate-pulse" />
            <p className="font-medium">Recording is being processed</p>
            <p className="text-sm mt-1">This may take a few minutes</p>
          </div>
        ) : isRecordingFailed ? (
          <div className="text-center py-12 text-red-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-3" />
            <p className="font-medium">Recording failed</p>
            <p className="text-sm mt-1">The session recording could not be generated</p>
          </div>
        ) : !isRecordingAvailable ? (
          <div className="text-center py-12 text-slate-500">
            <Video className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No recording available</p>
            <p className="text-sm mt-1">
              Recording was not enabled for this session
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Video Player */}
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                src={recordingUrl}
                className="w-full h-full"
                onClick={togglePlayPause}
              />

              {/* Play/Pause Overlay */}
              {!isPlaying && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
                  onClick={togglePlayPause}
                >
                  <div className="bg-white/90 rounded-full p-4">
                    <Play className="h-8 w-8 text-slate-900" />
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-3">
              {/* Progress Bar */}
              <div className="space-y-1">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="cursor-pointer"
                />
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePlayPause}
                    className="h-8 w-8 p-0"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={restart}
                    className="h-8 w-8 p-0"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-2 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="h-8 w-8 p-0"
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.1}
                      onValueChange={handleVolumeChange}
                      className="w-24 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadRecording}
                    className="gap-1 h-8"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openInNewTab}
                    className="gap-1 h-8"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="h-8 w-8 p-0"
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
