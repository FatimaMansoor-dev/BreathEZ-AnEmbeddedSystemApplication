const { connectToDb } = require('./connection');
connectToDb();

const sensorData = [
    { datetime: "2023-03-25T12:00:00.000Z", temperature: 22, humidity: 45 },
    { datetime: "2023-03-25T12:01:00.000Z", temperature: 23, humidity: 47 },
    { datetime: "2023-03-25T12:02:00.000Z", temperature: 21, humidity: 44 },
    { datetime: "2023-03-25T12:03:00.000Z", temperature: 24, humidity: 48 },
    { datetime: "2023-03-25T12:04:00.000Z", temperature: 22, humidity: 46 },
    { datetime: "2023-03-25T12:05:00.000Z", temperature: 23, humidity: 45 },
    { datetime: "2023-03-25T12:06:00.000Z", temperature: 25, humidity: 50 },
    { datetime: "2023-03-25T12:07:00.000Z", temperature: 24, humidity: 49 },
    { datetime: "2023-03-25T12:08:00.000Z", temperature: 23, humidity: 47 },
    { datetime: "2023-03-25T12:09:00.000Z", temperature: 22, humidity: 46 },
    { datetime: "2023-03-25T12:10:00.000Z", temperature: 24, humidity: 48 },
    { datetime: "2023-03-25T12:11:00.000Z", temperature: 23, humidity: 45 },
    { datetime: "2023-03-25T12:12:00.000Z", temperature: 21, humidity: 44 },
    { datetime: "2023-03-25T12:13:00.000Z", temperature: 22, humidity: 46 },
    { datetime: "2023-03-25T12:14:00.000Z", temperature: 23, humidity: 47 }
  ];
  
console.log(sensorData);
  