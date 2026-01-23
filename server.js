const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to read from DB
const readDb = () => {
  const dbData = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(dbData);
};

// Helper function to write to DB
const writeDb = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// --- AUTH ROUTES ---
app.post('/api/auth/login', (req, res) => {
  const { username } = req.body;
  const { users } = readDb();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (user) {
    // In a real app, you'd verify a password and return a JWT
    res.json(user);
  } else {
    res.status(401).json({ message: 'Credenciales inválidas.' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, username, phone, email } = req.body;
  const db = readDb();
  
  // Check if username already exists
  if (db.users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return res.status(400).json({ message: 'El nombre de usuario ya existe.' });
  }

  const newUser = {
    id: Math.max(...db.users.map(u => u.id), 0) + 1,
    name,
    username,
    phone,
    email: email || null,
    role: 'Customer' // Always 'Customer' for public registration
  };

  db.users.push(newUser);
  writeDb(db);
  res.status(201).json(newUser);
});

// --- MENU ROUTES ---
app.get('/api/menu', (req, res) => {
  const { products } = readDb();
  res.json(products);
});

app.post('/api/menu', (req, res) => {
  const db = readDb();
  const newProduct = {
    ...req.body,
    id: Math.max(...db.products.map(p => p.id)) + 1,
  };
  db.products.push(newProduct);
  writeDb(db);
  res.status(201).json(newProduct);
});

app.put('/api/menu/:id', (req, res) => {
  const db = readDb();
  const productId = parseInt(req.params.id, 10);
  const productIndex = db.products.findIndex(p => p.id === productId);

  if (productIndex !== -1) {
    db.products[productIndex] = { ...db.products[productIndex], ...req.body };
    writeDb(db);
    res.json(db.products[productIndex]);
  } else {
    res.status(404).json({ message: 'Producto no encontrado.' });
  }
});

app.delete('/api/menu/:id', (req, res) => {
  const db = readDb();
  const productId = parseInt(req.params.id, 10);
  const initialLength = db.products.length;
  db.products = db.products.filter(p => p.id !== productId);
  
  if (db.products.length < initialLength) {
    writeDb(db);
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Producto no encontrado.' });
  }
});


// --- ORDER ROUTES ---
app.get('/api/orders', (req, res) => {
  const { orders } = readDb();
  // Convert date strings back to Date objects for correct sorting
  const sortedOrders = orders
    .map(o => ({ ...o, createdAt: new Date(o.createdAt) }))
    .sort((a, b) => b.createdAt - a.createdAt);
  res.json(sortedOrders);
});

app.post('/api/orders', (req, res) => {
  const db = readDb();
  const { items, tableNumber, isTakeaway, customerName } = req.body;
  const { products } = db;
  
  // Recalculate totals on the server for security
  let subtotal = 0;
  const orderItems = items.map(item => {
    const product = products.find(p => p.id === item.product.id);
    if (!product) throw new Error('Invalid product in order');
    subtotal += product.price * item.quantity;
    return { ...item, product }; // Ensure full product data is stored
  });
  
  // Tax removed logic
  const total = subtotal;

  const newOrder = {
    id: (db.orders[0]?.id || 200) + Math.floor(Math.random() * 10) + 1,
    items: orderItems,
    subtotal,
    total,
    tableNumber: isTakeaway ? null : tableNumber,
    isTakeaway,
    customerName: isTakeaway ? customerName : undefined,
    status: 'Pendiente',
    createdAt: new Date().toISOString(),
  };

  db.orders.unshift(newOrder); // Add to the beginning of the array
  writeDb(db);
  res.status(201).json(newOrder);
});

app.put('/api/orders/:id/status', (req, res) => {
    const db = readDb();
    const orderId = parseInt(req.params.id, 10);
    const { status } = req.body;
    const orderIndex = db.orders.findIndex(o => o.id === orderId);

    if (orderIndex !== -1) {
        db.orders[orderIndex].status = status;
        writeDb(db);
        res.json(db.orders[orderIndex]);
    } else {
        res.status(404).json({ message: 'Orden no encontrada.' });
    }
});


// --- DASHBOARD ROUTES ---
app.get('/api/dashboard/stats', (req, res) => {
    const { orders } = readDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysOrders = orders.filter(o => new Date(o.createdAt) >= today);

    const stats = {
        totalSales: todaysOrders.reduce((sum, order) => sum + order.total, 0),
        pendingOrders: orders.filter(o => o.status === 'Pendiente').length,
        inPreparationOrders: orders.filter(o => o.status === 'En Preparación').length,
        readyOrders: orders.filter(o => o.status === 'Listo para servir').length,
    };
    res.json(stats);
});

app.get('/api/dashboard/analytics', (req, res) => {
    const { orders } = readDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysOrders = orders.filter(o => new Date(o.createdAt) >= today);

    // Sales by Hour
    const hourlySales = Array(24).fill(0).map((_, i) => ({ hour: i, sales: 0 }));
    todaysOrders.forEach(order => {
        const hour = new Date(order.createdAt).getHours();
        hourlySales[hour].sales += order.total;
    });
    
    // Order Status Distribution
    const statuses = ['Pendiente', 'En Preparación', 'Listo para servir'];
    const distribution = new Map(statuses.map(s => [s, 0]));
    orders
        .filter(o => statuses.includes(o.status))
        .forEach(o => distribution.set(o.status, (distribution.get(o.status) || 0) + 1));
    const orderStatusDistribution = Array.from(distribution.entries()).map(([status, count]) => ({ status, count }));

    // Top Selling Products
    const productCounts = new Map();
    todaysOrders.forEach(order => {
        order.items.forEach(item => {
            productCounts.set(item.product.name, (productCounts.get(item.product.name) || 0) + item.quantity);
        });
    });
    const topSellingProducts = Array.from(productCounts.entries())
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
        
    res.json({ salesByHour, orderStatusDistribution, topSellingProducts });
});


// Start server
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});