document.getElementById('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  const itemCode = document.getElementById('editItemCode').value; // Assuming you pass the item code through some other way

  try {
    const response = await fetch(`http://localhost:8080/api/items/${itemCode}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      // Handle successful edit (e.g., refresh the table or show a success message)
      console.log('Item updated successfully');
      closeModal('edit-modal'); // Assuming the modal ID is 'edit-modal' instead of 'editModal'
    } else {
      // Handle error
      console.error('Failed to update item');
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

function openEditModal(item) {
  // Populate the form fields with the item data
  document.getElementById('itemName').value = item.item;
  document.getElementById('itemType').value = item.item_type;
  document.getElementById('category-dropdown').value = item.category; // Corrected ID
  document.getElementById('pieces').value = item.pieces;
  document.getElementById('box').value = item.box;
  document.getElementById('floor').value = item.floor;
  document.getElementById('rack').value = item.rack;
  document.getElementById('expiryDate').value = item.expiry_date;
  document.getElementById('receiveType').value = item.receive_type;
  document.getElementById('plateNumber').value = item.plate_number;
  document.getElementById('driverName').value = item.driver_name;
  document.getElementById('supplier').value = item.supplier;
  document.getElementById('dateReceived').value = item.date_received;
  
  document.getElementById('editItemCode').value = item.item_code; // Store item code in a hidden input
  document.getElementById('edit-modal').style.display = 'block'; // Corrected modal ID
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}