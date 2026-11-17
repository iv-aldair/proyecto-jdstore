const corsOptions = {
  origin: true,  // Permite cualquier origen (seguro en red privada Tailscale)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
 
module.exports = corsOptions;