import OpenAI from "openai";

const API_KEY = process.env.OPENAI_API_KEY as string;
const openai = new OpenAI({ apiKey: API_KEY });

// System prompt for code generation
const CODE_GENERATION_SYSTEM_PROMPT = `Generate a Project in React app. Create multiple components, organizing them in separate folders with filenames using the .js extension, if needed. The output should use Tailwind CSS for styling, 
without any third-party dependencies or libraries, except for icons from the lucide-react library, which should only be used when necessary. Available icons include: Heart, Shield, Clock, Users, Play, Home, Search, Menu, User, Settings, Mail, Bell, Calendar, Star, Upload, Download, Trash, Edit, Plus, Minus, Check, X, and ArrowRight. For example, you can import an icon as import { Heart } from "lucide-react" and use it in JSX as <Heart className="" />.
also you can use date-fns for date format and react-chartjs-2 chart, graph library

Return the response in JSON format with the following schema:
{
  "projectTitle": "",
  "explanation": "",
  "files": {
    "/App.js": {
      "code": ""
    },
    ...
  },
  "generatedFiles": []
}

Generate a programming code structure for a React project using Vite. Create multiple components, organizing them in separate folders with filenames using the .js extension, if needed. The output should use Tailwind CSS for styling, without any third-party dependencies or libraries, except for icons from the lucide-react library, which should only be used when necessary. Available icons include: Heart, Shield, Clock, Users, Play, Home, Search, Menu, User, Settings, Mail, Bell, Calendar, Star, Upload, Download, Trash, Edit, Plus, Minus, Check, X, and ArrowRight. For example, you can import an icon as import { Heart } from "lucide-react" and use it in JSX as <Heart className="" />.

Ensure the files field contains all created files, and the generatedFiles field lists all the filenames. Each file's code should be included in the code field, following this example:
files:{
  "/App.js": {
    "code": "import React from 'react';\\nimport './styles.css';\\nexport default function App() {\\n  return (\\n    <div className='p-4 bg-gray-100 text-center'>\\n      <h1 className='text-2xl font-bold text-blue-500'>Hello, Tailwind CSS with Sandpack!</h1>\\n      <p className='mt-2 text-gray-700'>This is a live code editor.</p>\\n    </div>\\n  );\\n}"
  }
}
  Additionally, include an explanation of the project's structure, purpose, and functionality in the explanation field. Make the response concise and clear in one paragraph.
  - When asked then only use this package to import, here are some packages available to import and use (date-fns,react-chartjs-2) only when it required
  
  - For placeholder images, please use a https://archive.org/download/placeholder-image/placeholder-image.jpg
  -Add Emoji icons whenever needed to give good user experience
  - all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.

- By default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.

- Use icons from lucide-react for logos only when needed.
- use shadows and cards
- proper spacing between elements and padding

- Use stock photos from unsplash where appropriate, only valid URLs you know exist. Do not download the images, only link to them in image tags.`;

// Chat session wrapper
export const chatSession = {
  sendMessage: async (prompt: string) => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 1,
      top_p: 0.95,
      max_tokens: 8192,
    });

    return {
      response: {
        text: () => response.choices[0]?.message?.content || "",
      },
    };
  },
};

// Code generation session wrapper
export const GenAICode = {
  sendMessage: async (prompt: string) => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: CODE_GENERATION_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 1,
      top_p: 0.95,
      max_tokens: 8192,
      response_format: { type: "json_object" },
    });

    return {
      response: {
        text: () => response.choices[0]?.message?.content || "",
      },
    };
  },
};

// System prompt for API opportunity analysis
const API_OPPORTUNITY_ANALYSIS_PROMPT = `You are an expert API architect and developer. Analyze the provided OpenAPI specification to identify opportunities for new capabilities and features.

For each opportunity, consider:
1. Missing CRUD operations (if GET exists, are POST/PUT/DELETE/PATCH missing?)
2. Composite endpoints that could combine multiple operations
3. Batch operation possibilities (e.g., bulk create, update, delete)
4. Filtering and search capabilities
5. Pagination improvements
6. Related endpoints that could be linked
7. Authentication/authorization patterns
8. Rate limiting opportunities
9. Caching strategies
10. Webhook/event notification possibilities
11. API versioning improvements
12. Documentation gaps

For each opportunity:
- Categorize it appropriately
- Assess implementation effort (low/medium/high)
- Assess potential impact/value (low/medium/high)
- Identify which existing endpoints are affected
- Provide a clear rationale
- Suggest implementation approach if possible
- Include an example if helpful

Prioritize opportunities that are:
- Low effort, high impact (quick wins)
- Close to being implementable with existing infrastructure
- Add significant value with minimal changes

Return the response in JSON format following this schema:
{
  "opportunities": [
    {
      "id": "unique-id",
      "category": "missing_crud|composite_endpoint|batch_operation|filtering_search|pagination|related_endpoints|authentication|rate_limiting|caching|webhooks|versioning|documentation",
      "title": "Brief title",
      "description": "What this opportunity adds",
      "rationale": "Why this would be valuable",
      "effort": "low|medium|high",
      "impact": "low|medium|high",
      "affectedEndpoints": ["list", "of", "endpoint", "paths"],
      "suggestedImplementation": "How to implement this",
      "example": "Code or usage example if applicable",
      "dependencies": ["Any dependencies or prerequisites"]
    }
  ]
}`;

// API opportunity analysis session wrapper
export const analyzeAPIOpportunities = {
  sendMessage: async (openapiSpec: string) => {
    // Validate spec size to prevent excessive API costs
    const MAX_SPEC_LENGTH = 50000; // ~50KB limit
    if (openapiSpec.length > MAX_SPEC_LENGTH) {
      throw new Error(`OpenAPI spec too large (${openapiSpec.length} chars). Maximum allowed is ${MAX_SPEC_LENGTH} chars.`);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: API_OPPORTUNITY_ANALYSIS_PROMPT },
        { role: "user", content: `Analyze this OpenAPI specification and identify opportunities:\n\n${openapiSpec}` },
      ],
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 8192,
      response_format: { type: "json_object" },
    });

    return {
      response: {
        text: () => response.choices[0]?.message?.content || "",
      },
    };
  },
};
