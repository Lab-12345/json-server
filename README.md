# JSON Server Generator
This project provides a script (generator.js) that reads a structured JSON configuration defining server nodes and links, then generates a fully functional Node.js/Express server (server.js). The generated server includes routes, middleware (e.g., CORS, authentication, admin authorization), and necessary imports, all derived from the input JSON.
## Features

Parses JSON to define server routes and middleware
Generates a ready-to-run Express server with:

* CORS support for specified origins
* Authentication middleware for protected routes
* Admin authorization for restricted endpoints


Includes test cases to validate the generator and server behavior

## Project Structure
```
json-server/
├── generator.js       # Script to generate server.js from JSON
├── server.js          # Generated server file (output)
├── example.json       # Example JSON configuration
├── tests/             # Test cases
│   └── test.js
├── package.json       # Node.js dependencies and scripts
└── README.md          # This file
```
## Prerequisites

* Node.js: Version 14.x or higher (tested with v20.16.0)
npm: Comes with Node.js for dependency management

## Setup

* Clone the Repository
```
git clone https://github.com/Lab-12345/json-server.git
cd json-server
```
## Install Dependencies:
```
npm install
```
* This installs express and cors for the server, plus jest and axios for testing.
#Verify Example JSON:
Ensure example.json exists in the root directory with a valid configuration (see "Example JSON" section below).
## Usage
* Generate the Server
* Run the generator script:
```
node generator.js
```
* This reads example.json and outputs server.js.
* Run the Generated Server
```
node server.js
```
* The server starts on http://localhost:3000.
* Test Endpoints
* Use tools like Postman or curl to test the server:

Public Route: GET http://localhost:3000/home
```
curl http://localhost:3000/home
```
* Response: {"message": "Welcome to Home Page"}
* Authenticated Route: POST http://localhost:3000/login
```
curl -X POST -H "Authorization: Bearer token" -H "Content-Type: application/json" -d '{"username":"test"}' http://localhost:3000/login
```
* Response: {"message": "Login successful"}
* Admin Route: GET http://localhost:3000/admin
```
curl -H "Authorization: admin" http://localhost:3000/admin
```
* Response: {"message": "Admin data"}

## Testing
Run Tests
```
npx jest
```
Executes the test suite in tests/test.js, which:

* Verifies server.js is generated
* Tests public, authenticated, and admin endpoints
* Validates middleware behavior (e.g., 401 for missing auth, 403 for non-admin)

## Test Requirements

*Ensure example.json is present and valid before running tests
Tests assume the server runs on port 3000; adjust if port conflicts occur

## Example JSON
* The example.json file defines the server structure. Below is the configuration included in the repository:
```
{
  "nodes": [
    {"id": "1", "name": "Start", "source": null, "target": "2", "properties": {"type": "entry"}},
    {"id": "2", "name": "CORS Middleware", "source": "1", "target": "3", "properties": {"type": "middleware", "allowed_origins": ["*"]}},
    {"id": "3", "name": "Auth Middleware", "source": "2", "target": ["4", "5", "6", "7"], "properties": {"type": "middleware", "auth_required": true}},
    {"id": "4", "name": "Login Route", "source": "3", "target": "8", "properties": {"endpoint": "/login", "method": "POST"}},
    {"id": "5", "name": "Signup Route", "source": "3", "target": "9", "properties": {"endpoint": "/signup", "method": "POST"}},
    {"id": "6", "name": "Signout Route", "source": "3", "target": "10", "properties": {"endpoint": "/signout", "method": "POST"}},
    {"id": "7", "name": "Admin Auth Middleware", "source": "3", "target": "9", "properties": {"type": "middleware", "admin_required": true}},
    {"id": "8", "name": "User Route", "source": "4", "target": "12", "properties": {"endpoint": "/user", "method": "GET"}},
    {"id": "9", "name": "Admin Route", "source": "7", "target": "13", "properties": {"endpoint": "/admin", "method": "GET"}},
    {"id": "10", "name": "Logging Middleware", "source": "5", "target": ["12", "13", "14"], "properties": {"type": "middleware", "log_requests": true}},
    {"id": "11", "name": "Home Page", "source": "2", "target": "14", "properties": {"endpoint": "/home", "method": "GET", "auth_required": false}},
    {"id": "12", "name": "About Page", "source": "2", "target": "14", "properties": {"endpoint": "/about", "method": "GET", "auth_required": false}},
    {"id": "13", "name": "News Page", "source": "2", "target": "14", "properties": {"endpoint": "/news", "method": "GET", "auth_required": false}},
    {"id": "14", "name": "Blogs Page", "source": "2", "target": "15", "properties": {"endpoint": "/blogs", "method": "GET", "auth_required": false}},
    {"id": "15", "name": "Response Dispatcher", "source": ["10", "11", "12", "13", "14"], "target": "16", "properties": {"type": "dispatcher"}},
    {"id": "16", "name": "End", "source": "15", "target": null, "properties": {"type": "exit"}}
  ]
}
```
Nodes: *  Represent server components (routes, middleware, etc.)
* Properties: Define behavior (e.g., endpoint, method, auth_required)
* Source/Target: Indicate the flow (e.g., middleware applied to routes)

## Troubleshooting

* JSON Error: If node generator.js fails with SyntaxError: Unexpected end of JSON input, ensure example.json exists and is valid. Recreate it with the above JSON if needed.
* Port Conflict: If port 3000 is in use, modify generator.js to use a different port (e.g., 3001) and update tests/test.js accordingly.
* Test Failures: Run node generator.js and node server.js manually to debug issues before running npx jest.



