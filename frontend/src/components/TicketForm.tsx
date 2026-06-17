import React, {
  useState,
  useEffect,
} from 'react';

import {
  CreateTicketInput,
  UpdateTicketInput,
} from '../types/ticket';

import {
  Attachment,
} from '../types/attachment';

import AttachmentUploader
  from './common/AttachmentUploader/AttachmentUploader';
import { useAuth } from '@/hooks/useAuth';

import { Company } from "../types/company";
import { companyService } from '@/services/companyService';

interface TicketFormProps {

  onSubmit: (
    data:
      | CreateTicketInput
      | UpdateTicketInput,

    files: File[],

    audioFile: File | null
  ) => void;

  onCancel: () => void;

  submitLabel?: string;

  loading?: boolean;

  initialData?:
  | CreateTicketInput
  | UpdateTicketInput;

  existingAttachments?: Attachment[];

  onRemoveAttachment?: (
    attachmentId: number
  ) => void;
}

const TicketForm:
  React.FC<TicketFormProps> = ({

    onSubmit,

    onCancel,

    submitLabel = 'Submit',

    loading = false,

    initialData,

    existingAttachments = [],

    onRemoveAttachment,
  }) => {

    // =====================================
    // PROJECT OPTIONS
    // =====================================

    const projectOptions = [

      'Rethink POS',

      'Intellectual POS',

      'Eway Addon',

      'Retail Addon',

      'Item Upload Addon',

      'SAP',

      'Sellerkit',

      'WMS',

      'Software Development',

      'Application  Development',

      'Bulk Upload Addon',

      'Btrans',

      'CRM eServe',

      'Store Management System',

      'Waresmart',

      'Verifyt',

      'Delivryt',

      'Bajaj Integration',

      'Sony EDI Integration',

      'LG EDI Integration',

      'HDB Integration',

      'IDFC Integration',

      'Whatsapp Integration',

      'Others',
    ];

    // =====================================
    // FORM STATE
    // =====================================

    const [
      formData,
      setFormData,
    ] = useState<
      CreateTicketInput
      | UpdateTicketInput
    >({

      title:
        initialData?.title || '',

      description:
        initialData?.description || '',

      ticketType:
        initialData?.ticketType || 'Task',

      priority:
        initialData?.priority || 'Medium',

      due_date:
        initialData?.due_date || '',

      projectName:
        (initialData as UpdateTicketInput)?.projectName || '',

      companyName:
        (initialData as UpdateTicketInput)?.companyName || '',
    });

    // =====================================
    // FILE STATES
    // =====================================

    const [
      uploadedFiles,
      setUploadedFiles,
    ] = useState<File[]>([]);

    const [
      audioFile,
      setAudioFile,
    ] = useState<File | null>(null);


    const [companies, setCompanies] =
      useState<Company[]>([]);

    const { user } = useAuth();

    const isSuperAdmin =
      user?.role === "SuperAdmin";




    useEffect(() => {

      const fetchCompanies =
        async () => {

          try {

            const data =
              await companyService.getCompanies();

            setCompanies(data);

          } catch (error) {

            console.error(
              "Failed to fetch companies:",
              error,
            );
          }
        };

      fetchCompanies();

    }, []);

    // =====================================
    // UPDATE INITIAL DATA
    // =====================================

    useEffect(() => {

      if (initialData) {

        setFormData({

          title:
            initialData.title || '',

          description:
            initialData.description || '',

          ticketType:
            initialData.ticketType || 'Task',

          priority:
            initialData.priority || 'Medium',

          due_date:
            initialData.due_date || '',

          projectName:
            (initialData as UpdateTicketInput)?.projectName || '',

          companyName:
            (initialData as UpdateTicketInput)?.companyName || '',

          soNumber:
            (initialData as any)?.soNumber || '',
        });
      }

    }, [initialData]);

    // =====================================
    // HANDLE CHANGE
    // =====================================

    const handleChange = (
      e: React.ChangeEvent<
        HTMLInputElement
        | HTMLTextAreaElement
        | HTMLSelectElement
      >
    ) => {

      const {
        name,
        value,
      } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    // =====================================
    // HANDLE FILES
    // =====================================

    const handleFilesAdded = (
      files: File[]
    ) => {

      setUploadedFiles(
        (prev) => [
          ...prev,
          ...files,
        ]
      );
    };

    const handleRemoveUploadedFile = (
      index: number
    ) => {

      setUploadedFiles(
        (prev) =>
          prev.filter(
            (_, i) =>
              i !== index
          )
      );
    };

    // =====================================
    // HANDLE AUDIO
    // =====================================

    const handleAudioAdded = (
      files: File[]
    ) => {

      if (files.length > 0) {

        setAudioFile(
          files[0]
        );
      }
    };

    const handleRemoveAudio =
      () => {

        setAudioFile(
          null
        );
      };

    // =====================================
    // SUBMIT
    // =====================================

    const handleSubmit = (
      e: React.FormEvent
    ) => {

      e.preventDefault();

      onSubmit(
        formData,
        uploadedFiles,
        audioFile
      );
    };

    // =====================================
    // UI
    // =====================================

    return (

      <form
        onSubmit={handleSubmit}
        className="
        w-full
        bg-white
        rounded-3xl
        shadow-xl
        border
        border-gray-100
        p-4
        sm:p-6
        lg:p-10
        flex
        flex-col
        gap-8
      "
      >

        {/* HEADER */}

        <div className="flex flex-col gap-2">

          <h2 className="
          text-2xl
          lg:text-3xl
          font-bold
          text-gray-900
        ">
            Ticket Information
          </h2>

          <p className="
          text-sm
          text-gray-500
        ">
            Create and manage ticket details
          </p>

        </div>

        {/* ROW 1 */}

        <div className="
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-6
      ">

          {/* TITLE */}

          <div className="flex flex-col gap-2">

            <label
              htmlFor="title"
              className="
              text-sm
              font-semibold
              text-gray-800
            "
            >
              Title *
            </label>

            <input
              type="text"

              id="title"

              name="title"

              value={
                formData.title
              }

              onChange={
                handleChange
              }

              placeholder="
              Enter ticket title
            "

              required

              className="
              w-full
              h-14
              px-4
              rounded-2xl
              border
              border-gray-300
              text-sm
              outline-none
              transition-all
              focus:border-indigo-500
              focus:ring-4
              focus:ring-indigo-100
            "
            />

          </div>

          {/* PROJECT */}

          <div className="flex flex-col gap-2">

            <label
              htmlFor="projectName"
              className="
              text-sm
              font-semibold
              text-gray-800
            "
            >
              Project Name
            </label>

            <select
              id="projectName"

              name="projectName"

              value={
                (formData as UpdateTicketInput).projectName || ''
              }

              onChange={
                handleChange
              }

              className="
              w-full
              h-14
              px-4
              rounded-2xl
              border
              border-gray-300
              text-sm
              outline-none
              transition-all
              bg-white
              focus:border-indigo-500
              focus:ring-4
              focus:ring-indigo-100
            "
            >

              <option value="">
                Select Project
              </option>

              {
                projectOptions.map(
                  (project) => (

                    <option
                      key={project}
                      value={project}
                    >
                      {project}
                    </option>

                  )
                )
              }

            </select>

          </div>

        </div>

        {/* ROW 2 */}

        <div className="
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-6
      ">

          {/* TICKET TYPE */}

          <div className="flex flex-col gap-2">

            <label
              htmlFor="ticketType"
              className="
              text-sm
              font-semibold
              text-gray-800
            "
            >
              Ticket Type *
            </label>

            <select
              id="ticketType"

              name="ticketType"

              value={
                formData.ticketType
              }

              onChange={
                handleChange
              }

              required

              className="
              w-full
              h-14
              px-4
              rounded-2xl
              border
              border-gray-300
              text-sm
              outline-none
              transition-all
              bg-white
              focus:border-indigo-500
              focus:ring-4
              focus:ring-indigo-100
            "
            >

              <option value="Support">
                Support
              </option>

              <option value="Requirement">
                Requirement
              </option>

              <option value="Repeat Ticket">
                Repeat Ticket
              </option>
            </select>

          </div>

          {/* DUE DATE */}

          <div className="flex flex-col gap-2">

            <label
              htmlFor="dueDate"
              className="
              text-sm
              font-semibold
              text-gray-800
            "
            >
              Due Date
            </label>

            <input
              type="date"

              id="dueDate"

              name="due_date"

              value={
                formData.due_date
              }

              onChange={
                handleChange
              }

              className="
              w-full
              h-14
              px-4
              rounded-2xl
              border
              border-gray-300
              text-sm
              outline-none
              transition-all
              focus:border-indigo-500
              focus:ring-4
              focus:ring-indigo-100
            "
            />

          </div>

        </div>

        {
          isSuperAdmin &&
          formData.ticketType === "Requirement" && (

            <div
              className="
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-6
      "
            >

              <div
                className="
          flex
          flex-col
          gap-2
        "
              >

                <label
                  htmlFor="soNumber"
                  className="
            text-sm
            font-semibold
            text-gray-800
          "
                >
                  SO Number *
                </label>

                <input
                  type="text"

                  id="soNumber"

                  name="soNumber"

                  value={
                    (formData as any).soNumber || ''
                  }

                  onChange={
                    handleChange
                  }

                  placeholder="
            Enter SO Number
          "

                  className="
            w-full
            h-14
            px-4
            rounded-2xl
            border
            border-gray-300
            text-sm
            outline-none
            transition-all
            focus:border-indigo-500
            focus:ring-4
            focus:ring-indigo-100
          "
                />

              </div>

            </div>
          )
        }

        {/* ROW 3 */}

        <div className="
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-6
      ">

          {/* PRIORITY */}

          <div className="flex flex-col gap-2">

            <label
              htmlFor="priority"
              className="
              text-sm
              font-semibold
              text-gray-800
            "
            >
              Priority *
            </label>

            <select
              id="priority"

              name="priority"

              value={
                formData.priority
              }

              onChange={
                handleChange
              }

              required

              className="
              w-full
              h-14
              px-4
              rounded-2xl
              border
              border-gray-300
              text-sm
              outline-none
              transition-all
              bg-white
              focus:border-indigo-500
              focus:ring-4
              focus:ring-indigo-100
            "
            >

              <option value="Low">
                Low
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="High">
                High
              </option>

              <option value="Critical">
                Critical
              </option>

            </select>

          </div>

          {
            isSuperAdmin && (

              <div
                className="flex flex-col gap-2"
              >

                <label
                  htmlFor="companyName"
                  className="
              text-sm
              font-semibold
              text-gray-800
            "
                >
                  Company Name
                </label>

                <select
                  id="companyName"
                  name="companyName"

                  value={
                    formData.companyName
                  }

                  onChange={
                    handleChange
                  }

                  className="
              w-full
              h-14
              px-4
              rounded-2xl
              border
              border-gray-300
              text-sm
              outline-none
              transition-all
              bg-white
              focus:border-indigo-500
              focus:ring-4
              focus:ring-indigo-100
            "
                >

                  <option value="">
                    Select Company
                  </option>

                  {
                    companies.map(
                      (company) => (

                        <option
                          key={
                            company.companyName
                          }

                          value={
                            company.companyName
                          }
                        >

                          {
                            company.companyName
                          }

                        </option>
                      ),
                    )
                  }

                </select>

              </div>
            )
          }

        </div>



        {/* DESCRIPTION */}

        <div className="flex flex-col gap-2">

          <label
            htmlFor="description"
            className="
            text-sm
            font-semibold
            text-gray-800
          "
          >
            Description
          </label>

          <textarea
            id="description"

            name="description"

            value={
              formData.description
            }

            onChange={
              handleChange
            }

            placeholder="
            Enter ticket description
          "

            rows={8}

            className="
            w-full
            px-4
            py-4
            rounded-2xl
            border
            border-gray-300
            text-sm
            outline-none
            resize-none
            transition-all
            focus:border-indigo-500
            focus:ring-4
            focus:ring-indigo-100
          "
          />

        </div>

        {/* ATTACHMENTS */}

        <div className="flex flex-col gap-3">

          <label className="
          text-sm
          font-semibold
          text-gray-800
        ">
            Attachments
          </label>

          <div className="
          border
          border-dashed
          border-gray-300
          rounded-2xl
          p-4
          bg-gray-50
        ">

            <AttachmentUploader

              onFilesAdded={
                handleFilesAdded
              }

              existingAttachments={
                existingAttachments
              }

              onRemoveAttachment={
                onRemoveAttachment
              }

              onRemoveUploadedFile={
                handleRemoveUploadedFile
              }
            />

          </div>

        </div>

        {/* AUDIO */}

        <div className="flex flex-col gap-3">

          <label className="
          text-sm
          font-semibold
          text-gray-800
        ">
            Audio Recording
          </label>

          <div className="
          border
          border-dashed
          border-gray-300
          rounded-2xl
          p-4
          bg-gray-50
        ">

            <AttachmentUploader

              accept="audio/*"

              onFilesAdded={
                handleAudioAdded
              }

              existingAttachments={[]}

              onRemoveAttachment={
                handleRemoveAudio
              }

              isAudio
            />

          </div>

        </div>

        {/* ACTIONS */}

        <div className="
        flex
        flex-col-reverse
        sm:flex-row
        justify-end
        gap-4
        pt-4
      ">

          <button
            type="button"

            onClick={onCancel}

            className="
            h-12
            px-8
            rounded-2xl
            border
            border-gray-300
            bg-white
            text-gray-700
            font-medium
            hover:bg-gray-100
            transition-all
          "
          >
            Cancel
          </button>

          <button
            type="submit"

            disabled={loading}

            className="
            h-12
            px-8
            rounded-2xl
            bg-indigo-600
            text-white
            font-semibold
            hover:bg-indigo-700
            transition-all
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
          >

            {
              loading
                ? 'Submitting..'
                : submitLabel
            }

          </button>

        </div>

      </form>
    );
  };

export default TicketForm;
