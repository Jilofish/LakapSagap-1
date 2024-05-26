import mysql from "mysql2";

import dotenv from "dotenv";
dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

export async function getRegistrations() {
  const [rows] = await pool.query("SELECT * FROM registration");
  return rows;
}

export async function getRegistration(user_regis_id) {
  const [rows] = await pool.query(
    `
    SELECT * 
    FROM registration
    WHERE user_regis_id=?`,
    [user_regis_id]
  );
  return rows[0];
}

export async function createRegistration(
  firstname,
  lastname,
  email,
  address,
  baranggay,
  password,
  phone_number,
  role_designation,
  organization,
  gender,
  registration_date,
  id_image_path
) {
  const [result] = await pool.query(
    `
    INSERT INTO registration (firstname, lastname, email, address, baranggay, password, phone_number, role_designation, organization, gender, registration_date, id_image_path)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      firstname,
      lastname,
      email,
      address,
      baranggay,
      password,
      phone_number,
      role_designation,
      organization,
      gender,
      registration_date,
      id_image_path,
    ]
  );
  const user_regis_id = result.insertId;
  return getRegistration(user_regis_id);
}

// Async function to delete registration by user_regis_id
export async function deleteRegistration(user_regis_id) {
  await pool.query(
    `
        DELETE FROM registration WHERE user_regis_id = ?
    `,
    [user_regis_id]
  );
}

// Async function to confirm registration by user_regis_id
export async function confirmRegistration(user_regis_id) {
  await pool.query(
    `
        UPDATE registration SET confirmed = true WHERE user_regis_id = ?
    `,
    [user_regis_id]
  );
}

// Async function to create a new ticket
export async function createTicket(title, description) {
  const result = await pool.query(
    `
        INSERT INTO tickets (title, description) VALUES (?, ?)
    `,
    [title, description]
  );

  const newTicketId = result.insertId;
  return newTicketId;
}

//Tickets
// Async function to retrieve all tickets
export async function getAllTickets() {
  const [tickets] = await pool.query(`
        SELECT * FROM tickets
    `);
  return tickets;
}

// Async function to retrieve a ticket by ID
export async function getTicketById(ticket_no) {
  const [ticket] = await pool.query(
    `
        SELECT * FROM tickets WHERE ticket_no = ?
    `,
    [ticket_no]
  );
  return ticket[0];
}

// Async function to update a ticket by ID
export async function updateTicket(ticket_no, title, description, active) {
  await pool.query(
    `
        UPDATE tickets SET title = ?, description = ?, active = ? WHERE ticket_no = ?
    `,
    [title, description, active, ticket_no]
  );
}

// Async function to delete a ticket by ID
export async function deleteTicket(ticket_no) {
  await pool.query(
    `
        DELETE FROM tickets WHERE ticket_no = ?
    `,
    [ticket_no]
  );
}

// Async function to create a new stock item
export const createStockItem = async (itemData) => {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.query(
      "INSERT INTO received_stock SET ?",
      itemData
    );
    return results.insertId;
  } finally {
    connection.release();
  }
};

// Async function to get all stock items
export const getAllStockItems = async () => {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.query("SELECT * FROM received_stock");
    return results;
  } finally {
    connection.release();
  }
};

// Async function to retrieve a stock item by item code and batch number
export const getStockItem = async (itemCode) => {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.query(
      "SELECT * FROM received_stock WHERE item_code = ?",
      [itemCode]
    );
    return results[0];
  } finally {
    connection.release();
  }
};

// Async function to update a stock item
export const updateStockItem = async (itemCode, newData) => {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      `UPDATE received_stock SET item = ?, item_type = ?, category = ?, pieces = ?, box = ?, floor = ?, rack = ?, expiry_date = ?, receive_type = ?, plate_number = ?, driver_name = ?, supplier = ?, date_received = ? WHERE item_code = ?`,
      [
        newData.item,
        newData.item_type,
        newData.category,
        newData.pieces,
        newData.box,
        newData.floor,
        newData.rack,
        newData.expiry_date,
        newData.receive_type,
        newData.plate_number,
        newData.driver_name,
        newData.supplier,
        newData.date_received,
        itemCode
      ]
    );
    return true;
  } finally {
    connection.release();
  }
}

// Async function to delete a stock item
export const deleteStockItem = async (itemCode) => {
  const connection = await pool.getConnection();
  try {
    await connection.query("DELETE FROM received_stock WHERE item_code = ?", [
      itemCode,
    ]);
    return true;
  } finally {
    connection.release();
  }
};

// Function to transfer stock from received_stock to released_stock
export async function transferStock(item_code, batch_number) {
  try {
    // Start a transaction
    await connection.beginTransaction();

    // Select the stock item from received_stock
    const [rows] = await connection.execute(
      `
        SELECT item_code, batch_number, item, item_type, category, pieces, box, floor, rack, expiry_date, receive_type, plate_number, driver_name, supplier, date_received
        FROM received_stock
        WHERE item_code = ? AND batch_number = ?
    `,
      [item_code, batch_number]
    );

    if (rows.length === 0) {
      throw new Error("Stock item not found in received_stock");
    }

    const stock = rows[0];

    // Insert the stock item into released_stock
    await connection.execute(
      `
        INSERT INTO released_stock (
            item_code, batch_number, item, item_type, category, pieces, box, floor, rack, expiry_date, release_type, plate_number, driver_name, supplier, date_released
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,
      [
        stock.item_code,
        stock.batch_number,
        stock.item,
        stock.item_type,
        stock.category,
        stock.pieces,
        stock.box,
        stock.floor,
        stock.rack,
        stock.expiry_date,
        stock.receive_type,
        stock.plate_number,
        stock.driver_name,
        stock.supplier,
      ]
    );

    // Delete the stock item from received_stock
    await connection.execute(
      `
        DELETE FROM received_stock
        WHERE item_code = ? AND batch_number = ?
    `,
      [item_code, batch_number]
    );

    // Commit the transaction
    await connection.commit();

    console.log("Stock transferred successfully.");
  } catch (error) {
    // Rollback the transaction in case of error
    await connection.rollback();
    console.error("Error transferring stock:", error);
  } finally {
    await connection.end();
  }
}

// Define an async function to handle database operations
export async function fetchDataFromMySQL() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`
      SELECT 
        batch_number,
        receive_type,
        GROUP_CONCAT(item_code ORDER BY item_code SEPARATOR ', ') AS item_codes,
        GROUP_CONCAT(item ORDER BY item_code SEPARATOR ', ') AS items,
        GROUP_CONCAT(pieces ORDER BY item_code SEPARATOR ', ') AS quantities,
        supplier,
        date_received
      FROM 
        received_stock
      GROUP BY 
        batch_number, receive_type, supplier, date_received;
    `);
    connection.release(); // Release the connection back to the pool
    return rows;
  } catch (error) {
    console.error('Error fetching data from MySQL:', error);
    throw error; // Rethrow the error for handling elsewhere
  }
}

// Define an async function to fetch total boxes on different racks on the first and second floors
export async function getTotalBoxesByFloorAndRack() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`
      SELECT 
          floor,
          rack,
          SUM(box) AS total_boxes
      FROM 
          received_stock
      WHERE
          floor IN ('1st Floor', '2nd Floor')
      GROUP BY 
          floor, rack;
    `);
    connection.release();
    return rows;
  } catch (error) {
    console.error('Error fetching total boxes:', error);
    throw error;
  }
}

// Function to get total pieces of all stocks
export async function getTotalPiecesOfStocks() {
  try {
      const connection = await pool.getConnection(); // Get connection from pool
      const [rows] = await connection.execute('SELECT SUM(pieces) AS total_pieces FROM received_stock');
      connection.release(); // Release connection back to pool
      return rows[0].total_pieces;
  } catch (error) {
      throw error;
  }
}

export async function getWarehouseCapacityStatus() {
  try {
      // Assuming you have a query to fetch the total occupied and total capacity from the warehouse in boxes
      const connection = await pool.getConnection();
      const [rows] = await connection.execute('SELECT SUM(box) AS total_occupied, 5000 AS total_capacity FROM received_stock');
      const totalOccupied = rows[0].total_occupied;
      const totalCapacity = rows[0].total_capacity;
      const percentageOccupied = (totalOccupied / totalCapacity) * 100;
      return { totalOccupied, totalCapacity, percentageOccupied };
  } catch (error) {
      throw error;
  }
}

// Async function to fetch newly arrived items from MySQL database
export async function getNewlyArrivedItems(date) {
  try {
    // Create a connection to the MySQL database
    const connection = await mysql.createConnection(dbConfig);

    // Fetch items from the database that arrived on or after the specified date
    const [newlyArrivedItems] = await connection.execute(
      'SELECT * FROM received_stock WHERE date_received >= ?',
      [date]
    );

    // Close the connection
    await connection.end();

    return newlyArrivedItems;
  } catch (error) {
    throw new Error(`Error fetching newly arrived items: ${error.message}`);
  }
}

export async function receiveStock(data) {
  try {
    // Destructure the data object
    const {
      batchNumber,
      item,
      itemType,
      category,
      pieces,
      box,
      floor,
      rack,
      expiryDate,
      receiveType,
      plateNumber,
      driverName,
      supplier,
      dateReceived,
    } = data;

    // Check if batchNumber is defined
    if (batchNumber === undefined) {
      throw new Error('Batch number is required.');
    }

    // Construct the SQL query
    const sql = `
      INSERT INTO received_stock (
        batch_number, item, item_type, category, pieces, box, floor, rack, expiry_date,
        receive_type, plate_number, driver_name, supplier, date_received
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Execute the SQL query with parameterized values
    const [result] = await pool.execute(sql, [
      batchNumber,
      item || null,
      itemType || null,
      category || null,
      pieces || null,
      box || null,
      floor || null,
      rack || null,
      expiryDate || null,
      receiveType || null,
      plateNumber || null,
      driverName || null,
      supplier || null,
      dateReceived || null,
    ]);

    // Return the result of the query execution
    return result;
  } catch (error) {
    // Log and re-throw any errors
    throw error;
  }
}

export async function getTotalReceivedBoxesAndDateRange() {
  try {
    // Fetch total received boxes
    const [rows] = await pool.execute('SELECT SUM(box) AS total_received_boxes FROM received_stock');
    const totalReceivedBoxes = rows[0].total_received_boxes;

    // Calculate start of the year
    const today = new Date();
    const year = today.getFullYear();
    const startDate = new Date(year, 0, 1); // January 1st of the current year
    const formattedStartDate = startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    // Use current date as the end date
    const formattedEndDate = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    // Create date range string
    const dateRange = `${formattedStartDate} - ${formattedEndDate}`;

    return { totalReceivedBoxes, dateRange };
  } catch (error) {
    console.error('Error fetching received stocks info:', error);
    throw error;
  }
}

export async function getStocksByPeriod(period) {
  let periodCondition = '';

  switch (period) {
    case 'Quarterly':
      periodCondition = `
        (
          (MONTH(date_received) BETWEEN 1 AND 3) OR
          (MONTH(date_received) BETWEEN 4 AND 6) OR
          (MONTH(date_received) BETWEEN 7 AND 9) OR
          (MONTH(date_received) BETWEEN 10 AND 12)
        )
        AND YEAR(date_received) = YEAR(CURDATE())
      `;
      break;
    case 'Semi-Annual':
      periodCondition = `
        (
          (MONTH(date_received) BETWEEN 1 AND 6) OR
          (MONTH(date_received) BETWEEN 7 AND 12)
        )
        AND YEAR(date_received) = YEAR(CURDATE())
      `;
      break;
    case 'Annual':
      periodCondition = 'YEAR(date_received) = YEAR(CURDATE())';
      break;
    default:
      throw new Error('Invalid period');
  }

  const query = `SELECT item_code, item, item_type, category, pieces, floor, rack, expiry_date, date_received FROM received_stock WHERE ${periodCondition}`;
  
  console.log('Generated Query:', query); // Log the generated query

  const [rows] = await pool.query(query);
  
  console.log('Fetched Rows:', rows); // Log the fetched rows

  return rows;
}