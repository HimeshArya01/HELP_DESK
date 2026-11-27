const express=require('express');

const app=express();
const PORT=5000;

//Middleware to parse Json 
app.use(express.json());

//Temporary database
let Tickets=[];
let nextID=1;

//Allowed values
const allowedPriorities=["Low","Medium","High"];
const Status=["Started","In progress","Pending","Resolved"];

//Welcome routes of the Server
app.get('/',(req,res)=>{
    res.json({
        message:"Welcome to the HelpDesk\nOnly Platform to resolve your Queries",
        availableRoutes:["GET /api/tickets",
      "GET /api/tickets/:id",
      "POST /api/tickets",
      "PUT /api/tickets/:id",
      "PATCH /api/tickets/:id",
      "DELETE /api/tickets/:id"]
    });
});

//CREATE Tickets
app.post('/api/tickets',(req,res)=>{
    const {title,description,priority}=req.body;
    
    //validate the title
    if(!title || title!=='string' || !title.trim()){
        return res.status(400).json({
            message:"Title is required"
        });
    }

    //Validate the Description
    if(!description || description!=='string' || !description.trim()){
        return res.status(400).json({
            message:"Description is required"
        });
    }

    //Validate the priority
    if(priority!==undefined && !allowedPriorities.includes(priority)){
       return res.status(400).json({
        message:"Priority should be Low,Medium,High"
       });
    }

    //Automatically create tickets
    const newTicket={
        id:nextID++,
        title:title.trim(),
        description:description.trim(),
        priority:priority || "Medium",
        status:"Open",
        createdAt: new Data().toISOString(),//show the time when tickets get created 
        updatedAt: new Data().toISOString()
    }

    //Save ticket in the memory
    Tickets.push(newTicket);

    return res.status(201).json({
        message:"Ticket created successfully",
        ticket:newTicket
    });
})

//Show all the created tickets(Filtering,searching,pagination)
app.get('/api/tickets',(req,res)=>{
    const [status,priority,search]=req.body;

    const page=Math.max(1,parseInt(req.query.page) || 1);
    const limit=Math.min(100,parseInt(req.query.limit) || 10);

    let filteredTickets=[...Tickets];

    //Filter by status
    if(status){
        filteredTickets=filteredTickets.filter(
            Tickets=>Tickets.status.toLowerCase()===status.toLowerCase()
        );
    }

    //filter by priority
    if(priority){
        filteredTickets=filteredTickets.filter(
            Tickets=>Tickets.priority.toLowerCase()===priority.toLowerCase()
        )
    }

    //filter by serach
    if(search){
        filteredTickets=filteredTickets.filter(
            Tickets=>
            Tickets.title.toLowerCase().includes(search.toLowerCase()) || 
            Tickets.description.toLowerCase().includes(search.toLowerCase())
        );
    }

    //Pagination Calculation
    const totalTicket=filteredTickets.length;
    const totalpages=Math.ceil(totalTicket/limit);
    const startIndex=(page-1)*limit;

    const paginatedTickets=filteredTickets.slice(startIndex,startIndex+limit);

    return res.status(200).json({
        message:"Tickets fetch successfully",
        pagination:{
            totalTickets,
            page,
            limit,
            totalpages
        },
        Tickets:paginatedTickets
    });
});

//Read Ticket By Id
app.get('/get/tickets/:id',(req,res)=>{
    const id = Number(req.params.id);

    if(!Number.isInteger(id) || id<=0){
        return res.status(400).json({
            message:"Invalid ticket ID"
        });
    }

    const Ticket=Tickets.find(Ticket=>Ticket.id===id);

    if(!Ticket){
        return res.status(404).json({
            message:"Ticket not found"
        });
    }

    return res.status(200).json({
        message:"Ticket fetched successfully"
    });
})

//Update Ticket(PUT)
app.put('/api/ticket/:id',(req,res)=>{
    const id=Number(req.params.id);

    if(!Number.isInteger(id) || id<=0){
        return res.status(400).json({
            message:"Inavlid Ticket ID"
        });
    }

    const ticket=Tickets.find(ticket=>ticket.id === id);

    if(!ticket){
        return res.status(404).json({
            message:"Ticket not found"
        });
    }

    const {title,description,priority,status}=req.body;

    if(!title || !description || !priority || !status){
        return res.status(400).json({
            message:"Title,Description,priority and status are required"
        });
    }

    const validPriority=allowedPriorities.find(
        p => p.toLowerCase()===priority.toLowerCase()
    );

    const validStatus=Status.find(
        s => s.toLowerCase()===Status.toLowerCase()
    );

    if(!validPriority || !validStatus){
        return res.status(400).json({
            message:"Invalid priority or status"
        });
    }

    ticket.title=title.trim();
    ticket.description=description.trim();
    ticket.priority=priority.trim();
    ticket.status=status.trim();

    return res.status(200).json({
        message:"Ticket updated successfully"
    });
});


//Update ticket(Patch)
app.patch("/api/tickets/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid ticket ID"
    });
  }

  const ticket = tickets.find(ticket => ticket.id === id);

  if (!ticket) {
    return res.status(404).json({
      message: "Ticket not found"
    });
  }

  const updates = req.body;

  const allowedFields = [
    "title",
    "description",
    "priority",
    "status"
  ];

  const updateKeys = Object.keys(updates);

  if (updateKeys.length === 0) {
    return res.status(400).json({
      message: "Provide at least one field to update"
    });
  }

  const invalidFields = updateKeys.filter(
    key => !allowedFields.includes(key)
  );

  if (invalidFields.length > 0) {
    return res.status(400).json({
      message: `Invalid fields: ${invalidFields.join(", ")}`
    });
  }

  if (updates.title !== undefined) {
    if (typeof updates.title !== "string" || !updates.title.trim()) {
      return res.status(400).json({
        message: "Title cannot be empty"
      });
    }

    updates.title = updates.title.trim();
  }

  if (updates.description !== undefined) {
    if (
      typeof updates.description !== "string" ||
      !updates.description.trim()
    ) {
      return res.status(400).json({
        message: "Description cannot be empty"
      });
    }

    updates.description = updates.description.trim();
  }

  if (updates.priority !== undefined) {
    const validPriority = allowedPriorities.find(
      p => p.toLowerCase() === updates.priority.toLowerCase()
    );

    if (!validPriority) {
      return res.status(400).json({
        message: "Invalid priority"
      });
    }

    updates.priority = validPriority;
  }

  if (updates.status !== undefined) {
    const validStatus = allowedStatuses.find(
      s => s.toLowerCase() === updates.status.toLowerCase()
    );

    if (!validStatus) {
      return res.status(400).json({
        message: "Invalid status"
      });
    }

    updates.status = validStatus;
  }

  Object.assign(ticket, updates);

  return res.status(200).json({
    message: "Ticket updated successfully",
    ticket
  });
});

// DELETE TICKET
app.delete("/api/tickets/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid ticket ID"
    });
  }

  const ticketIndex = tickets.findIndex(
    ticket => ticket.id === id
  );

  if (ticketIndex === -1) {
    return res.status(404).json({
      message: "Ticket not found"
    });
  }

  const deletedTicket = tickets.splice(ticketIndex, 1)[0];

  return res.status(200).json({
    message: "Ticket deleted successfully",
    ticket: deletedTicket
  });
});

// 404 route
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});