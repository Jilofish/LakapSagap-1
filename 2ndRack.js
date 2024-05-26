// Fetch data from Express API
fetch("http://localhost:8080/api/total-boxes/")
  .then((response) => response.json())
  .then((data) => {
    console.log("Received data:", data); // Add this line to log received data
    const firstFloorCapacity = document.getElementById("firstFloorCapacity");
    const rackCapacities = document.getElementById("rackCapacities2");

    // Define floor and rack names for the 2nd floor
    const floorRackNames = [
      { floor: "2nd Floor", rack: "Rack 1" },
      { floor: "2nd Floor", rack: "Rack 2" },
      { floor: "2nd Floor", rack: "Rack 3" },
      { floor: "2nd Floor", rack: "Rack 4" },
      { floor: "2nd Floor", rack: "Rack 5" },
      { floor: "2nd Floor", rack: "Rack 6" },
      { floor: "2nd Floor", rack: "Floor" },
    ];

    // Iterate over floor and rack names
    floorRackNames.forEach(({ floor, rack }) => {
      // Find the entry corresponding to the floor and rack names
      const entry = data.find(
        (entry) => entry.floor === floor && entry.rack === rack
      );

      // Get the total boxes or set it to 0 if no data is available
      const totalBoxes = entry ? entry.total_boxes : 0;

      // Create HTML elements for rack capacity
      const rackContainer = document.createElement("div");
      rackContainer.classList.add("flex", "mb-3");

      const rackNameElement = document.createElement("div");
      rackNameElement.classList.add(
        "flex",
        "w-40",
        "text-sm",
        "font-bold",
        "items-center",
        "justify-center",
        "rounded-tl-lg",
        "rounded-bl-lg",
        "border-r",
        "border-gray-200",
        "bg-slate-200",
        "p-2"
      );
      rackNameElement.textContent = rack;

      const rackCapacity = document.createElement("div");
      rackCapacity.classList.add(
        "w-full",
        "bg-green-700",
        "p-2",
        "rounded-tr-lg",
        "rounded-br-lg",
        "text-white",
        "text-xs",
        "font-semibold",
        "hover:bg-green-900",
        "transition-colors"
      );
      rackCapacity.innerHTML = `
                      <i class="fa-solid fa-box-open text-sm ml-3"></i> 
                      <span class="mr-3">Boxes: </span> 
                      <span>${totalBoxes}</span>
                    `;

      rackContainer.appendChild(rackNameElement);
      rackContainer.appendChild(rackCapacity);
      rackCapacities.appendChild(rackContainer);
    });
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
    // Handle error if needed
  });
