import axios from "axios";

const API_BASE_URL =
  "http://164.52.217.188:8082/api";

class AttachmentService {

  // Convert file to base64
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Extract base64 part (remove data:image/png;base64, prefix)
        const base64String = result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  async uploadAttachment(
    ticketId: number,
    file: File
  ) {

    const token =
      localStorage.getItem(
        "auth_token"
      );

    try {
      // Convert file to base64
      const base64Data = await this.fileToBase64(file);

      const payload = {
        base64: base64Data,
        fileName: file.name,
        fileType: file.type,
      };

      const response =
        await axios({

          method: "POST",

          url: `${API_BASE_URL}/tickets/${ticketId}/attachments`,

          data: payload,

          headers: {

            Authorization:
              `Bearer ${token}`,

            "Content-Type": "application/json",
          },
        });

      return response.data;
    } catch (error) {
      console.error("Failed to upload attachment:", error);
      throw error;
    }
  }
}

export default new AttachmentService();