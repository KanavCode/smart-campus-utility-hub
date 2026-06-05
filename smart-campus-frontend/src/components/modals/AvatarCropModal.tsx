import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, CropIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AvatarCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onSave: (croppedBlob: Blob) => Promise<void>;
}

/**
 * Generates a cropped image Blob from a source image URL and pixel crop area.
 * Uses an off-screen canvas to perform the crop client-side.
 */
async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImageBitmap(await fetch(imageSrc).then((r) => r.blob()));

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      },
      'image/jpeg',
      0.92
    );
  });
}

export const AvatarCropModal = ({ isOpen, imageSrc, onClose, onSave }: AvatarCropModalProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setSaving(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
      await onSave(blob);
      onClose();
    } catch {
      toast.error('Failed to crop image. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="glass w-full max-w-lg rounded-2xl border border-border/50 overflow-hidden"
            >
              {/* Header */}
              <div className="glass border-b border-border/50 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <CropIcon className="h-5 w-5 text-primary" />
                  Crop Profile Photo
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-accent/20"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Crop area */}
              <div className="relative w-full" style={{ height: '340px' }}>
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              {/* Zoom controls */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
                    className="p-2 rounded-lg hover:bg-accent/20 text-muted-foreground"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="h-5 w-5" />
                  </motion.button>

                  <input
                    id="avatar-zoom-slider"
                    type="range"
                    min={1}
                    max={3}
                    step={0.05}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1 accent-primary h-1 rounded-full cursor-pointer"
                    aria-label="Zoom level"
                  />

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                    className="p-2 rounded-lg hover:bg-accent/20 text-muted-foreground"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="h-5 w-5" />
                  </motion.button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Drag to reposition · Scroll or use slider to zoom
                </p>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={saving}
                    asChild
                  >
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                      Cancel
                    </motion.button>
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary text-primary-foreground glow-primary-hover"
                    asChild
                  >
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                      {saving ? 'Saving…' : 'Save Photo'}
                    </motion.button>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
