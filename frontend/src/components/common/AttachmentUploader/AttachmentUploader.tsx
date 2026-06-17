import React, { useState, useCallback, useRef } from 'react';
import { Attachment } from '../../../types/attachment';

interface AttachmentUploaderProps {
  onFilesAdded: (files: File[]) => void;
  maxFileSize?: number;
  acceptedTypes?: string[];
  existingAttachments?: Attachment[];
  onRemoveAttachment?: (attachmentId: number) => void;
  onRemoveUploadedFile?: (index: number) => void;
  accept?: string;
  isAudio?: boolean;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  onFilesAdded,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  existingAttachments = [],
  onRemoveAttachment,
  onRemoveUploadedFile,
  accept,
  isAudio = false,
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((files: File[]) => {
    const newFiles = files.filter(file => file.size <= maxFileSize);
    if (newFiles.length !== files.length) {
      alert(`Some files exceeded the ${maxFileSize / 1024 / 1024}MB limit and were not uploaded.`);
    }
    setUploadingFiles(prev => [...prev, ...newFiles]);
    onFilesAdded(newFiles);
  }, [maxFileSize, onFilesAdded]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onDrop(Array.from(e.target.files));
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onDrop(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeUploadingFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
    if (onRemoveUploadedFile) {
      onRemoveUploadedFile(index);
    }
  };

  const isDragActive = uploadingFiles.length > 0;

  return (
    <div className="attachment-uploader">
      <div
        className={`dropzone ${isDragActive ? 'drag-active' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={!isAudio}
          accept={accept || acceptedTypes.join(',')}
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <div className="dropzone-content">
          <svg
            className="dropzone-icon"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="dropzone-text">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here, or click to select'}
          </p>
          <p className="dropzone-hint">
            Maximum file size: {maxFileSize / 1024 / 1024}MB
          </p>
        </div>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="uploading-files">
          <h4 className="uploading-title">Uploading files...</h4>
          {uploadingFiles.map((file, index) => (
            <div key={index} className="uploading-file-item">
              <span className="uploading-file-icon">📎</span>
              <div className="uploading-file-info">
                <span className="uploading-file-name">{file.name}</span>
                <span className="uploading-file-size">{formatFileSize(file.size)}</span>
              </div>
              <button
                type="button"
                className="remove-file-btn"
                onClick={() => removeUploadingFile(index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {existingAttachments.length > 0 && (
        <div className="existing-attachments">
          <h4 className="existing-title">Attached Files</h4>
          <div className="attachments-list">
            {existingAttachments.map((attachment) => (
              <div key={attachment.attachmentId} className="attachment-item">
                <span className="attachment-icon">📎</span>
                <div className="attachment-info">
                  <span className="attachment-name">{attachment.url ? attachment.url.split('/').pop() || 'File' : attachment.fileName || 'File'}</span>
                  <span className="attachment-size">File</span>
                </div>
                {onRemoveAttachment && (
                  <button
                    type="button"
                    className="remove-attachment-btn"
                    onClick={() => onRemoveAttachment(attachment.attachmentId)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentUploader;
