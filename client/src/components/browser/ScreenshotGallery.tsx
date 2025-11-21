import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Camera,
  Download,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { toast } from 'sonner';

export interface Screenshot {
  id: string;
  url: string;
  timestamp: string;
  stepNumber?: number;
  description?: string;
}

interface ScreenshotGalleryProps {
  screenshots: Screenshot[];
  className?: string;
}

export function ScreenshotGallery({ screenshots, className = '' }: ScreenshotGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % screenshots.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  const downloadScreenshot = (screenshot: Screenshot) => {
    const a = document.createElement('a');
    a.href = screenshot.url;
    a.download = `screenshot-${screenshot.id}.png`;
    a.click();
    toast.success('Screenshot download started');
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  if (screenshots.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Screenshots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <Camera className="h-12 w-12 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No screenshots available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentScreenshot = screenshots[currentIndex];

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Screenshots
              <Badge variant="outline">{screenshots.length}</Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {screenshots.map((screenshot, index) => (
              <div
                key={screenshot.id}
                className="group relative aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={screenshot.url}
                  alt={screenshot.description || `Screenshot ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 bg-white/10 hover:bg-white/20 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(index);
                    }}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 bg-white/10 hover:bg-white/20 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadScreenshot(screenshot);
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 bg-white/10 hover:bg-white/20 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      openInNewTab(screenshot.url);
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                {/* Step badge */}
                {screenshot.stepNumber && (
                  <Badge
                    variant="secondary"
                    className="absolute top-2 left-2 text-xs bg-black/60 text-white border-0"
                  >
                    Step {screenshot.stepNumber}
                  </Badge>
                )}

                {/* Timestamp */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-xs text-white truncate">
                    {new Date(screenshot.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-black">
          <div className="relative w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur">
              <div className="text-white">
                <h3 className="font-semibold">
                  Screenshot {currentIndex + 1} of {screenshots.length}
                </h3>
                {currentScreenshot?.stepNumber && (
                  <p className="text-xs text-slate-300">
                    Step {currentScreenshot.stepNumber}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadScreenshot(currentScreenshot)}
                  className="text-white hover:bg-white/10"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openInNewTab(currentScreenshot.url)}
                  className="text-white hover:bg-white/10"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeLightbox}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center p-4 relative">
              <img
                src={currentScreenshot?.url}
                alt={currentScreenshot?.description || 'Screenshot'}
                className="max-w-full max-h-full object-contain"
              />

              {/* Navigation buttons */}
              {screenshots.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/60 hover:bg-black/80 text-white p-0"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/60 hover:bg-black/80 text-white p-0"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-black/80 backdrop-blur">
              {currentScreenshot?.description && (
                <p className="text-sm text-white">{currentScreenshot.description}</p>
              )}
              <p className="text-xs text-slate-400">
                {new Date(currentScreenshot?.timestamp).toLocaleString()}
              </p>
            </div>

            {/* Thumbnails */}
            <div className="p-4 bg-black/80 backdrop-blur border-t border-white/10 overflow-x-auto">
              <div className="flex gap-2">
                {screenshots.map((screenshot, index) => (
                  <button
                    key={screenshot.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`flex-shrink-0 w-20 h-14 rounded border-2 overflow-hidden ${
                      index === currentIndex
                        ? 'border-white'
                        : 'border-transparent opacity-50 hover:opacity-100'
                    } transition-all`}
                  >
                    <img
                      src={screenshot.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
