
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import {
    getRegistrations,
    getRegistration,
    createRegistration,
    deleteRegistration, 
    confirmRegistration,
    createTicket, 
    getAllTickets, 
    getTicketById, 
    updateTicket, 
    deleteTicket,
    createStockItem,
    getAllStockItems, 
    getStockItem,
    updateStockItem, 
    deleteStockItem,
    fetchDataFromMySQL,
    getTotalBoxesByFloorAndRack,
    getTotalPiecesOfStocks,
    getWarehouseCapacityStatus,
    getNewlyArrivedItems,
    receiveStock,
    getTotalReceivedBoxesAndDateRange,
    getStocksByPeriod
} from './database.js'

const app = express()
app.use(bodyParser.json())
app.use(express.json())
app.use(cors())

app.use(express.static('public'))

// Get all registration
app.get("/registration", async (req, res) => {
    const registrations = await getRegistrations()
    res.send(registrations)
})


// Get single registration
app.get("/registration/:user_regis_id", async (req, res) => {
    const user_regis_id = req.params.user_regis_id
    const registration = await getRegistration(user_regis_id)
    res.send(registration)
})

// Create registration
app.post("/registration", async (req, res) => {
    const { firstname, lastname, email, address, baranggay, password, phone_number, role_designation, organization, gender, registration_date, id_image_path } = req.body
    const registration = await createRegistration(firstname, lastname, email, address, baranggay, password, phone_number, role_designation, organization, gender, registration_date, id_image_path)
    res.status(201).send(registration)
})

// Route to delete registration by user_regis_id
app.delete('/registration/:user_regis_id', async (req, res) => {
    const user_regis_id = req.params.user_regis_id;

    try {
        await deleteRegistration(user_regis_id)
        res.status(200).send("Registration deleted successfully.")
    } catch (error) {
        console.error("Error deleting registration:", error)
        res.status(500).send("Internal Server Error")
    }
})

// Route to create a new ticket
app.post('/tickets', async (req, res) => {
    const { title, description } = req.body;

    try {
        const newTicketId = await createTicket(title, description);
        res.status(201).json({ id: newTicketId, title, description });
    } catch (error) {
        console.error("Error creating ticket:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Route to get all tickets
app.get('/tickets', async (req, res) => {
    try {
        const tickets = await getAllTickets();
        res.json(tickets);
    } catch (error) {
        console.error("Error getting tickets:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Route to get a ticket by ID
app.get('/tickets/:ticket_no', async (req, res) => {
    

    try {
        const ticket_no = req.params.ticket_no;
        const ticket = await getTicketById(ticket_no)
        res.send(ticket)
    } catch (error) {
        console.error("Error getting ticket by ID:", error);
        res.status(500).send("Internal Server Error");
    }
})

// Route to update a ticket by ID
app.put('/tickets/:ticket_no', async (req, res) => {
    const ticket_no = req.params.ticket_no;
    const { title, description, active } = req.body;

    try {
        await updateTicket(ticket_no, title, description, active);
        res.status(200).send("Ticket updated successfully.");
    } catch (error) {
        console.error("Error updating ticket:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Route to delete a ticket by ID
app.delete('/tickets/:ticket_no', async (req, res) => {
    const ticket_no = req.params.ticket_no;

    try {
        await deleteTicket(ticket_no);
        res.status(200).send("Ticket deleted successfully.");
    } catch (error) {
        console.error("Error deleting ticket:", error);
        res.status(500).send("Internal Server Error");
    }
})

// Create a new stock item
app.post('/stock', async (req, res) => {
  try {
    const newItemId = await createStockItem(req.body);
    res.status(201).json({ message: 'Stock item created', itemCode: newItemId });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
})

// Route to get all stock items
app.get('/stock', async (req, res) => {
  try {
    const stockItems = await getAllStockItems();
    res.json(stockItems);
  } catch (error) {
    console.error('Error fetching stock items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})

// Get a specific stock item
app.get('/stock/:itemCode', async (req, res) => {
  try {
    const { itemCode } = req.params;
    const stockItem = await getStockItem(itemCode);
    if (stockItem) {
      res.json(stockItem);
    } else {
      res.status(404).json({ error: 'Stock item not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
})

// Route to handle the update
app.put('/api/items/:itemCode', async (req, res) => {
  const itemCode = req.params.itemCode;
  const newData = req.body;

  try {
    const result = await updateStockItem(itemCode, newData);
    if (result) {
      res.status(200).send('Item updated successfully');
    } else {
      res.status(500).send('Failed to update item');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
})

// Delete a stock item
app.delete('/stock/:itemCode', async (req, res) => {
  try {
    const { itemCode } = req.params;
    const success = await deleteStockItem(itemCode);
    if (success) {
      res.json({ message: 'Stock item deleted' });
    } else {
      res.status(404).json({ error: 'Stock item not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Define a route to serve the JSON data
app.get('/api/stocks', async (req, res) => {
  try {
    const stocks = await fetchDataFromMySQL(); // Call the fetchDataFromMySQL function
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching data from MySQL:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Define a route to get the total boxes on different racks on the first and second floors
app.get('/api/total-boxes', async (req, res) => {
  try {
    const totalBoxes = await getTotalBoxesByFloorAndRack(); // Call the async function
    res.json(totalBoxes);
  } catch (error) {
    console.error('Error getting total boxes:', error);
    res.status(500).send('Internal Server Error');
  }
})

app.get('/api/total-pieces', async (req, res) => {
  try {
      const totalPieces = await getTotalPiecesOfStocks();
      res.json({ total_pieces: totalPieces });
  } catch (error) {
      console.error('Error fetching total pieces:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
})

app.get('/api/warehouse-capacity', async (req, res) => {
  try {
      const { totalOccupied, totalCapacity, percentageOccupied } = await getWarehouseCapacityStatus();
      res.json({ totalOccupied, totalCapacity, percentageOccupied });
  } catch (error) {
      console.error('Error fetching warehouse capacity status:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
})


// Route for fetching newly arrived items
app.get('/newly-arrived-items', async (req, res) => {
  try {
    const { date } = req.query; // Assuming the date is passed as a query parameter
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    // Call the async function from database.js to fetch newly arrived items
    const newlyArrivedItems = await getNewlyArrivedItems(date);
    res.json(newlyArrivedItems);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})

app.post('/submit-stock-data', async (req, res) => {
  try {
    const result = await receiveStock(req.body);
    res.status(201).json({ message: 'Stock received successfully', itemId: result.insertId });
  } catch (error) {
    console.error('Error in /submit-stock-data:', error);
    res.status(500).json({ message: 'An error occurred while receiving stock', error: error.message });
  }
});

// Endpoint to fetch total received boxes and date range
app.get('/received-stocks-info', async (req, res) => {
  try {
    const { totalReceivedBoxes, dateRange } = await getTotalReceivedBoxesAndDateRange();
    res.json({ total_received_boxes: totalReceivedBoxes, date_range: dateRange });
  } catch (error) {
    console.error('Error fetching received stocks info:', error);
    res.status(500).json({ message: 'Failed to fetch received stocks info' });
  }
})



app.get('/stock', async (req, res) => {
  const period = req.query.period;
  try {
    const stocks = await getStocksByPeriod(period);
    res.json(stocks);
  } catch (error) {
    res.status(500).send('Error fetching stocks');
  }
});

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.listen(8080, () => {
    console.log('Server is running on port 8080')
})