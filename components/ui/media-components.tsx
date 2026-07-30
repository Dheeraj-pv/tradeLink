import Image from "next/image";
("use client");

import { useEffect, useMemo } from "react";
import { UploadIcon, XCircleIcon } from "@/components/ui/icons";

type MediaKind = "image" | "video";

export type ServerMediaItem = {
  id: string;
  url: string;
  mediaType?: "IMAGE" | "VIDEO";
  type?: MediaKind;
};

function getMediaKind(item: ServerMediaItem): MediaKind {
  if (item.type) return item.type;
  return item.mediaType === "VIDEO" ? "video" : "image";
}

export function MediaPreviewModal({
  src,
  type,
  alt = "",
  onClose,
  zIndex = 1000,
  lightCloseButton = false,
}: {
  src: string;
  type: MediaKind;
  alt?: string;
  onClose: () => void;
  zIndex?: number;
  lightCloseButton?: boolean;
}) {
  return (
    <div className="preview-modal" style={{ zIndex }} onClick={onClose}>
      <div className="preview-content" onClick={(e) => e.stopPropagation()}>
        {type === "image" ? (
          <Image src="" alt="" width={100} height={100} />
        ) : (
          <video controls autoPlay>
            <source src={src} />
          </video>
        )}
        <button
          className={`close-btn ${lightCloseButton ? "light" : ""}`.trim()}
          onClick={onClose}
          aria-label="Close preview"
        >
          ×
        </button>
      </div>
      <style jsx>{`
        .preview-modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .preview-content {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
        }
        .preview-content img,
        .preview-content video {
          max-width: 90vw;
          max-height: 90vh;
          border-radius: 12px;
          display: block;
        }
        .close-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.7);
          color: #fff;
          font-size: 22px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .close-btn.light {
          top: -14px;
          right: -14px;
          width: 36px;
          height: 36px;
          background: #fff;
          color: var(--text);
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}

export function MediaGallery({
  items,
  onSelect,
  size = 100,
  rounded = 12,
  className,
}: {
  items: ServerMediaItem[];
  onSelect: (index: number) => void;
  size?: number;
  rounded?: number;
  className?: string;
}) {
  return (
    <div className={`media-grid ${className ?? ""}`.trim()}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className="media-item"
          onClick={() => onSelect(index)}
        >
          {getMediaKind(item) === "image" ? (
            <Image src="" alt="" width={100} height={100} />
          ) : (
            <video muted preload="metadata">
              <source src={item.url} />
            </video>
          )}
        </div>
      ))}
      <style jsx>{`
        .media-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .media-item {
          width: ${size}px;
          height: ${size}px;
          border-radius: ${rounded}px;
          overflow: hidden;
          cursor: pointer;
          flex-shrink: 0;
          background: #f4f4f4;
        }
        .media-item img,
        .media-item video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
      `}</style>
    </div>
  );
}

export function ExistingMediaGrid({
  items,
  onPreview,
  onRemove,
  removingId,
}: {
  items: ServerMediaItem[];
  onPreview: (index: number) => void;
  onRemove?: (id: string) => void;
  removingId?: string | null;
}) {
  return (
    <div className="media-grid">
      {items.map((item, index) => (
        <div key={item.id} className="media-tile">
          <div className="media-tile-inner" onClick={() => onPreview(index)}>
            {getMediaKind(item) === "image" ? (
              <Image src="" alt="" width={100} height={100} />
            ) : (
              <video muted src={item.url} />
            )}
          </div>
          {onRemove ? (
            <button
              type="button"
              className="media-remove"
              disabled={removingId === item.id}
              onClick={() => onRemove(item.id)}
              aria-label="Remove media"
            >
              <XCircleIcon width={16} height={16} />
            </button>
          ) : null}
        </div>
      ))}
      <style jsx>{`
        .media-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
          gap: 10px;
        }
        .media-tile {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          border-radius: 9px;
          overflow: hidden;
        }
        .media-tile-inner {
          width: 100%;
          height: 100%;
          cursor: pointer;
          background: #f5f2ee;
        }
        .media-tile-inner img,
        .media-tile-inner video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .media-remove {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(0, 0, 0, 0.6);
          border: none;
          border-radius: 50%;
          color: #fff;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
        }
        .media-remove:hover:not(:disabled) {
          background: rgba(211, 51, 51, 0.9);
        }
        .media-remove:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export function FileUploadDropzone({
  inputId,
  onFilesAdded,
  onInvalidFile,
  prompt,
  hint,
  accept = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm",
  maxSizeBytes = 10 * 1024 * 1024,
  compact = false,
}: {
  inputId: string;
  onFilesAdded: (files: File[]) => void;
  onInvalidFile?: (message: string) => void;
  prompt: string;
  hint: string;
  accept?: string;
  maxSizeBytes?: number;
  compact?: boolean;
}) {
  function filterValidFiles(incoming: File[]) {
    const validFiles = incoming.filter((file) => {
      if (file.size > maxSizeBytes) {
        const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
        onInvalidFile?.(`${file.name} exceeds the ${maxMb} MB limit.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      onFilesAdded(validFiles);
    }
  }

  return (
    <div
      className={`upload-zone ${compact ? "compact" : ""}`.trim()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        filterValidFiles(Array.from(e.dataTransfer.files));
      }}
      onClick={() => document.getElementById(inputId)?.click()}
    >
      <UploadIcon width={compact ? 20 : 22} height={compact ? 20 : 22} />
      <p>{prompt}</p>
      <p className="upload-hint">{hint}</p>
      <input
        id={inputId}
        type="file"
        accept={accept}
        multiple
        hidden
        onChange={(e) => {
          if (!e.target.files) return;
          filterValidFiles(Array.from(e.target.files));
          e.target.value = "";
        }}
      />
      <style jsx>{`
        .upload-zone {
          border: 1.5px dashed var(--border);
          border-radius: 12px;
          padding: 28px 20px;
          text-align: center;
          cursor: pointer;
          transition:
            border-color 0.15s,
            background 0.15s;
          color: var(--text);
        }
        .upload-zone.compact {
          padding: 16px 20px;
        }
        .upload-zone:hover {
          border-color: var(--navy);
          background: #f9f7f4;
        }
        .upload-zone :global(svg) {
          margin-bottom: 10px;
          color: var(--sub);
        }
        .upload-zone p {
          font-size: 0.85rem;
          font-weight: 500;
          margin: 0;
        }
        .upload-hint {
          font-size: 0.75rem !important;
          font-weight: 400 !important;
          color: #b0a898 !important;
          margin-top: 4px !important;
        }
      `}</style>
    </div>
  );
}

export function FileList({
  files,
  onPreview,
  onRemove,
  compact = false,
  className,
}: {
  files: File[];
  onPreview: (index: number) => void;
  onRemove: (index: number) => void;
  compact?: boolean;
  className?: string;
}) {
  const previews = useMemo(
    () =>
      files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        isVideo: file.type.startsWith("video/"),
      })),
    [files],
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  return (
    <div className={`file-list ${className ?? ""}`.trim()}>
      {previews.map((preview, index) => (
        <div key={`${preview.file.name}-${index}`} className="file-row">
          <div className="file-thumb" onClick={() => onPreview(index)}>
            {preview.isVideo ? (
              <video muted>
                <source src={preview.url} type={preview.file.type} />
              </video>
            ) : (
              <Image src="" alt="" width={100} height={100} />
            )}
          </div>
          <div className="file-info">
            <p className="file-name">{preview.file.name}</p>
            <p className="file-size">
              {(preview.file.size / 1024).toFixed(0)} KB
            </p>
          </div>
          <button
            type="button"
            className="file-remove"
            onClick={() => onRemove(index)}
            aria-label="Remove file"
          >
            <XCircleIcon width={compact ? 14 : 16} height={compact ? 14 : 16} />
          </button>
        </div>
      ))}
      <style jsx>{`
        .file-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }
        .file-row {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f5f2ee;
          border-radius: 9px;
          padding: ${compact ? "8px 12px" : "10px 12px"};
        }
        .file-thumb {
          width: ${compact ? "36px" : "40px"};
          height: ${compact ? "36px" : "40px"};
          border-radius: 6px;
          overflow: hidden;
          flex-shrink: 0;
          cursor: pointer;
        }
        .file-thumb img,
        .file-thumb video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .file-info {
          flex: 1;
          min-width: 0;
        }
        .file-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0;
        }
        .file-size {
          font-size: 0.72rem;
          color: var(--sub);
          margin: 0;
        }
        .file-remove {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--sub);
          padding: 2px;
          border-radius: 4px;
          flex-shrink: 0;
          transition: color 0.15s;
        }
        .file-remove:hover {
          color: #d33;
        }
      `}</style>
    </div>
  );
}

export function FilePreviewModal({
  file,
  onClose,
  zIndex,
}: {
  file: File;
  onClose: () => void;
  zIndex?: number;
}) {
  const src = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(src);
  }, [src]);

  return (
    <MediaPreviewModal
      src={src}
      type={file.type.startsWith("video/") ? "video" : "image"}
      alt={file.name}
      onClose={onClose}
      zIndex={zIndex}
    />
  );
}
