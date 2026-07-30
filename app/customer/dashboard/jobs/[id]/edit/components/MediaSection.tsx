import {
  ExistingMediaGrid,
  FileList,
  FileUploadDropzone,
} from "@/components/ui/media-components";
import { toast } from "sonner";
import type { ExistingMedia, PreviewRef } from "../types";

interface Props {
  existingMedia: ExistingMedia[];
  newFiles: File[];
  deletingMedia: boolean;
  deleteMediaId: string | null;
  onPreview: (ref: PreviewRef) => void;
  onRemoveExisting: (id: string) => void;
  onRemoveNew: (index: number) => void;
  onAddFiles: (files: File[]) => void;
}

export function MediaSection({
  existingMedia,
  newFiles,
  deletingMedia,
  deleteMediaId,
  onPreview,
  onRemoveExisting,
  onRemoveNew,
  onAddFiles,
}: Props) {
  return (
    <>
      {existingMedia.length > 0 && (
        <div className="form-field">
          <label>Current Photos</label>
          <ExistingMediaGrid
            items={existingMedia}
            onPreview={(index) => onPreview({ kind: "existing", index })}
            onRemove={(id) => onRemoveExisting(id)}
            removingId={deletingMedia ? deleteMediaId : null}
          />
        </div>
      )}

      <div className="form-field">
        <label>Add More Photos</label>
        <FileUploadDropzone
          inputId="edit-job-media"
          onFilesAdded={onAddFiles}
          onInvalidFile={(message) => toast.error(message)}
          prompt="Drag photos or click to upload"
          hint="JPEG, PNG, WebP, GIF · Max 10 MB each"
        />
      </div>

      {newFiles.length > 0 && (
        <FileList
          files={newFiles}
          onPreview={(index) => onPreview({ kind: "new", index })}
          onRemove={onRemoveNew}
        />
      )}
    </>
  );
}
