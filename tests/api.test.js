const request = require('supertest'); // Import Supertest for HTTP testing
const app = require('../src/index'); // Import the app for testing

describe('API Tests', () => {
  // Test sending a message to a channel
  it('should send a message to a channel', async () => {
    const res = await request(app)
      .post('/event_api') // Send POST request to event API
      .send({ event: 'test_event', message: 'Hello', channel: 'test_channel' }); // Send the test payload

    expect(res.statusCode).toEqual(200); // Expect status 200 (OK)
    expect(res.body.success).toBe(true); // Expect success to be true
    expect(res.body.message).toBe('Message sent to channel!'); // Expect success message
  });

  // Test for missing event in the payload
  it('should return an error for missing event', async () => {
    const res = await request(app)
      .post('/event_api') // Send POST request to event API
      .send({ message: 'Hello', channel: 'test_channel' }); // Send incomplete payload (missing event)

    expect(res.statusCode).toEqual(400); // Expect status 400 (Bad Request)
    expect(res.body.success).toBe(false); // Expect success to be false
    expect(res.body.message).toBe('Event cannot be empty'); // Expect error message
  });
});
