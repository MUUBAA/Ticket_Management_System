import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "../../../hooks/useRedux";

import { useTicket } from "../../../hooks/useTicket";

import { useUser } from "../../../hooks/useAuth";

import {
  CreateCommentRequest,
} from "../../../types/comment";

import { Attachment, TicketStatus, UpdateTicketInput } from "../../../types/ticket";

import {
  fetchComments,
  createComment,
  deleteComment,
} from "../../../store/slices/commentSlice";

import { fetchUsers } from "../../../store/slices/userSlice";

import CommentInput from "../CommentInput/CommentInput";

import CommentItem from "../CommentItem/CommentItem";

import StatusBadge from "../StatusBadge/StatusBadge";

// ==========================
// PROJECT OPTIONS
// ==========================

const projectOptions = [
  "Rethink POS",
  "Intellectual POS",
  "SAP",
  "Sellerkit",
  "WMS",
  "Software Development",
  "Application  Development",
  "Eway Addon",
  "Retail Addon",
  "Item Upload Addon",
  "Bulk Upload Addon",
  "Btrans",
  "CRM eServe",
  "Store Management System",
  "Waresmart",
  "Verifyt",
  "Delivryt",
  "Bajaj Integration",
  "Sony EDI Integration",
  "LG EDI Integration",
  "HDB Integration",
  "IDFC Integration",
  "whatsapp integration",
  "Others",
];

interface TicketDetailModalProps {
  ticketId: number;
  onClose: () => void;
}

const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticketId,
  onClose,
}) => {
  const dispatch = useAppDispatch();

  const currentUser = useUser();

  const isSuperAdmin = currentUser?.role === "SuperAdmin";

  const {
    // tickets,
    loading,
    fetchTicketById,
    updateTicket,
    currentTicket: selectedTicket,
  } = useTicket();
  // ==========================
  // COMMENTS
  // ==========================

  const { comments, loading: commentLoading } = useAppSelector(
    (state) => state.comments,
  );

  // ==========================
  // USERS
  // ==========================

  const { users } = useAppSelector((state) => state.users);

  // ==========================
  // STATES
  // ==========================

  const [isEditing, setIsEditing] = useState(false);

  const [editData, setEditData] = useState<UpdateTicketInput>({
    title: "",
    description: "",
    status: "Open",
    assignedTo: undefined,
    projectName: "",
    ticketType: "",
    soNumber: "",
  });
  const [currentTicket, setCurrentTicket] = useState<any>(null);



  const [previewImage, setPreviewImage] =
    useState<string | null>(null);

  // ==========================
  // FETCH TICKET
  // ==========================

  useEffect(() => {
    fetchTicketById(ticketId);
  }, [ticketId]);

  // ==========================
  // FETCH COMMENTS
  // ==========================

  useEffect(() => {
    dispatch(fetchComments(ticketId));
  }, [dispatch, ticketId]);

  // ==========================
  // FETCH USERS
  // ==========================

  useEffect(() => {
    dispatch(
      fetchUsers({
        page: 1,
        pageSize: 100,
      }),
    );
  }, [dispatch]);

  // ==========================
  // SET CURRENT TICKET
  // ==========================

  useEffect(() => {

    if (!selectedTicket) {
      return;
    }

    setCurrentTicket(selectedTicket);

    setEditData({

      title: selectedTicket.title,

      description: selectedTicket.description,

      status: selectedTicket.status as TicketStatus,

      assignedTo: selectedTicket.assignedTo,

      projectName: selectedTicket.projectName,

      ticketType: selectedTicket.ticketType || "",

      soNumber: selectedTicket.soNumber || "",
    });

  }, [selectedTicket]);

  // ==========================
  // SAVE
  // ==========================

  const handleSave = async () => {
    if (!currentTicket) return;

    try {
      await updateTicket(currentTicket.ticketId, editData);

      // CLOSE MODAL
      onClose();

      // OPTIONAL:
      // REFRESH TICKETS
      // if needed
    } catch (err) {
      console.error("Failed to update ticket", err);
    }
  };

  // ==========================
  // CANCEL
  // ==========================

  const handleCancel = () => {
    if (!currentTicket) return;

    setEditData({
      title: currentTicket.title,

      description: currentTicket.description,

      status: currentTicket.status as TicketStatus,

      assignedTo: currentTicket.assignedTo,

      projectName: currentTicket.projectName,

      ticketType: currentTicket.ticketType || "",

      soNumber: currentTicket.soNumber || "",
    });
    setIsEditing(false);
  };

  // ==========================
  // ADD COMMENT
  // ==========================

  const handleAddComment = async (
    content: string,
    files?: File[],
    audioFile?: File | null
  ) => {

    try {

      const payload:
        CreateCommentRequest = {

        ticketId,

        message: content,

        userName:
          currentUser?.name ||
          "Anonymous User",
      };

      // =========================
      // CREATE COMMENT
      // =========================

      const result =
        await dispatch(

          createComment({

            ticketId,

            data: payload,

            files,

            audioFile,
          }),
        );

      // =========================
      // REFRESH COMMENTS
      // =========================

      if (
        createComment.fulfilled.match(
          result
        )
      ) {

        await dispatch(
          fetchComments(ticketId)
        );
      }

    } catch (err) {

      console.error(
        "Failed to add comment",
        err
      );
    }
  };



  // ==========================
  // DELETE COMMENT
  // ==========================

  const handleDeleteComment = async (commentId: number) => {
    try {
      await dispatch(
        deleteComment({
          ticketId,
          commentId,
        }),
      );
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  // ==========================
  // ASSIGNEE NAME
  // ==========================

  const getAssigneeName = () => {
    if (!currentTicket?.assignedTo) {
      return "Unassigned";
    }

    const assignedUser = users.find(
      (u) => u.userId === currentTicket.assignedTo,
    );

    return assignedUser?.name || "Unknown User";
  };

  // ==========================
  // LOADING
  // ==========================

  if (loading && !currentTicket) {
    return (
      <div
        className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          bg-black/50
        "
      >
        <div
          className="
            bg-white
            p-6
            rounded-xl
          "
        >
          Loading...
        </div>
      </div>
    );
  }

  // ==========================
  // NOT FOUND
  // ==========================

  if (!currentTicket) {
    return (
      <div
        className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          bg-black/50
        "
      >
        <div
          className="
            bg-white
            p-6
            rounded-xl
          "
        >
          Ticket not found
        </div>
      </div>
    );
  }

  // ==========================
  // MAIN
  // ==========================

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        bg-black/50
        flex
        items-center
        justify-center
        p-2
        sm:p-4
      "
      onClick={onClose}
    >
      <div                                                                                                                                     
        className="
          bg-white
          rounded-none
          sm:rounded-2xl
          shadow-2xl
          w-full
          max-w-full
          sm:max-w-4xl
          h-full
          max-h-[95vh]
          sm:h-[90vh]
          flex
          flex-col
          overflow-hidden
          min-h-0
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            px-4
            py-4
          "
        >
          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
            "
          >
            <h2
              className="
                text-lg
                font-bold
              "
            >
              #{currentTicket.ticketId}
            </h2>

            <StatusBadge status={currentTicket.status} />
          </div>

          <button
            onClick={onClose}
            className="
              text-2xl
              text-gray-500
            "
          >
            ×
          </button>
        </div>

        {/* BODY */}

        <div
          className="
            flex-1
            min-h-0
            overflow-y-auto
            p-4
            sm:p-6
          "
        >
          {/* DETAILS */}

          {/* TITLE */}

          <div>
            <label
              className="
                text-sm
                font-medium
                text-gray-700
                mb-2
                block
              "
            >
              Title
            </label>

            {isEditing ? (
              <input
                type="text"
                value={editData.title || ""}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="
                    w-full
                    border
                    rounded-lg
                    px-3
                    py-2
                  "
              />
            ) : (
              <div
                className="
                    text-lg
                    font-semibold
                  "
              >
                {currentTicket.title}
              </div>
            )}
          </div>

          {/* DESCRIPTION */}

          <div className="mt-6">
            <label
              className="
                text-sm
                font-medium
                text-gray-700
                mb-2
                block
              "
            >
              Description
            </label>

            {isEditing ? (
              <textarea
                rows={4}
                value={editData.description || ""}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="
                    w-full
                    border
                    rounded-lg
                    px-3
                    py-2
                  "
              />
            ) : (
              <div>{currentTicket.description}</div>
            )}
          </div>

          {/* OTHER FIELDS */}

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-6
              mt-6
            "
          >
            {/* STATUS */}

            <div>
              <label
                className="
                  text-sm
                  font-medium
                  text-gray-700
                  mb-2
                  block
                "
              >
                Status
              </label>

              {isEditing ? (
                <select
                  value={editData.status}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      status: e.target.value as TicketStatus,
                    }))
                  }
                  className="
                      w-full
                      border
                      rounded-lg
                      px-3
                      py-2
                    "
                >
                  <option value="Open">Open</option>

                  <option value="InProgress">In Progress</option>

                  <option value="OnHold">On Hold</option>

                  <option value="Closed">Closed</option>
                </select>
              ) : (
                <StatusBadge status={currentTicket.status} />
              )}
            </div>

            {/* PROJECT */}

            <div>
              <label
                className="
                  text-sm
                  font-medium
                  text-gray-700
                  mb-2
                  block
                "
              >
                Project
              </label>

              {isEditing ? (
                <select
                  value={editData.projectName || ""}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      projectName: e.target.value,
                    }))
                  }
                  className="
                      w-full
                      border
                      rounded-lg
                      px-3
                      py-2
                    "
                >
                  {projectOptions.map((project) => (
                    <option key={project} value={project}>
                      {project}
                    </option>
                  ))}
                </select>
              ) : (
                <div
                  className="
                      text-sm
                      font-medium
                    "
                >
                  {currentTicket.projectName || "N/A"}
                </div>
              )}
            </div>

            {/* TICKET TYPE */}

            <div>
              <label
                className="
      text-sm
      font-medium
      text-gray-700
      mb-2
      block
    "
              >
                Ticket Type
              </label>

              {isEditing ? (

                <select
                  value={editData.ticketType || ""}
                  onChange={(e) =>
                    setEditData((prev) => ({

                      ...prev,

                      ticketType: e.target.value,

                      // Clear SO Number when not Requirement
                      soNumber:
                        e.target.value === "Requirement"
                          ? prev.soNumber
                          : "",
                    }))
                  }
                  className="
        w-full
        border
        rounded-lg
        px-3
        py-2
      "
                >
                  <option value="Support">Support</option>

                  <option value="Requirement">Requirement</option>

                  <option value="Bug">RepeatTicket</option>
                </select>

              ) : (

                <div
                  className="
                     text-sm
                     font-medium
                    "
                >
                  {currentTicket.ticketType}
                </div>

              )}
            </div>

            {
              isSuperAdmin &&
              (
                isEditing
                  ? editData.ticketType === "Requirement"
                  : currentTicket.ticketType === "Requirement"
              ) && (

                <div>

                  <label
                    className="
          text-sm
          font-medium
          text-gray-700
          mb-2
          block
        "
                  >
                    SO Number
                  </label>

                  {isEditing ? (

                    <input
                      type="text"

                      value={
                        editData.soNumber || ""
                      }

                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          soNumber: e.target.value,
                        }))
                      }

                      placeholder="Enter SO Number"

                      className="
            w-full
            border
            rounded-lg
            px-3
            py-2
          "
                    />

                  ) : (

                    <div
                      className="
            text-sm
            font-medium
          "
                    >
                      {
                        currentTicket.soNumber ||
                        "N/A"
                      }
                    </div>

                  )}

                </div>
              )
            }

            {/* ASSIGNEE */}

            <div>
              <label
                className="
      text-sm
      font-medium
      text-gray-700
      mb-2
      block
    "
              >
                Assignee
              </label>

              {isEditing && isSuperAdmin ? (
                <select
                  value={editData.assignedTo || ""}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,

                      assignedTo: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  className="
          w-full
          border
          rounded-lg
          px-3
          py-2
        "
                >
                  <option value="">Unassigned</option>

                  {(Array.isArray(users) ? users : []).map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div>{getAssigneeName()}</div>
              )}
            </div>
            {/* CREATED */}

            <div>
              <label
                className="
                  text-sm
                  font-medium
                  text-gray-700
                  mb-2
                  block
                "
              >
                Created
              </label>

              <div>{new Date(currentTicket.createdAt).toLocaleString()}</div>
            </div>
          </div>

          {/* ATTACHMENTS */}

          <div
            className="
    mt-8
    border-t
    pt-6
  "
          >

            <h3
              className="
      text-lg
      font-semibold
      mb-4
    "
            >
              Attachments
            </h3>

            {
              !currentTicket.attachments ||
                currentTicket.attachments.length === 0
                ? (

                  <div
                    className="
            text-sm
            text-gray-500
          "
                  >
                    No attachments available
                  </div>

                ) : (

                  <div
                    className="
            grid
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            gap-4
          "
                  >

                    {
                      currentTicket.attachments.map(
                        (attachment: Attachment) => {
                          // Determine image source - prefer base64 over URL
                          let imageSrc = '';
                          let fileName = 'attachment';

                          if (attachment.base64Data) {
                            // Convert base64 to data URL
                            imageSrc = `data:${attachment.fileType || 'image/jpeg'};base64,${attachment.base64Data}`;
                            fileName = attachment.fileName || 'attachment';
                          } else if (attachment.url && typeof attachment.url === 'string') {
                            imageSrc = attachment.url;
                            fileName = attachment.url.split("/").pop() || 'attachment';
                          }

                          return (
                            <div
                              key={
                                attachment.attachmentId
                              }
                              className="
                    border
                    rounded-xl
                    overflow-hidden
                    hover:shadow-md
                    transition-all
                    bg-white
                    block
                  "
                            ><img
                                src={imageSrc}
                                alt="attachment"
                                crossOrigin="anonymous"
                                loading="lazy"
                                decoding="async"
                                onClick={() =>
                                  setPreviewImage(imageSrc)
                                }
                                className="
    w-full
    h-32
    object-cover
    bg-gray-100
    cursor-pointer
    hover:scale-105
    transition-transform
  "
                                onError={(e) => {
                                  const img =
                                    e.target as HTMLImageElement;

                                  img.style.display = 'none';

                                  const parent =
                                    img.parentElement;

                                  if (parent) {

                                    const errorDiv =
                                      document.createElement(
                                        'div'
                                      );

                                    errorDiv.className =
                                      `
        w-full
        h-32
        bg-gray-100
        flex
        items-center
        justify-center
        text-gray-400
        text-xs
        text-center
        p-2
      `;

                                    errorDiv.textContent =
                                      'Failed to load image';

                                    parent.insertBefore(
                                      errorDiv,
                                      img.nextSibling
                                    );
                                  }
                                }}
                              />

                              <div
                                className="
                      p-2
                      text-xs
                      text-gray-600
                      truncate
                    "
                              >
                                {fileName}
                              </div>

                            </div>
                          );
                        }
                      )
                    }

                  </div>
                )
            }

          </div>

          {/* BUTTONS */}

          <div
            className="
              flex
              flex-col
              sm:flex-row
              flex-wrap
              gap-3
              mt-6
              mb-8
            "
          >
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="
                      bg-indigo-600
                      text-white
                      px-4
                      py-2
                      rounded-lg
                    "
                >
                  Edit Ticket
                </button>

                <button
                  onClick={onClose}
                  className="
                      bg-gray-200
                      px-4
                      py-2
                      rounded-lg
                    "
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="
                      bg-green-600
                      text-white
                      px-4
                      py-2
                      rounded-lg
                    "
                >
                  Save Changes
                </button>

                <button
                  onClick={handleCancel}
                  className="
                      bg-gray-200
                      px-4
                      py-2
                      rounded-lg
                    "
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          {/* COMMENTS */}

          <div
            className="
              border-t
              pt-5
            "
          >
            <h3
              className="
                text-lg
                font-semibold
                mb-4
              "
            >
              Comments ({Array.isArray(comments) ? comments.length : 0})
            </h3>

            {/* INPUT */}

            <div className="mb-6">
              <CommentInput
                onSubmit={handleAddComment}
                loading={commentLoading}
                placeholder="Add a comment..."
              />
            </div>

            {/* COMMENTS LIST */}

            <div
              className="
                space-y-4
              "
            >
              {!Array.isArray(comments) || comments.length === 0 ? (
                <div
                  className="
                      text-center
                      text-gray-500
                      py-8
                    "
                >
                  No comments yet
                </div>
              ) : (
                comments.map((comment) => (
                  <CommentItem
                    key={comment.commentId}
                    comment={comment}
                    onDelete={handleDeleteComment}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {
        previewImage && (
          <div
            className="
    fixed
    inset-0
    z-[999]
    bg-black/90
    flex
    items-center
    justify-center
    p-4
  "
            onClick={(e) => {

              e.stopPropagation();

              setPreviewImage(null);
            }}
          >

            <button
              onClick={(e) => {

                e.stopPropagation();

                setPreviewImage(null);
              }}
              className="
          absolute
          top-4
          right-4
          text-white
          text-4xl
          z-50
        "
            >
              ×
            </button>

            <img
              src={previewImage}
              alt="preview"

              onClick={(e) =>
                e.stopPropagation()
              }
              className="
          max-w-full
          max-h-full
          object-contain
          rounded-xl
          shadow-2xl
        "
            />

          </div>
        )
      }
    </div>
  );
};

export default TicketDetailModal;
