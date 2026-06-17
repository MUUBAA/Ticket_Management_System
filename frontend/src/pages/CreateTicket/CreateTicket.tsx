import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTicket } from '../../hooks/useTicket';
import { CreateTicketInput, UpdateTicketInput } from '../../types/ticket';
import TicketForm from '../../components/TicketForm';
import attachmentService
  from "../../services/attachmentService";
import './CreateTicket.css';


interface FormErrors {
  submit?: string;
}

const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const { createTicket, loading } = useTicket();
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploading, setUploading] = useState(false);


  const handleSubmit = async (
    formData: CreateTicketInput | UpdateTicketInput,
    files: File[],
    audioFile: File | null
  ) => {
    try {
      setUploading(true);
      setErrors({});

      // Ensure formData has required fields for CreateTicketInput
      const createData: CreateTicketInput = {
        title: formData.title || '',
        description: formData.description || '',
        priority: formData.priority || 'Medium',
        ticketType: formData.ticketType || 'Task',
        due_date: formData.due_date,
        companyName:
          (
            formData as CreateTicketInput
          ).companyName || '',

        projectName:
          (
            formData as CreateTicketInput
          ).projectName || '',
      };

      // Create the ticket first
      const ticket = await createTicket(createData);
      const ticketId = ticket.ticketId;

      // Upload attachments if any
      if (files.length > 0) {
        for (const file of files) {
          try {
            await attachmentService.uploadAttachment(ticketId, file);
          } catch (error) {
            console.error(`Failed to upload file ${file.name}:`, error);
          }
        }
      }

      // Upload audio file if any
      if (audioFile) {
        try {
          await attachmentService.uploadAttachment(ticketId, audioFile);
        } catch (error) {
          console.error(`Failed to upload audio file ${audioFile.name}:`, error);
        }
      }

      navigate('/');
    } catch (error) {
      console.error('Failed to create ticket:', error);
      setErrors({ submit: 'Failed to create ticket. Please try again.' });
    } finally {
      setUploading(false);
    }
  };


  const handleCancel = () => {
    navigate('/tickets');
  };

  return (
    <div className="create-ticket">
      <h1>Create New Ticket</h1>
      <TicketForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel="Create Ticket"
        loading={loading || uploading}
      />
      {errors.submit && <div className="error-message">{errors.submit}</div>}
    </div>
  );
};

export default CreateTicket;
