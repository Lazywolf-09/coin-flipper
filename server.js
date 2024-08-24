const express = require('express');
const { exec } = require('child_process'); // To execute shell commands
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from 'public' directory

// Route to get balance for a specific address using bitcoin-cli
app.get('/get-balance', (req, res) => {
    const address = 'tb1qw4teu7xjejakmnfgu8ug8dusp4edqfxrwlvqnw';

    // Command to get the balance
    const command = `bitcoin-cli -testnet getreceivedbyaddress ${address}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error.message}`);
            return res.status(500).json({ error: 'Error fetching balance' });
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ error: 'Error fetching balance' });
        }

        const balance = parseFloat(stdout.trim());
        res.json({ balance });
    });
});


// Route to handle coin flip
app.post('/flip-coin', async (req, res) => {
    const { amount, side } = req.body;
    const address = 'tb1qjvcdc5nu744qq34xyv6cfekgu3nr8u7vlwuyh6'; // Replace with your address

    try {
        // Check if the user has enough balance
        const balance = await client.getReceivedByAddress(address);
        if (balance < amount) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        // Simulate a coin flip
        const coinResult = Math.random() < 0.5 ? 'heads' : 'tails';
        let txId = null;

        if (coinResult === side) {
            // User wins, double the amount and send to the address
            txId = await client.sendToAddress(address, amount * 2);
        } else {
            // User loses, send the bet amount to another address
            txId = await client.sendToAddress(address, amount);
        }

        res.json({ txId, coinResult });
    } catch (error) {
        console.error('Error processing transaction:', error);
        res.status(500).json({ error: 'Error processing transaction' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
