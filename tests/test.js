const { exec } = require('child_process');
const fs = require('fs');
const axios = require('axios');

describe('JSON Server Generator Tests', () => {
    let serverProcess;

    // Before all tests: Generate and start the server
    beforeAll((done) => {
        // Run generator.js to create server.js
        exec('node generator.js', (err) => {
            if (err) throw err;

            // Start the generated server
            serverProcess = exec('node server.js');
            serverProcess.on('error', (err) => {
                throw err;
            });

            // Wait briefly for the server to start
            setTimeout(done, 1000); // 1 second delay
        });
    });

    // After all tests: Clean up by stopping the server
    afterAll((done) => {
        if (serverProcess) {
            serverProcess.kill();
        }
        done();
    });

    // Test 1: Check if server.js was generated
    test('Server file is generated', () => {
        expect(fs.existsSync('server.js')).toBe(true);
    });

    // Test 2: Public endpoint (GET /home)
    test('GET /home returns welcome message', async () => {
        const response = await axios.get('http://localhost:3000/home');
        expect(response.status).toBe(200);
        expect(response.data).toEqual({ message: 'Welcome to Home Page' });
    });

    // Test 3: Authenticated endpoint (POST /login) with Authorization
    test('POST /login succeeds with Authorization', async () => {
        const response = await axios.post(
            'http://localhost:3000/login',
            { username: 'test' }, // Body is optional in this case
            { headers: { 'Authorization': 'Bearer token' } }
        );
        expect(response.status).toBe(200);
        expect(response.data).toEqual({ message: 'Login successful' });
    });

    // Test 4: Authenticated endpoint fails without Authorization
    test('POST /login fails without Authorization', async () => {
        try {
            await axios.post('http://localhost:3000/login', { username: 'test' });
        } catch (error) {
            expect(error.response.status).toBe(401);
            expect(error.response.data).toEqual({ message: 'Unauthorized' });
        }
    });

    // Test 5: Admin endpoint (GET /admin) with correct Authorization
    test('GET /admin succeeds with admin Authorization', async () => {
        const response = await axios.get('http://localhost:3000/admin', {
            headers: { 'Authorization': 'admin' }
        });
        expect(response.status).toBe(200);
        expect(response.data).toEqual({ message: 'Admin data' });
    });

    // Test 6: Admin endpoint fails with non-admin Authorization
    test('GET /admin fails with non-admin Authorization', async () => {
        try {
            await axios.get('http://localhost:3000/admin', {
                headers: { 'Authorization': 'Bearer token' }
            });
        } catch (error) {
            expect(error.response.status).toBe(403);
            expect(error.response.data).toEqual({ message: 'Forbidden' });
        }
    });

    // Test 7: Admin endpoint fails without Authorization
    test('GET /admin fails without Authorization', async () => {
        try {
            await axios.get('http://localhost:3000/admin');
        } catch (error) {
            expect(error.response.status).toBe(401);
            expect(error.response.data).toEqual({ message: 'Unauthorized' });
        }
    });
});