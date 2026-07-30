import {
  FileList,
  FilePreviewModal,
  FileUploadDropzone,
} from "@/components/ui/media-components";
import { toast } from "sonner";

interface Props {
  files: File[];
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onPreview: (index: number | null) => void;
  previewIndex: number | null;
}

export function FileUploadSection({
  files,
  onAddFiles,
  onRemoveFile,
  onPreview,
  previewIndex,
}: Props) {
  return (
    <>
      <FileUploadDropzone
        inputId="post-job-media"
        onFilesAdded={onAddFiles}
        onInvalidFile={(message) => toast.error(message)}
        prompt="Drag photos or click to upload"
        hint="JPEG, PNG, WebP, GIF · Max 10 MB each"
      />

      {files.length > 0 && (
        <FileList files={files} onPreview={onPreview} onRemove={onRemoveFile} />
      )}

      {previewIndex !== null && files[previewIndex] && (
        <FilePreviewModal
          file={files[previewIndex]}
          onClose={() => onPreview(null)}
        />
      )}
    </>
  );
}
