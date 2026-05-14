import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, UploadCloud, X } from 'lucide-react';

interface ImageUploadFieldProps {
  image: File | null;
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
}

export const ImageUploadField = ({
  image,
  onImageSelect,
  onImageRemove,
}: ImageUploadFieldProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) onImageSelect(acceptedFiles[0]);
    },
    [onImageSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxSize: 5 * 1024 * 1024, // 5 MB
    multiple: false,
  });

  const previewUrl = image ? URL.createObjectURL(image) : null;

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Event Poster{' '}
        <span className="text-xs font-normal text-gray-400">(optional · max 5 MB)</span>
      </label>

      <AnimatePresence mode="wait">
        {image && previewUrl ? (
          /* ── Preview ── */
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60"
          >
            {/* File info row */}
            <div className="flex items-center gap-3 p-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg shadow-sm">
                <img
                  src={previewUrl}
                  alt="Event poster preview"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                  {image.name}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {(image.size / 1024).toFixed(1)} KB &middot;{' '}
                  {image.type.split('/')[1].toUpperCase()}
                </p>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={onImageRemove}
                aria-label="Remove image"
                className="shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500
                           dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Full preview strip */}
            <div className="border-t border-gray-100 dark:border-gray-700 p-3">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                Preview
              </p>
              <img
                src={previewUrl}
                alt="Full event poster"
                className="w-full rounded-lg object-cover"
                style={{ maxHeight: 200 }}
              />
            </div>

            {/* Change image */}
            <div className="border-t border-gray-100 dark:border-gray-700 px-3 py-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium
                                text-blue-600 dark:text-blue-400 hover:underline underline-offset-2">
                <ImageIcon className="h-3.5 w-3.5" />
                Change image
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onImageSelect(file);
                  }}
                />
              </label>
            </div>
          </motion.div>
        ) : (
          /* ── Drop Zone ── */
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
          >
            <div
              {...getRootProps()}
              className={[
                'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-9 transition-all duration-200',
                isDragReject
                  ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
                  : isDragActive
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]'
                  : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/40 hover:border-blue-400 hover:bg-blue-50/40 dark:hover:border-blue-500 dark:hover:bg-blue-900/10',
              ].join(' ')}
            >
              <input {...getInputProps()} />

              <motion.div
                animate={{ y: isDragActive ? -4 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={[
                  'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
                  isDragReject
                    ? 'bg-red-100 dark:bg-red-900/40'
                    : isDragActive
                    ? 'bg-blue-100 dark:bg-blue-900/40'
                    : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100',
                ].join(' ')}
              >
                <UploadCloud
                  className={[
                    'h-6 w-6 transition-colors',
                    isDragReject
                      ? 'text-red-500'
                      : isDragActive
                      ? 'text-blue-500'
                      : 'text-gray-400',
                  ].join(' ')}
                />
              </motion.div>

              <div className="text-center">
                {isDragReject ? (
                  <p className="text-sm font-medium text-red-600">File type not supported</p>
                ) : isDragActive ? (
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Drop it here!
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        Click to upload
                      </span>{' '}
                      or drag &amp; drop
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      PNG, JPG, GIF, WebP — up to 5 MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};