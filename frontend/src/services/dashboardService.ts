import api from "./api";

export interface SLAMetrics {

  avgFirstResponseHours: number;

  avgResolutionHours: number;

  slaCompliance: number;

  noDueDateCount: number;

  overdueCount: number;
}

interface ApiResponse<T> {

  success: boolean;

  data: T;

  message?: string;
}

export const dashboardService = {

  // =====================================
  // GET SLA METRICS
  // =====================================

  async getSLAMetrics():
    Promise<SLAMetrics> {

    const response =
      await api.get<
        ApiResponse<SLAMetrics>
      >(
        "/tickets/sla-metrics"
      );

    return response.data;
  },
};