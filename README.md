# ✈️ Betik Air - Flight Search & Booking API

An API for searching and booking flights built with NestJS and TypeScript. This application provides endpoints for user authentication and flight search functionality.

## 🚀 Features

- **User Authentication**: Secure JWT-based authentication
- **Flight Search**: Search for round-trip flights with customizable parameters
- **API Documentation**: Complete Swagger/OpenAPI documentation

## 📦 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/betik-air.git
   cd betik-air
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Environment Setup:

   Rename the `.env.example` file to `.env` before running the project:
   ```bash
   mv .env.example .env
   ```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run start:dev
```

This will start the server in development mode with hot-reload enabled. The API will be available at `http://localhost:3000`.

### Production Mode

```bash
npm run build
npm run start:prod
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

## 🔑 Authentication

The API uses JWT for authentication. To authenticate:

1. Send a POST request to `/auth/login` with:
   ```json
   {
     "username": "admin",
     "password": "admin"
   }
   ```

2. You will receive a response with the JWT token:
   ```json
   {
     "statusCode": 200,
     "data": {
       "accessToken": "eyJhbGciOiJIUzI1NiIsInR5..."
     }
   }
   ```

3. Include this token in the `Authorization` header for subsequent requests:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5...
   ```

## 📚 API Documentation

API documentation is available in OpenAPI/Swagger format. You can view the raw Swagger file at: `swagger.yml` in the project root.

## 🔄 Flow Diagram

A visual representation of the authentication and flight search flow is available at:
[Search Flight Flow Diagram](https://whimsical.com/search-flight-flow-diagram-BEUc6B2CVEUpXxtukqifTp)

### Available Endpoints

| Method | Endpoint         | Description                   | Authentication |
|--------|------------------|-------------------------------|----------------|
| POST   | /auth/login      | Authenticate user             | No             |
| GET    | /flight/search   | Search for flights            | Yes            |

### Response Format

All API responses follow a consistent format:

#### Success Response
```json
{
  "statusCode": 200,
  "data": { /* Response data */ }
}
```

#### Error Response
```json
{
  "message": "Error message",
  "error": "Error type",
  "statusCode": 401
}
```

### Flight Search Parameters

The `/flight/search` endpoint accepts the following query parameters:

- `departureDate`: Departure date in format YYYY-MM-DD
- `returnDate`: Return date in format YYYY-MM-DD
- `origin`: Origin location code
- `originId`: Origin location ID
- `destination`: Destination location code
- `destinationId`: Destination location ID

Example request:
```
GET /flight/search?departureDate=2025-05-15&returnDate=2025-05-27&origin=KUL&originId=1&destination=SIN&destinationId=2
```

Example response:
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "flight-id",
      "legs": [
        {
          "arrival": "2025-05-18T15:30:00",
          "departure": "2025-05-18T09:15:00",
          "originCode": "KUL",
          "originName": "Kuala Lumpur International",
          "destinationCode": "SIN",
          "destinationName": "Singapore Changi",
          "durationInMinutes": 135,
          "stopCount": 0,
          "segments": [/* segment details */]
        }
      ],
      "price": 250,
      "priceFormatted": "$250",
      "priceAfterDiscount": 225,
      "priceAfterDiscountFormatted": "$225"
    }
  ]
}
```
