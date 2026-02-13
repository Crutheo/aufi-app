import { useRef, useState } from "react";

interface ImageCaptureProps {
  onCapture: (file: File) => void;
}

export function ImageCapture({ onCapture }: ImageCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onCapture(file);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
      {preview ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full overflow-hidden rounded-lg border dark:border-gray-700"
        >
          <img src={preview} alt="Preview" className="aspect-square w-full object-cover" />
          <p className="py-2 text-center text-sm text-gray-500 dark:text-gray-400">Tap to retake</p>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-square w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-500"
        >
          <div className="text-center">
            <p className="text-4xl">📷</p>
            <p className="mt-2 text-sm">Take photo or choose file</p>
          </div>
        </button>
      )}
    </div>
  );
}
