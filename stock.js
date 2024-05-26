async function fetchStockItems() {
    try {
        const response = await fetch('http://localhost:8080/stock');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const stockItems = await response.json();
        const tableBody = document.getElementById('stockTableBody');

        stockItems.forEach(item => {
            const row = document.createElement('tr');

            // Add data-date-received attribute to each row
            row.setAttribute('data-date-received', item.date_received);

            row.innerHTML = `
                <td class="text-center px-4 sm:px-6 py-2 font-bold whitespace-nowrap">${item.batch_number}</td>
                <td class="text-center px-4 sm:px-6 py-2 font-bold whitespace-nowrap">${item.item_code}</td>
                <td class="text-center px-4 sm:px-6 py-2 font-bold">${item.item}</td>
                <td class="text-center px-4 sm:px-6 py-2 font-bold">${item.item_type}</td>
                <td class="text-center px-4 sm:px-6 py-2 font-bold">${item.category}</td>
                <td class="text-center px-4 sm:px-6 py-2 font-bold">${item.pieces}</td>
                <td class="text-center px-4 sm:px-6 py-2 font-bold">${item.box}</td>
                <td class="text-center px-4 sm:px-6 py-2 font-bold">${item.floor} / ${item.rack}</td>
                <td class="text-center px-4 sm:px-6 py-2 font-bold whitespace-nowrap">${formatDate(item.expiry_date)}</td>        
                <td class="text-center px-4 sm:px-4 py-2 flex items-center justify-center">
                  <button data-modal-target="edit-modal" data-modal-toggle="edit-modal" type="button" class="editBtn mr-3 text-sm bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline">
                    <i class="fa-regular fa-pen-to-square"></i>
                  </button>
                  <button data-modal-target="popup-modal" data-modal-toggle="popup-modal" type="button" class="text-sm bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline">
                      <i class="fa-regular fa-trash-can"></i>
                  </button>  
                </td>  
                `;

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching stock items:', error);
    }
}

function sortTable(columnIndex) {
  const table = document.getElementById('stockTable');
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.rows);

  // Filter out rows that are not newly arrived stocks
  const newlyArrivedRows = rows.filter(row => row.hasAttribute('data-date-received'));

  // Sort the newly arrived rows based on the content of the specified column
  newlyArrivedRows.sort((a, b) => {
    const cellA = a.cells[columnIndex].textContent.trim();
    const cellB = b.cells[columnIndex].textContent.trim();

    // Compare cell values based on their types
    if (!isNaN(cellA) && !isNaN(cellB)) {
      return parseInt(cellA, 10) - parseInt(cellB, 10);
    } else {
      return cellA.localeCompare(cellB);
    }
  });

  // Clear the existing table body
  tbody.innerHTML = '';

  // Append sorted newly arrived rows to the table
  newlyArrivedRows.forEach(row => {
    tbody.appendChild(row);
  });
}