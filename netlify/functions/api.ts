import express from 'express';
import serverless from 'serverless-http';
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { pgTable, serial, varchar, text, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Schema definitions inline
const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  plan: varchar("plan", { length: 50 }).notNull().default("starter"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  template_data: jsonb("template_data").notNull(),
  color_schemes: jsonb("color_schemes").notNull(),
  preview_url: varchar("preview_url", { length: 500 }),
  features: jsonb("features").notNull(),
  seo_optimized: boolean("seo_optimized").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

const sites = pgTable("sites", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  template_id: integer("template_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  subdomain: varchar("subdomain", { length: 100 }).notNull().unique(),
  custom_domain: varchar("custom_domain", { length: 255 }),
  site_data: jsonb("site_data").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  published_at: timestamp("published_at"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

// Schemas
const insertUserSchema = createInsertSchema(users);
const insertSiteSchema = createInsertSchema(sites);

// Database setup
let db: any;
if (process.env.DATABASE_URL) {
  const sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql);
}

// Basic template data
const basicTemplates = [
  {
    id: 1,
    name: "Professional Law Firm",
    description: "A sophisticated template for legal professionals and law firms",
    category: "legal",
    features: ["Contact Forms", "Service Pages", "Team Profiles", "Case Studies"],
    color_schemes: [{ primary: "#1e40af", secondary: "#64748b", accent: "#3b82f6" }],
    template_data: {
      hero: { title: "Your Legal Experts", subtitle: "Professional legal services you can trust" },
      services: ["Corporate Law", "Family Law", "Criminal Defense", "Real Estate"],
      contact: { phone: "(555) 123-4567", email: "info@lawfirm.com" }
    },
    seo_optimized: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    name: "Modern Restaurant",
    description: "A beautiful template for restaurants and food businesses",
    category: "restaurant",
    features: ["Menu Display", "Online Reservations", "Gallery", "Contact Info"],
    color_schemes: [{ primary: "#dc2626", secondary: "#451a03", accent: "#f59e0b" }],
    template_data: {
      hero: { title: "Delicious Dining Experience", subtitle: "Fresh ingredients, exceptional service" },
      menu: ["Appetizers", "Main Courses", "Desserts", "Beverages"],
      contact: { phone: "(555) 234-5678", email: "info@restaurant.com" }
    },
    seo_optimized: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    name: "Tech Startup",
    description: "A sleek template for technology companies and startups",
    category: "technology",
    features: ["Product Showcase", "Team Section", "Blog", "Investor Relations"],
    color_schemes: [{ primary: "#6366f1", secondary: "#1f2937", accent: "#10b981" }],
    template_data: {
      hero: { title: "Innovation Starts Here", subtitle: "Building the future with cutting-edge technology" },
      products: ["AI Solutions", "Cloud Services", "Mobile Apps", "Data Analytics"],
      contact: { phone: "(555) 345-6789", email: "hello@techstartup.com" }
    },
    seo_optimized: true,
    created_at: new Date(),
    updated_at: new Date()
  }
];

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.get("/api/templates", async (req, res) => {
  try {
    if (db) {
      const dbTemplates = await db.select().from(templates);
      if (dbTemplates.length > 0) {
        return res.json(dbTemplates);
      }
    }
    res.json(basicTemplates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.json(basicTemplates);
  }
});

app.get("/api/templates/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (db) {
      const [template] = await db.select().from(templates).where(eq(templates.id, id));
      if (template) {
        return res.json(template);
      }
    }
    
    const template = basicTemplates.find(t => t.id === id);
    if (template) {
      res.json(template);
    } else {
      res.status(404).json({ message: "Template not found" });
    }
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({ message: "Failed to fetch template" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, name, password } = insertUserSchema.parse(req.body);
    
    if (!db) {
      return res.status(500).json({ message: "Database not configured" });
    }
    
    const [existingUser] = await db.select().from(users).where(eq(users.email, email));
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [user] = await db
      .insert(users)
      .values({
        email,
        name,
        password: hashedPassword,
        plan: "starter"
      })
      .returning();

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Failed to register user" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!db) {
      return res.status(500).json({ message: "Database not configured" });
    }
    
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to login" });
  }
});

app.get("/api/sites/user/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (!db) {
      return res.json([]);
    }
    
    const userSites = await db.select().from(sites).where(eq(sites.user_id, userId));
    res.json(userSites);
  } catch (error) {
    console.error("Error fetching user sites:", error);
    res.status(500).json({ message: "Failed to fetch sites" });
  }
});

app.post("/api/sites", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ message: "Database not configured" });
    }
    
    const siteData = insertSiteSchema.parse(req.body);
    const [site] = await db.insert(sites).values(siteData).returning();
    res.status(201).json(site);
  } catch (error) {
    console.error("Error creating site:", error);
    res.status(500).json({ message: "Failed to create site" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    database: !!process.env.DATABASE_URL 
  });
});

export const handler = serverless(app);