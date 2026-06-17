import React, { useState, useRef, useEffect } from 'react';

interface Comment {
  id: number;
  user_name: string;
  user_avatar?: string;
  message: string;
  created_at: string;
  is_system?: boolean;
}

interface ChatInterfaceProps {
  ticketId: number;
  currentUser: {
    id: number;
    name: string;
    avatar?: string;
    role: string;
  };
  comments: Comment[];
  onAddComment: (message: string) => Promise<void>;
  isLoading?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  ticketId,
  currentUser,
  comments,
  onAddComment,
  isLoading,
}) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    
    await onAddComment(message);
    setMessage('');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const isCurrentUser = (userId: number) => {
    return userId === currentUser.id;
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">
          Ticket Discussion
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Ticket #{ticketId} - {comments.length} messages
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg
              className="w-16 h-16 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-gray-500 font-medium">No messages yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Start the conversation by adding a comment
            </p>
          </div>
        ) : (
          comments.map((comment, index) => {
            const showDate =
              index === 0 ||
              new Date(comment.created_at).toDateString() !==
                new Date(comments[index - 1].created_at).toDateString();

            return (
              <React.Fragment key={comment.id}>
                {showDate && (
                  <div className="flex items-center justify-center my-4">
                    <div className="flex-1 border-t border-gray-200"></div>
                    <span className="px-3 text-xs font-medium text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                    <div className="flex-1 border-t border-gray-200"></div>
                  </div>
                )}

                <div
                  className={`flex ${
                    isCurrentUser(comment.id) ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] ${
                      isCurrentUser(comment.id) ? 'order-2' : 'order-1'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="flex items-center gap-2 mb-2">
                      {!comment.is_system && (
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                            isCurrentUser(comment.id)
                              ? 'bg-indigo-600'
                              : 'bg-gray-600'
                          }`}
                        >
                          {comment.user_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {comment.is_system
                            ? 'System'
                            : comment.user_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTime(comment.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        comment.is_system
                          ? 'bg-amber-50 border border-amber-200'
                          : isCurrentUser(comment.id)
                          ? 'bg-indigo-600 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-900 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">
                        {comment.message}
                      </p>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
          />
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
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
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                Send
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
