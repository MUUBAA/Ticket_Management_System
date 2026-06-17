import { useParams, useNavigate } from 'react-router-dom';
import TicketDetailModal from '../../components/common/TicketDetailModal/TicketDetailModal';

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const ticketId = parseInt(id || '0', 10);

  if (isNaN(ticketId)) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Ticket Not Found</h1>
        <button
          onClick={() => navigate('/tickets')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Tickets
        </button>
      </div>
    );
  }

  return (
    <TicketDetailModal
      ticketId={ticketId}
      onClose={() => navigate('/tickets')}
    />
  );
};

export default TicketDetail;
