const express = require('express');
const app = express();
const port = 3001; // Or any port you like

// Imagine you have your sensorData array like so:
const sensorData = [
  { datetime: "2023-03-25T12:00:00.000Z", temperature: 22, humidity: 22 },
  { datetime: "2023-03-25T12:10:00.000Z", temperature: 24, humidity: 25 },
  { datetime: "2023-03-25T12:00:00.000Z", temperature: 22, humidity: 22 },
  { datetime: "2023-03-25T12:00:00.000Z", temperature: 22, humidity: 22 },
  // ... and so on
];

// Create an API route that sends JSON
app.get('/api/sensor-data', (req, res) => {
  res.json(sensorData);
});

// Start listening
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
