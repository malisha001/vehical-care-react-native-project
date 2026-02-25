import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Vehicle Service Center API",
      version: "1.0.0",
      description:
        "REST API for Vehicle Service Center - Cleaning, Modification, Repairing, Carrier Services",
      contact: {
        name: "Vehicle Service Center",
        email: "support@vehicleservice.com",
      },
    },
    servers: [
      { url: "http://localhost:5000/api", description: "Development Server" },
      {
        url: "https://api.vehicleservice.com/api",
        description: "Production Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: {},
            meta: {
              type: "object",
              properties: {
                page: { type: "integer" },
                limit: { type: "integer" },
                total: { type: "integer" },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
