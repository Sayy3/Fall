// Function to handle received data
function handleData(event) {
    const value = event.target.value;

    // Parse the received data
    const accelX = value.getInt16(0, true) / 100;
    const accelY = value.getInt16(2, true) / 100;
    const accelZ = value.getInt16(4, true) / 100;
    const gyroX = value.getInt16(6, true) / 100;
    const gyroY = value.getInt16(8, true) / 100;
    const gyroZ = value.getInt16(10, true) / 100;

    // Do something with the parsed data
    console.log('Accelerometer X:', accelX);
    console.log('Accelerometer Y:', accelY);
    console.log('Accelerometer Z:', accelZ);
    console.log('Gyroscope X:', gyroX);
    console.log('Gyroscope Y:', gyroY);
    console.log('Gyroscope Z:', gyroZ);

    // Send fall data to server for prediction
    const fallStatus = gyroX !== 0 || gyroY !== 0 || gyroZ !== 0 ? 1 : 0;
    sendDataToServer(fallStatus);
}

// Function to send fall data to the server
async function sendDataToServer(fallStatus) {
    try {
        // Send fall data to the server
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fallStatus: fallStatus })
        });

        // Parse response
        const prediction = await response.json();
        console.log('Prediction:', prediction);

        // Update UI with prediction result
        document.getElementById('prediction').innerText = "Prediction: " + prediction.result;

        // Play buzzer if fall detected
        if (fallStatus === 1) {
            var buzzer = new AudioContext();
            buzzer.resume();
            buzzer.createOscillator().connect(buzzer.destination).start(0);
            setTimeout(() => buzzer.close(), 10000); // Buzzer plays for 10 seconds
        }

    } catch (error) {
        console.error('Error sending data to server:', error);
    }
}

// Function to check if Web Bluetooth is supported by the browser
async function isWebBluetoothSupported() {
    if (!navigator.bluetooth) {
        alert('Web Bluetooth is not supported in this browser. Please use a different browser.');
        return false;
    }
    return true;
}

// Function to connect to the Arduino Nano 33 BLE
async function connectToArduino() {
    try {
        // Request Bluetooth device
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ services: ['19B10000-E8F2-537E-4F6C-D104768A1214'] }]
        });

        // Connect to the GATT server
        const server = await device.gatt.connect();

        // Get the service
        const service = await server.getPrimaryService('19B10000-E8F2-537E-4F6C-D104768A1214');

        // Get the characteristic
        const characteristic = await service.getCharacteristic('19B10001-E8F2-537E-4F6C-D104768A1214');

        // Start notifications
        await characteristic.startNotifications();

        // Handle received fall data
        characteristic.addEventListener('characteristicvaluechanged', handleData);

    } catch (error) {
        console.error('Error connecting to Bluetooth device:', error);
    }
}

// Main function
async function main() {
    if (await isWebBluetoothSupported()) {
        await connectToArduino();
    }
  const permissionGranted = await requestSensorPermission();
  if (permissionGranted) {
    // Continue with your code to connect to the Arduino Nano 33 BLE and handle sensor data
    await connectToArduino();
  } else {
    alert('Permission to access sensors was denied.');
  }
}

// Call the main function
main();
