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
      ...(process.env.RENDER_EXTERNAL_URL
        ? [
            {
              url: `${process.env.RENDER_EXTERNAL_URL}/api`,
              description: "Production Server (Render)",
            },
          ]
        : [
            {
              url: "http://localhost:5001/api",
              description: "Development Server",
            },
          ]),
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
  apis: [
    process.env.NODE_ENV === "production"
      ? "./dist/routes/*.js"
      : "./src/routes/*.ts",
  ],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
