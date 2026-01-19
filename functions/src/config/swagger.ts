import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Messaging API",
      version: "1.0.0",
      description: "Backend pédagogique pour appli de messagerie type Discord",
    },
    servers: [
      {
        url: "https://us-central1-messaging-backend-m2i.cloudfunctions.net/api",
        description: "Production",
      },
    ],
    tags: [
      {
        name: "Health",
        description: "Health check endpoint",
      },
      {
        name: "Users",
        description: "Gestion des utilisateurs",
      },
      {
        name: "Servers",
        description: "Gestion des serveurs de messagerie",
      },
      {
        name: "Channels",
        description: "Gestion des channels dans les serveurs",
      },
      {
        name: "Messages",
        description: "Gestion des messages dans les channels",
      },
      {
        name: "Reactions",
        description: "Gestion des réactions sur les messages",
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
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/app.ts", "./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
