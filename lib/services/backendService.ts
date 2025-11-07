import axios, { AxiosInstance } from 'axios';
import { OpenAPISpec, APIEndpoint, APIWorkflow, BackendResponse } from '../types/openapi';

/**
 * Backend service client for Magoc API integration
 * Handles communication with the backend for OpenAPI spec processing
 */
class BackendService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Backend URL from environment variable or default to localhost
    this.baseURL = process.env.NEXT_PUBLIC_MAGOC_BACKEND_URL || 'http://localhost:8000';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[BackendService] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[BackendService] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[BackendService] Response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Upload and process an OpenAPI specification
   */
  async uploadOpenAPISpec(spec: OpenAPISpec): Promise<BackendResponse<{ specId: string }>> {
    try {
      const response = await this.client.post('/api/openapi/upload', spec);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Parse OpenAPI spec from URL
   * Note: The user-provided URL is validated and sent to the backend for processing.
   * The backend is responsible for secure URL fetching with additional safeguards.
   */
  async parseOpenAPIFromUrl(url: string): Promise<BackendResponse<OpenAPISpec>> {
    try {
      // Validate URL format to prevent SSRF attacks
      // Only http and https protocols are allowed
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return {
          success: false,
          error: 'Only HTTP and HTTPS URLs are allowed',
        };
      }

      // Send validated URL to backend for processing
      // The backend service performs additional validation and secure fetching
      const response = await this.client.post('/api/openapi/parse-url', { url });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get all available API endpoints from a spec
   */
  async getAPIEndpoints(specId: string): Promise<BackendResponse<APIEndpoint[]>> {
    try {
      // Sanitize specId to prevent path traversal
      const sanitizedSpecId = encodeURIComponent(specId);
      const response = await this.client.get(`/api/openapi/${sanitizedSpecId}/endpoints`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get details of a specific endpoint
   */
  async getEndpointDetails(specId: string, endpointId: string): Promise<BackendResponse<APIEndpoint>> {
    try {
      const sanitizedSpecId = encodeURIComponent(specId);
      const sanitizedEndpointId = encodeURIComponent(endpointId);
      const response = await this.client.get(`/api/openapi/${sanitizedSpecId}/endpoints/${sanitizedEndpointId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(workflow: Omit<APIWorkflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<BackendResponse<APIWorkflow>> {
    try {
      const response = await this.client.post('/api/workflows', workflow);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get all workflows
   */
  async getWorkflows(): Promise<BackendResponse<APIWorkflow[]>> {
    try {
      const response = await this.client.get('/api/workflows');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get a specific workflow
   */
  async getWorkflow(workflowId: string): Promise<BackendResponse<APIWorkflow>> {
    try {
      const sanitizedWorkflowId = encodeURIComponent(workflowId);
      const response = await this.client.get(`/api/workflows/${sanitizedWorkflowId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update a workflow
   */
  async updateWorkflow(workflowId: string, workflow: Partial<APIWorkflow>): Promise<BackendResponse<APIWorkflow>> {
    try {
      const sanitizedWorkflowId = encodeURIComponent(workflowId);
      const response = await this.client.put(`/api/workflows/${sanitizedWorkflowId}`, workflow);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(workflowId: string): Promise<BackendResponse<void>> {
    try {
      const sanitizedWorkflowId = encodeURIComponent(workflowId);
      const response = await this.client.delete(`/api/workflows/${sanitizedWorkflowId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowId: string, inputs?: Record<string, unknown>): Promise<BackendResponse<unknown>> {
    try {
      const sanitizedWorkflowId = encodeURIComponent(workflowId);
      const response = await this.client.post(`/api/workflows/${sanitizedWorkflowId}/execute`, { inputs });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Test an API endpoint
   */
  async testEndpoint(
    specId: string,
    endpointId: string,
    parameters?: Record<string, unknown>
  ): Promise<BackendResponse<unknown>> {
    try {
      const sanitizedSpecId = encodeURIComponent(specId);
      const sanitizedEndpointId = encodeURIComponent(endpointId);
      const response = await this.client.post(`/api/openapi/${sanitizedSpecId}/endpoints/${sanitizedEndpointId}/test`, {
        parameters,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: unknown): BackendResponse<never> {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        message: error.response?.data?.message || 'Request failed',
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  /**
   * Check backend health
   */
  async healthCheck(): Promise<BackendResponse<{ status: string }>> {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}

// Export singleton instance
export const backendService = new BackendService();
export default backendService;
