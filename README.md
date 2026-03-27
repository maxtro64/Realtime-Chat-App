# Realtime Chat Application: High-Concurrency Messaging System

![High-fidelity Chat Interface](https://via.placeholder.com/1200x600?text=Hangout+Chat+Interface+Demo)

## 🚀 The Moat: Technical Decisions & Architecture

Unlike standard "tutorial" chat apps, **Hangout Chat** is designed for high availability and security:

1.  **Scaling with Redis**: Implemented `@socket.io/redis-adapter` to allow horizontal scaling. Multiple Node.js instances can share WebSocket state via a Redis Pub/Sub backplane.
2.  **Stateless Auth**: Uses JWT in secure, partitioned cookies to ensure the backend remains stateless while maintaining session integrity.
3.  **Security-First**: Integrated `helmet` for CSP headers and `express-rate-limit` to mitigate DoS attacks on the API layer.
4.  **Schema Validation**: Leveraged `zod` for strictly typed API payloads, reducing runtime errors.
5.  **Clean Architecture**: Separated concerns into a clear `src` structure (Controllers, Services, Models, Routes).

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Lucide Icons, Socket.io-client.
- **Backend**: Node.js, Express, Socket.io, Mongoose (MongoDB).
- **Scale/DevOps**: Redis, Docker, Docker Compose, Vitest (Unit Testing).

## 📦 Core Features

- **Real-time Communication**: Low-latency message broadcasting.
- **Media Management**: Image uploads integrated with Cloudinary.
- **Presence Tracking**: Typing indicators and online/offline status.
- **Security**: BCrypt password hashing and JWT authorization.

## 🚀 Getting Started

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/maxtro64/RealTime_chaapp.git
    npm install
    ```
2.  **Environment Setup**:
    - Create a `.env` file in `/backend` using `.env.example`.
3.  **Run with Docker**:
    ```bash
    docker-compose up --build
    ```

## 📈 Future Roadmap

- [ ] Implementation of Kafka for high-throughput message logging.
- [ ] End-to-end encryption for private DM rooms.
- [ ] PWA support for mobile-first experience.

---
*Built with ❤️ by Shivam Yadav*
