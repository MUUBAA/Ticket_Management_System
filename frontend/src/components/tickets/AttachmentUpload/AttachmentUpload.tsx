import React, { useState, useCallback } from 'react';

interface Attachment {
  id?: number;
  attachmentId?: number;
  name?: string;
  fileName?: string;
  size?: number;
  type?: string;
  fileType?: string;
  url?: string;
  base64Data?: string;
  uploaded_at?: string;
  createdAt?: string;
}

interface AttachmentUploadProps {
  ticketId: number;
  currentAttachments: Attachment[];
  onUpload: (file: File) => Promise<Attachment>;
  onRemove: (attachmentId: number) => Promise<void>;
  maxFileSize: number;
  allowedTypes: string[];
  maxFiles: number;
}

const AttachmentUpload: React.FC<AttachmentUploadProps> = ({
  // ticketId,
  currentAttachments,
  onUpload,
  onRemove,
  maxFileSize,
  allowedTypes,
  maxFiles,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File size exceeds ${formatFileSize(maxFileSize)}`;
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return 'File type not allowed';
    }

    // Check max files
    if (currentAttachments.length >= maxFiles) {
      return `Maximum ${maxFiles} files allowed`;
    }

    return null;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setError(null);

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      for (const file of files) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
      }

      setIsUploading(true);
      try {
        for (const file of files) {
          await onUpload(file);
        }
        setError(null);
      } catch (err) {
        setError('Failed to upload file(s)');
      } finally {
        setIsUploading(false);
      }
    },
    [currentAttachments.length, maxFiles, onUpload, maxFileSize, allowedTypes]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      setError(null);
      for (const file of files) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
      }

      setIsUploading(true);
      try {
        for (const file of files) {
          await onUpload(file);
        }
        setError(null);
      } catch (err) {
        setError('Failed to upload file(s)');
      } finally {
        setIsUploading(false);
        e.target.value = '';
      }
    },
    [currentAttachments.length, maxFiles, onUpload, maxFileSize, allowedTypes]
  );

  const handleRemove = async (attachmentId: number) => {
    try {
      await onRemove(attachmentId);
      setError(null);
    } catch (err) {
      setError('Failed to remove attachment');
    }
  };

  const getFileIcon = (type: string): string => {
    if (type.startsWith('image/')) {
      return 'image';
    } else if (type === 'application/pdf') {
      return 'pdf';
    } else if (
      type === 'application/msword' ||
      type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return 'word';
    } else if (
      type === 'application/vnd.ms-excel' ||
      type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      return 'excel';
    } else if (type === 'text/plain') {
      return 'text';
    }
    return 'file';
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 transition-colors duration-200 ${isDragging
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-gray-300 hover:border-indigo-400 bg-gray-50'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center text-center">
          <svg
            className={`w-12 h-12 mb-3 ${isDragging ? 'text-indigo-600' : 'text-gray-400'
              }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm font-medium text-gray-900 mb-1">
            {isDragging ? 'Drop files here' : 'Drag and drop files here'}
          </p>
          <p className="text-xs text-gray-500 mb-3">
            or click to browse from your computer
          </p>
          <label className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer transition-colors duration-200">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            {isUploading ? 'Uploading...' : 'Select Files'}
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
            accept={allowedTypes.join(',')}
          />
          <p className="text-xs text-gray-500 mt-3">
            Max size: {formatFileSize(maxFileSize)} • Max files:{' '}
            {maxFiles - currentAttachments.length} remaining
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
          <svg
            className="w-5 h-5 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Attachments List */}
      {currentAttachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900">
            Attached Files ({currentAttachments.length})
          </h4>
          <div className="space-y-2">
            {currentAttachments.map((attachment) => {
              // Handle both API property names and legacy names
              const id =
                attachment.id ??
                attachment.attachmentId ??
                0;
              const name = attachment.name || attachment.fileName || 'Attachment';
              const type =
                attachment.type ||
                attachment.fileType ||
                '';
              const size = attachment.size;
              const uploadedAt = attachment.uploaded_at || attachment.createdAt;

              return (
                <div
                  key={id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      {getFileIcon(type) === 'image' ? (
                        <svg
                          className="w-5 h-5 text-indigo-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      ) : getFileIcon(type) === 'pdf' ? (
                        <svg
                          className="w-5 h-5 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                      ) : getFileIcon(type) === 'word' ? (
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      ) : getFileIcon(type) === 'excel' ? (
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      ) : getFileIcon(type) === 'text' ? (
                        <svg
                          className="w-5 h-5 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {size ? formatFileSize(size) : 'N/A'} •{' '}
                        {uploadedAt ? new Date(uploadedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(attachment.url || attachment.base64Data) && (
                      <a
                        href={attachment.url || (attachment.base64Data ? `data:${attachment.fileType || 'application/octet-stream'};base64,${attachment.base64Data}` : '#')}
                        download
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                        title="Download"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      </a>
                    )}
                    <button
                      onClick={() => handleRemove(id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Remove"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentUpload;
