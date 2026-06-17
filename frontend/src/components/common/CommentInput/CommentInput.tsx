import React, { useState, useRef } from 'react';
import './CommentInput.css';

interface CommentInputProps {
  onSubmit: (content: string, files: File[], audioFile: File | null) => void;
  onCancel?: () => void;
  loading?: boolean;
  placeholder?: string;
}

interface UploadedFile {
  file: File;
  preview: string;
}

const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  placeholder = 'Write a comment...',
}) => {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: UploadedFile[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeAudio = () => {
    setAudioFile(null);
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() || uploadedFiles.length > 0 || audioFile) {
      const allFiles = uploadedFiles.map((f) => f.file);
      onSubmit(content.trim(), allFiles, audioFile);
      setContent('');
      setUploadedFiles([]);
      setAudioFile(null);
      setIsExpanded(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (audioInputRef.current) {
        audioInputRef.current.value = '';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSubmit(e);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext || '')) return '📄';
    if (['doc', 'docx'].includes(ext || '')) return '📝';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return '🖼️';
    if (['zip', 'rar', '7z'].includes(ext || '')) return '📦';
    return '📎';
  };

  return (
    <div className="comment-input">
      {isExpanded ? (
        <form onSubmit={handleSubmit} className="comment-form-expanded">
          <div className="comment-textarea-wrapper">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="comment-textarea"
              rows={4}
              autoFocus
            />
          </div>

          {/* File Attachments */}
          {uploadedFiles.length > 0 && (
            <div className="file-attachments">
              <label className="file-attachment-label">
                <svg className="attachment-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
                Attached Files
              </label>
              <div className="file-list">
                {uploadedFiles.map((item, index) => (
                  <div key={index} className="file-item">
                    <span className="file-icon">{getFileIcon(item.file.name)}</span>
                    <div className="file-info">
                      <span className="file-name">{item.file.name}</span>
                      <span className="file-size">{formatFileSize(item.file.size)}</span>
                    </div>
                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={() => removeFile(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audio Attachment */}
          {audioFile && (
            <div className="audio-attachment">
              <label className="audio-attachment-label">
                <svg className="attachment-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
                Voice Recording
              </label>
              <div className="audio-item">
                <svg className="audio-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
                <span className="audio-name">{audioFile.name}</span>
                <button
                  type="button"
                  className="remove-audio-btn"
                  onClick={removeAudio}
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div className="comment-form-actions">
            <div className="attachment-options">
              <div className="attachment-option">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.rar"
                  className="file-input-hidden"
                />
                <button
                  type="button"
                  className="attachment-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Attach Files (Multiple)
                </button>
                <span className="attachment-hint">No file chosen</span>
                <span className="attachment-types">(JPG, PDFs, docs)</span>
              </div>

              <div className="attachment-option">
                <input
                  type="file"
                  ref={audioInputRef}
                  onChange={handleAudioChange}
                  accept="audio/*"
                  className="file-input-hidden"
                />
                <button
                  type="button"
                  className="attachment-btn"
                  onClick={() => audioInputRef.current?.click()}
                >
                  Attach Voice Recording
                </button>
                <span className="attachment-hint">No file chosen</span>
                <span className="attachment-types">(MP3, WAV, etc.)</span>
              </div>
            </div>

            <div className="comment-hint">
              Press Ctrl/Cmd + Enter to submit
            </div>

            <div className="comment-buttons">
              {onCancel && (
                <button
                  type="button"
                  className="comment-btn-secondary"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="comment-btn-primary"
                disabled={loading || (!content.trim() && uploadedFiles.length === 0 && !audioFile)}
              >
                {loading ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <button
          type="button"
          className="comment-input-trigger"
          onClick={() => setIsExpanded(true)}
        >
          <svg
            className="comment-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Add a comment
        </button>
      )}
    </div>
  );
};

export default CommentInput;
