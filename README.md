# Messaging Backend API
#### Video Demo: [INSERT VIDEO LINK HERE]

## Overview

This project is a comprehensive backend API designed to power a Discord-like messaging application. Built using **Node.js**, **Express.js**, and **Firebase**, it serves as the foundational infrastructure for a real-time chat platform. The application provides a robust set of endpoints that allow users to manage their profiles, create and manage servers (similar to Discord guilds), organize conversations into channels, and exchange messages in real-time.

The core philosophy behind this project was to create a scalable, serverless solution that could handle the complexities of a social platform without the overhead of managing physical servers. By leveraging Firebase Cloud Functions and Firestore, the application achieves high availability and automatic scaling.

## Motivation

I am a software development instructor, and I built this project to serve as the backend infrastructure for my students. The goal was to provide them with a working, realistic API so they could focus purely on building the frontend mobile application (a simplified Discord clone) using Flutter.

I wanted my students to learn how to:
*   **Consume REST APIs**: Make valid HTTP requests and handle responses.
*   **Manage Application State**: Handle data flow in a mobile app.
*   **Understand Client-Server Architecture**: See clearly where their responsibility ends and the server's begins.

This project solves a practical teaching problem: it removes the blockage of needing to build a backend before learning frontend development. It provides a "black box" that works reliably, allowing students to iterate on their UI/UX.

### Security Note (Pedagogical Choice)
### Security Note
Authentication is enforced using Firebase Auth. All API requests must include a valid Firebase ID Token in the `Authorization` header (`Bearer <token>`). This ensures that only authenticated users can access the endpoints.

## Technical Architecture

The project is built on a modern JavaScript stack:

*   **Runtime**: Node.js (v18)
*   **Framework**: Express.js
*   **Cloud Provider**: Google Firebase (Cloud Functions)
*   **Database**: Cloud Firestore (NoSQL)
*   **Testing**: Jest + Supertest

### Design Pattern: Service-Controller-Route

I implemented a clear separation of concerns using a layered architecture:
1.  **Routes Layer (`src/routes/`)**: Defines the HTTP endpoints and maps them to specific logic. This layer handles the request/response cycle, input validation, and HTTP status codes.
2.  **Utils/Service Layer (`src/firebase/`)**: Contains the core business logic and direct interactions with the Firestore database. This separation ensures that the database logic is reusable and testable independently of the HTTP layer.

### Database Schema

One of the most interesting challenges was designing the Firestore schema. Unlike a SQL database where normalization is key, Firestore often requires denormalization to reduce the number of reads.

*   **Users**: Stored as root-level documents.
*   **Servers**: Root-level collection. Each server contains metadata (name, owner).
*   **Channels**: Root-level collection for easier querying independent of servers, though logically linked to them.
*   **Messages**: Stored as a *sub-collection* of Channels. This was a crucial design decision. By nesting messages within channels (`channels/{channelId}/messages`), I ensure that queries for messages are scoped automatically to their parent channel, improving performance and security.

### Key Features Implemented

1.  **User Management**: Users can sign up and manage their profiles. The system integrates with Firebase Authentication (managed on the client side) but maintains a synchronized User record in Firestore for application-specific data.
2.  **Server Management**: Users can create servers, generating a unique space for communities.
3.  **Invitation System**: I implemented a secure invitation system. Server owners can generate unique, hashed invitation links (`/servers/:serverId/invite`). When a user attempts to join via a link, the backend validates the hash to prevent unauthorized access.
4.  **Channels & Messaging**: Support for creating multiple channels within a server and sending text messages.
5.  **Reactions**: A fun feature allowing users to react to messages with emojis.

## Challenges and Learning

The journey was not without its hurdles. One significant challenge was **managing asynchronous code**. Node.js is single-threaded and event-driven, meaning that database operations are non-blocking. I had to master `async/await` patterns to ensure that the API responded only after data was successfully written or retrieved. Early on, I faced issues where the API would return a 200 OK response before the data was actually saved to Firestore, leading to "ghost" data issues.

Another challenge was **NoSQL Data Modeling**. Coming from a SQL background, my instinct was to use joins. Firestore doesn't support server-side joins in the traditional sense. I had to learn to perform application-side joins or structure the data (like using arrays of IDs) to allow for efficient fetching. For example, when fetching a server, I initially struggled to get the member list efficiently. I solved this by storing a `memberIds` array on the Server document itself, allowing me to check membership with a simple array-contains query.

## Installation and Usage

To run this project locally, you need Node.js and the Firebase CLI installed.

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/StartZ-10517/cs50-final-project
    cd messaging-backend/functions
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Set up Firebase**:
    You will need a `serviceAccountKey.json` file from your Firebase console in the `src/` directory to run efficiently locally, or rely on `firebase login`.

4.  **Run Locally**:
    ```bash
    npm run start
    ```
    This launches the Firebase Emulator Suite, allowing you to test endpoints at `http://localhost:5001/...`.

5.  **Run Tests**:
    ```bash
    npm test
    ```
    This project maintains high test coverage using Jest.

## AI Statement

I certify that I have written the code for this project myself. I used AI assistance solely for the purpose of translating and refining the English text of this README file to ensure clarity and improved grammar. The logic, architecture, and implementation are my own work.

## Future Improvements

If I had more time, I would like to implement:
*   **WebSockets**: Currently, the API is REST-based. For a chat app, real-time sockets (like Socket.io) would provide a snappier experience than polling.
*   **Media Support**: Adding the ability to upload images/files to Firebase Storage and link them in messages.
*   **Direct Messages (DMs)**: Private conversations between two users outside of a server context.
