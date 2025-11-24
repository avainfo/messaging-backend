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
    ],
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
