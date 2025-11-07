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
   */
  async parseOpenAPIFromUrl(url: string): Promise<BackendResponse<OpenAPISpec>> {
    try {
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
      const response = await this.client.get(`/api/openapi/${specId}/endpoints`);
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
      const response = await this.client.get(`/api/openapi/${specId}/endpoints/${endpointId}`);
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
      const response = await this.client.get(`/api/workflows/${workflowId}`);
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
      const response = await this.client.put(`/api/workflows/${workflowId}`, workflow);
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
      const response = await this.client.delete(`/api/workflows/${workflowId}`);
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
      const response = await this.client.post(`/api/workflows/${workflowId}/execute`, { inputs });
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
      const response = await this.client.post(`/api/openapi/${specId}/endpoints/${endpointId}/test`, {
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
