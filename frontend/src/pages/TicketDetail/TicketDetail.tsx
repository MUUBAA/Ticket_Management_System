import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTicket } from '../../hooks/useTicket';
import { format } from 'date-fns';
import Button from '../../components/Button';
import { TicketStatus, UpdateTicketInput } from '../../types/ticket';
import { Comment, CreateCommentRequest } from '../../types/comment';
import { commentService } from '../../services/commentService';
import CommentInput from '../../components/common/CommentInput/CommentInput';
import CommentItem from '../../components/common/CommentItem/CommentItem';
import { useUser } from '../../hooks/useAuth';
import './TicketDetail.css';

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tickets, loading, updateTicket } = useTicket();
  const currentUser = useUser();
  const [ticket, setTicket] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  const loadComments = useCallback(async () => {
    try {
      const data = await commentService.getComments(parseInt(id!));
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      const foundTicket = tickets.find((t) => t.ticketId === parseInt(id));
      if (foundTicket) {
        setTicket(foundTicket);
      } else {
        navigate('/tickets');
      }
    }
  }, [id, tickets, navigate]);

  useEffect(() => {
    if (id) {
      loadComments();
    }
  }, [id, loadComments]);

  const handleAddComment = async (message: string) => {
    try {
      const newComment = await commentService.createComment(parseInt(id!), {
        ticketId: parseInt(id!),
        message,
        userName: currentUser?.name || 'Anonymous',
      } as CreateCommentRequest);
      setComments((prev) => [...prev, newComment]);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await commentService.deleteComment(parseInt(id!), commentId);
      setComments((prev) => prev.filter((c) => c.commentId !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  // const startEditComment = (commentId: number, currentMessage: string) => {
  //   setEditingCommentId(commentId);
  // };

  

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (ticket) {
      const updateData: UpdateTicketInput = { status: newStatus };
      await updateTicket(ticket.ticketId, updateData);
      setTicket({ ...ticket, status: newStatus });
    }
  };

  if (loading || !ticket) {
    return (
      <div className="ticket-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading ticket details...</p>
      </div>
    );
  }

  const statusColors: Record<TicketStatus, string> = {
    Open: 'bg-blue-100 text-blue-800',
    InProgress: 'bg-yellow-100 text-yellow-800',
    OnHold: 'bg-yellow-100 text-yellow-800',
    Closed: 'bg-gray-100 text-gray-800',
  };

  const priorityColors: Record<string, string> = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-orange-100 text-orange-800',
    Critical: 'bg-red-100 text-red-800',
  };

  const statusOptions: TicketStatus[] = ['Open', 'InProgress', 'OnHold', 'Closed'];

  return (
    <div className="ticket-detail">
      <div className="ticket-detail-header">
        <Button variant="secondary" onClick={() => navigate('/tickets')}>
          ← Back to Tickets
        </Button>
        <div className="ticket-detail-actions">
          <select
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
            className="status-select"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="ticket-detail-content">
        <div className="ticket-detail-main">
          <div className="ticket-detail-card">
            <div className="ticket-detail-title">
              <h1>{ticket.title}</h1>
              <div className="ticket-detail-meta">
                <span className={`priority-badge ${priorityColors[ticket.priority] || 'bg-gray-100'}`}>
                  {ticket.priority}
                </span>
                <span className={`status-badge ${statusColors[ticket.status as TicketStatus]}`}>
                  {ticket.status}
                </span>
              </div>
            </div>

            <div className="ticket-detail-info">
              <div className="info-row">
                <span className="info-label">Ticket ID:</span>
                <span className="info-value">#{ticket.ticketId}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Created:</span>
                <span className="info-value">
                  {format(new Date(ticket.createdAt), 'MMM dd, yyyy HH:mm')}
                </span>
              </div>
              {ticket.updatedAt && (
                <div className="info-row">
                  <span className="info-label">Last Updated:</span>
                  <span className="info-value">
                    {format(new Date(ticket.updatedAt), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              )}
              {ticket.assignedTo && (
                <div className="info-row">
                  <span className="info-label">Assigned To:</span>
                  <span className="info-value">{ticket.assignedToName}</span>
                </div>
              )}
            </div>

            <div className="ticket-detail-description">
              <h2>Description</h2>
              <p>{ticket.description}</p>
            </div>
          </div>

          <div className="ticket-detail-comments">
            <h2>Comments ({comments.length})</h2>
            <div className="comments-list">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.commentId}
                  comment={comment}
                  onDelete={handleDeleteComment} 
                />
              ))}
            </div>
            <CommentInput onSubmit={handleAddComment} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
