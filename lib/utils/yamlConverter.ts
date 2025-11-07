/**
 * YAML to JSON converter utility for OpenAPI specifications
 */

export interface ConversionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Detect if content is YAML or JSON
 */
export function detectFormat(content: string): 'yaml' | 'json' | 'unknown' {
  const trimmed = content.trim();
  
  // Check if it's JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // Not valid JSON
    }
  }
  
  // Check for YAML indicators
  if (
    trimmed.includes('openapi:') ||
    trimmed.includes('swagger:') ||
    /^[a-zA-Z_]+:\s/m.test(trimmed)
  ) {
    return 'yaml';
  }
  
  return 'unknown';
}

/**
 * Simple YAML to JSON converter
 * Note: This is a basic implementation. For production, use a library like js-yaml
 */
export function yamlToJson(yamlContent: string): ConversionResult {
  try {
    // This is a simplified parser - in production, use js-yaml library
    const lines = yamlContent.split('\n');
    const result: Record<string, unknown> = {};
    const stack: Array<{ obj: Record<string, unknown>; indent: number }> = [
      { obj: result, indent: -1 },
    ];

    for (const line of lines) {
      // Skip empty lines and comments
      if (!line.trim() || line.trim().startsWith('#')) continue;

      // Get indentation level
      const indent = line.search(/\S/);
      if (indent === -1) continue;

      // Extract key-value
      const match = line.match(/^(\s*)([^:]+):\s*(.*)$/);
      if (!match) continue;

      const [, , key, value] = match;
      const cleanKey = key.trim();
      let cleanValue: unknown = value.trim();

      // Parse value types
      if (cleanValue === '') {
        cleanValue = {};
      } else if (cleanValue === 'true') {
        cleanValue = true;
      } else if (cleanValue === 'false') {
        cleanValue = false;
      } else if (/^\d+$/.test(cleanValue)) {
        cleanValue = parseInt(cleanValue, 10);
      } else if (/^\d+\.\d+$/.test(cleanValue)) {
        cleanValue = parseFloat(cleanValue);
      } else if (cleanValue.startsWith('"') || cleanValue.startsWith("'")) {
        cleanValue = cleanValue.slice(1, -1);
      }

      // Find parent object based on indentation
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      const parent = stack[stack.length - 1].obj;
      parent[cleanKey] = cleanValue;

      // If value is an object, add to stack
      if (typeof cleanValue === 'object' && cleanValue !== null) {
        stack.push({ obj: cleanValue as Record<string, unknown>, indent });
      }
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse YAML',
    };
  }
}

/**
 * Convert YAML OpenAPI spec to JSON
 * For production use, install and use the 'js-yaml' package:
 * npm install js-yaml @types/js-yaml
 */
export async function convertYamlToJson(yamlContent: string): Promise<ConversionResult> {
  try {
    // Try to use js-yaml if available
    if (typeof window !== 'undefined') {
      // Client-side: use dynamic import
      try {
        // For now, use our simple parser
        // In production, replace with: const yaml = await import('js-yaml');
        // return { success: true, data: yaml.load(yamlContent) };
        return yamlToJson(yamlContent);
      } catch {
        return yamlToJson(yamlContent);
      }
    } else {
      // Server-side
      return yamlToJson(yamlContent);
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Conversion failed',
    };
  }
}

/**
 * Validate if content is a valid OpenAPI specification
 */
export function validateOpenAPISpec(spec: unknown): boolean {
  if (typeof spec !== 'object' || spec === null) return false;
  
  const specObj = spec as Record<string, unknown>;
  
  // Check for OpenAPI 3.x
  if (specObj.openapi && typeof specObj.openapi === 'string') {
    return specObj.openapi.startsWith('3.');
  }
  
  // Check for Swagger 2.0
  if (specObj.swagger && specObj.swagger === '2.0') {
    return true;
  }
  
  return false;
}

/**
 * Auto-detect format and convert to JSON if needed
 */
export async function processOpenAPIContent(content: string): Promise<ConversionResult> {
  const format = detectFormat(content);
  
  if (format === 'json') {
    try {
      const data = JSON.parse(content);
      if (!validateOpenAPISpec(data)) {
        return {
          success: false,
          error: 'Content is not a valid OpenAPI specification',
        };
      }
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid JSON',
      };
    }
  }
  
  if (format === 'yaml') {
    const result = await convertYamlToJson(content);
    if (result.success && result.data) {
      if (!validateOpenAPISpec(result.data)) {
        return {
          success: false,
          error: 'Content is not a valid OpenAPI specification',
        };
      }
    }
    return result;
  }
  
  return {
    success: false,
    error: 'Unable to detect file format. Expected JSON or YAML OpenAPI specification.',
  };
}
