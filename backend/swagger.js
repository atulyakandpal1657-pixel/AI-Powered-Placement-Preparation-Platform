const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "PlacePrep AI Backend API",
    version: "1.0.0",
    description: "Swagger documentation for the PlacePrep AI backend API.",
  },
  servers: [
    {
      url: process.env.SWAGGER_SERVER_URL || `https://placeprep-backend-w679.onrender.com/api`,
      description: "Production API endpoint",
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          avatar: { type: "string" },
          role: { type: "string" },
          problemsSolved: { type: "number" },
          streak: { type: "number" },
          lastActive: { type: "string", format: "date-time" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          token: { type: "string" },
          user: { $ref: "#/components/schemas/User" },
        },
      },
      Note: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          topic: { type: "string" },
          difficulty: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          pinned: { type: "boolean" },
          personalExplanation: { type: "string" },
          codeSolution: { type: "string" },
          revisionNotes: { type: "string" },
          checklist: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: { type: "string" },
                done: { type: "boolean" },
              },
            },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      NoteInput: {
        type: "object",
        properties: {
          title: { type: "string" },
          topic: { type: "string" },
          difficulty: { type: "string", enum: ["Easy", "Medium", "Hard"] },
          tags: { type: "array", items: { type: "string" } },
          personalExplanation: { type: "string" },
          codeSolution: { type: "string" },
          revisionNotes: { type: "string" },
          checklist: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: { type: "string" },
                done: { type: "boolean" },
              },
            },
          },
        },
        required: ["title", "topic"],
      },
    },
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: {
            description: "API is running",
          },
        },
      },
    },
    "/api/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  email: { type: "string" },
                  password: { type: "string" },
                },
                required: ["name", "email", "password"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          400: { description: "Validation failed or email already exists" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login existing user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                },
                required: ["email", "password"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "User authenticated successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user profile",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Current user profile",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout current user",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Logged out successfully" },
        },
      },
    },
    "/api/notes": {
      get: {
        tags: ["Notes"],
        summary: "List notes",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "List of notes",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    notes: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Note" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Notes"],
        summary: "Create a new note",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/NoteInput" },
            },
          },
        },
        responses: {
          201: {
            description: "Note created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    note: { $ref: "#/components/schemas/Note" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/notes/{id}": {
      get: {
        tags: ["Notes"],
        summary: "Get a note by ID",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Note retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    note: { $ref: "#/components/schemas/Note" },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["Notes"],
        summary: "Update a note",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/NoteInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Note updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    note: { $ref: "#/components/schemas/Note" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Notes"],
        summary: "Delete a note",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Note deleted" },
        },
      },
    },
    "/api/notes/{id}/pin": {
      patch: {
        tags: ["Notes"],
        summary: "Toggle note pin status",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Note pin toggled",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    note: { $ref: "#/components/schemas/Note" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
