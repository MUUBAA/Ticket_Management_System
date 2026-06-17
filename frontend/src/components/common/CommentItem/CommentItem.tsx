import React, {
  useState,
} from 'react';

import {
  format,
} from 'date-fns';

import {
  Comment,
} from '../../../types/comment';

import {
  useAuth,
} from '../../../hooks/useAuth';

import './CommentItem.css';

interface CommentItemProps {

  comment: Comment;

  onDelete?: (
    commentId: number
  ) => void;
}

const CommentItem:
React.FC<CommentItemProps> = ({
  comment,
  onDelete,
}) => {

  const {
    user,
  } = useAuth();

  const [
    previewImage,
    setPreviewImage,
  ] = useState<string | null>(
    null
  );

  const isOwner =
    user?.userId ===
    comment.createdBy;

  const handleDelete = () => {

    if (onDelete) {

      onDelete(
        comment.commentId
      );
    }
  };

  return (

    <div className="comment-item">

      {/* HEADER */}

      <div className="comment-header">

        <div className="comment-author">

          <div className="comment-avatar">

            {
              comment.userName
                ?.charAt(0)
                .toUpperCase() || 'U'
            }

          </div>

          <div className="comment-author-info">

            <span
              className="
                comment-author-name
              "
            >
              {
                comment.userName ||
                'Unknown User'
              }
            </span>

          </div>

        </div>

        <div className="comment-meta">

          <span className="comment-date">

            {
              format(
                new Date(
                  comment.createdAt
                ),
                'MMM dd, yyyy HH:mm'
              )
            }

          </span>

        </div>

      </div>

      {/* CONTENT */}

      <div className="comment-content">

        <p>
          {comment.message}
        </p>

      </div>

      {/* ATTACHMENTS */}

      {
        comment.attachments &&
        comment.attachments.length > 0 && (

          <div
            className="
              mt-4
              grid
              grid-cols-2
              sm:grid-cols-3
              gap-3
            "
          >

            {
              comment.attachments.map(
                (
                  attachment
                ) => {

                  let fileSrc = '';

                  // =====================
                  // BASE64 IMAGE
                  // =====================

                  if (
                    attachment.base64Data
                  ) {

                    fileSrc =
                      `data:${
                        attachment.fileType ||
                        'image/jpeg'
                      };base64,${
                        attachment.base64Data
                      }`;

                  } else {

                    // =====================
                    // URL IMAGE
                    // =====================

                    fileSrc =
                      attachment.url || '';
                  }

                  const isImage =
                    attachment.fileType
                      ?.startsWith(
                        'image'
                      ) ||
                    fileSrc.includes(
                      'data:image'
                    ) ||
                    fileSrc.match(
                      /\.(jpg|jpeg|png|gif|webp)$/i
                    );

                  return (

                    <div
                      key={
                        attachment.attachmentId
                      }
                      className="
                        border
                        rounded-xl
                        overflow-hidden
                        bg-white
                        shadow-sm
                      "
                    >

                      {
                        isImage ? (

                          <img
                            src={fileSrc}
                            alt="attachment"
                            className="
                              w-full
                              h-40
                              object-cover
                              cursor-pointer
                              hover:scale-105
                              transition-transform
                            "
                            onClick={() =>
                              setPreviewImage(
                                fileSrc
                              )
                            }
                          />

                        ) : (

                          <div
                            className="
                              p-4
                              text-sm
                            "
                          >

                            <a
                              href={fileSrc}
                              target="_blank"
                              rel="noreferrer"
                              className="
                                text-indigo-600
                                hover:underline
                              "
                            >
                              {
                                attachment.fileName ||
                                'Download File'
                              }
                            </a>

                          </div>
                        )
                      }

                      <div
                        className="
                          px-2
                          py-1
                          text-xs
                          text-gray-500
                          truncate
                          border-t
                        "
                      >
                        {
                          attachment.fileName ||
                          'Attachment'
                        }
                      </div>

                    </div>
                  );
                }
              )
            }

          </div>
        )
      }

      {/* DELETE BUTTON */}

      {
        onDelete &&
        isOwner && (

          <div className="comment-actions">

            <button
              type="button"
              className="
                comment-action-btn
                danger
              "
              onClick={
                handleDelete
              }
            >
              Delete
            </button>

          </div>
        )
      }

      {/* IMAGE PREVIEW MODAL */}

      {
        previewImage && (

          <div
            className="
              fixed
              inset-0
              z-[9999]
              bg-black/80
              flex
              items-center
              justify-center
              p-4
            "
            onClick={(
              e
            ) => {

              e.stopPropagation();

              setPreviewImage(
                null
              );
            }}
          >

            <div
              className="
                relative
                max-w-5xl
                max-h-[90vh]
              "
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <button
                className="
                  absolute
                  top-2
                  right-2
                  bg-white
                  rounded-full
                  w-10
                  h-10
                  text-black
                  font-bold
                  shadow-lg
                  z-10
                "
                onClick={() =>
                  setPreviewImage(
                    null
                  )
                }
              >
                ✕
              </button>

              <img
                src={previewImage}
                alt="preview"
                className="
                  max-w-full
                  max-h-[90vh]
                  rounded-xl
                  shadow-2xl
                "
              />

            </div>

          </div>
        )
      }

    </div>
  );
};

export default CommentItem;