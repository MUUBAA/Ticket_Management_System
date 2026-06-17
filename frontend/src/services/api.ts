import {
  API_BASE_URL,
} from '../utils/constants';

// =====================================
// REQUEST OPTIONS
// =====================================

interface RequestOptions
  extends RequestInit {

  params?: Record<
    string,
    string | number
  >;

  responseType?:
    | 'json'
    | 'blob';
}

class ApiClient {

  private baseURL: string;

  constructor(
    baseURL: string
  ) {

    this.baseURL =
      baseURL;
  }

  // =====================================
  // AUTH HEADERS
  // =====================================

  private getAuthHeaders():
    HeadersInit {

    const token =
      localStorage.getItem(
        'auth_token'
      );

    return {

      'Content-Type':
        'application/json',

      ...(token
        ? {
            Authorization:
              `Bearer ${token}`,
          }
        : {}),
    };
  }

  // =====================================
  // HANDLE AUTO LOGOUT
  // =====================================

  private handleUnauthorized(
    endpoint: string
  ) {

    if (
      endpoint !==
      '/auth/profile'
    ) {

      localStorage.removeItem(
        'auth_token'
      );

      localStorage.removeItem(
        'auth'
      );

      const logoutEvent =
        new CustomEvent(
          'token-expired',
          {
            detail: {
              reason:
                'Token expired',
            },
          }
        );

      window.dispatchEvent(
        logoutEvent
      );
    }
  }

  // =====================================
  // MAIN REQUEST
  // =====================================

  private async request<T>(
    endpoint: string,

    options:
      RequestOptions = {}
  ): Promise<T> {

    const {
      params,
      responseType =
        'json',
      ...fetchOptions
    } = options;

    // ===================================
    // BUILD URL
    // ===================================

    let url =
      `${this.baseURL}${endpoint}`;

    if (params) {

      const queryString =
        new URLSearchParams(

          Object.entries(
            params
          ).map(
            ([key, value]) => [

              key,

              String(
                value
              ),
            ]
          )
        ).toString();

      url =
        `${url}?${queryString}`;
    }

    // ===================================
    // API CALL
    // ===================================

    const response =
      await fetch(
        url,
        {

          ...fetchOptions,

          headers: {

            ...this.getAuthHeaders(),

            ...fetchOptions.headers,
          },
        }
      );

    // ===================================
    // TOKEN EXPIRED
    // ===================================

   if (
  response.status === 401
) {

  const isLoginRequest =
    endpoint.includes(
      '/auth/login'
    );

  if (!isLoginRequest) {

    this.handleUnauthorized(
      endpoint
    );

    throw new Error(
      'Session expired. Please login again.'
    );
  }

  const errorData =
    await response.json();

  throw new Error(

    errorData.error
      ?.message ||

    'Invalid email or password'
  );
}

    // ===================================
    // HANDLE ERRORS
    // ===================================

    if (!response.ok) {

      let errorMessage =
        `HTTP error! status: ${response.status}`;

      try {

        const errorData =
          await response.json();

        errorMessage =

          errorData.error
            ?.message

          ||

          errorData.message

          ||

          errorMessage;

      } catch {

        errorMessage =
          `HTTP error! status: ${response.status} ${response.statusText}`;
      }

      throw new Error(
        errorMessage
      );
    }

    // ===================================
    // BLOB RESPONSE
    // ===================================

    if (
      responseType ===
      'blob'
    ) {

      return (
        await response.blob()
      ) as T;
    }

    // ===================================
    // JSON RESPONSE
    // ===================================

    const text =
      await response.text();

    return text
      ? (JSON.parse(
          text
        ) as T)
      : ({} as T);
  }

  // =====================================
  // GET
  // =====================================

  get<T>(
    endpoint: string,

    params?: Record<
      string,
      string | number
    >,

    responseType:
      | 'json'
      | 'blob' = 'json'
  ): Promise<T> {

    return this.request<T>(
      endpoint,

      {
        method: 'GET',

        params,

        responseType,
      }
    );
  }

  // =====================================
  // POST
  // =====================================

  post<T>(
    endpoint: string,

    data?: unknown
  ): Promise<T> {

    return this.request<T>(
      endpoint,

      {
        method: 'POST',

        body:
          JSON.stringify(
            data
          ),
      }
    );
  }

  // =====================================
  // PUT
  // =====================================

  put<T>(
    endpoint: string,

    data?: unknown
  ): Promise<T> {

    return this.request<T>(
      endpoint,

      {
        method: 'PUT',

        body:
          JSON.stringify(
            data
          ),
      }
    );
  }

  // =====================================
  // PATCH
  // =====================================

  patch<T>(
    endpoint: string,

    data?: unknown
  ): Promise<T> {

    return this.request<T>(
      endpoint,

      {
        method: 'PATCH',

        body:
          JSON.stringify(
            data
          ),
      }
    );
  }

  // =====================================
  // DELETE
  // =====================================

  delete<T>(
    endpoint: string
  ): Promise<T> {

    return this.request<T>(
      endpoint,

      {
        method: 'DELETE',
      }
    );
  }

  // =====================================
  // FILE UPLOAD
  // =====================================

  async upload<T>(
    endpoint: string,

    formData: FormData
  ): Promise<T> {

    const token =
      localStorage.getItem(
        'auth_token'
      );

    const headers:
      HeadersInit = {};

    if (token) {

      headers.Authorization =
        `Bearer ${token}`;
    }

    const url =
      `${this.baseURL}${endpoint}`;

    const response =
      await fetch(
        url,
        {

          method: 'POST',

          headers,

          body: formData,
        }
      );

    // ===================================
    // TOKEN EXPIRED
    // ===================================

    if (
      response.status === 401
    ) {

      this.handleUnauthorized(
        endpoint
      );

      throw new Error(
        'Session expired. Please login again.'
      );
    }

    // ===================================
    // HANDLE ERRORS
    // ===================================

    if (!response.ok) {

      let errorMessage =
        'Upload failed';

      try {

        const errorData =
          await response.json();

        errorMessage =

          errorData.error
            ?.message

          ||

          errorData.message

          ||

          errorMessage;

      } catch {

        //
      }

      throw new Error(
        errorMessage
      );
    }

    return response.json();
  }
}

// =========================================
// EXPORT INSTANCE
// =========================================

export const apiClient =
  new ApiClient(
    API_BASE_URL
  );

export default apiClient;