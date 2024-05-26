function formatDate(dateString) {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}
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
        // Get the elements
        const openEditModalBtns = document.querySelectorAll('[data-modal-target="edit-modal"]');
        const editModal = document.getElementById('edit-modal');
        const closeEditModalBtn = document.getElementById('closeEditModal');

        const openDeleteModalBtns = document.querySelectorAll('[data-modal-target="popup-modal"]');
        const deleteModal = document.getElementById('popup-modal');
        const closeDeleteModalBtn = document.getElementById('closeDeleteModal');

        // Function to open edit modal
        openEditModalBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            editModal.classList.remove('hidden');
          });
        });

        // Function to close edit modal
        closeEditModalBtn.addEventListener('click', () => {
          editModal.classList.add('hidden');
        });

        // Function to handle deletion confirmation
        function handleDeleteConfirmation(itemCode) {
          // Send a DELETE request to the server
          fetch(`/stock/${itemCode}`, {
            method: 'DELETE'
          })
          .then(response => {
            if (response.ok) {
              // If the response is successful (status code 200-299), you may want to handle it here
              console.log('Stock item deleted successfully');
              // Optionally, you can perform any additional actions after successful deletion
            } else {
              // If the response is not successful, handle the error here
              console.error('Error deleting stock item:', response.status);
              // Optionally, you can display an error message to the user
            }
          })
          .catch(error => {
            // If an error occurs during deletion, handle it here
            console.error('Error deleting stock item:', error);
            // Optionally, you can display an error message to the user
          });
        }

        openDeleteModalBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            deleteModal.classList.remove('hidden');
          });
        });
        
        // Function to close delete modal
        closeDeleteModalBtn.addEventListener('click', () => {
          deleteModal.classList.add('hidden');
        });
  } catch (error) {
      console.error('Error fetching stock items:', error);
  }
}

document.addEventListener('DOMContentLoaded', fetchStockItems);