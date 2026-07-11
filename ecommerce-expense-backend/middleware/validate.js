const { z } = require("zod");

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const msg = result.error.errors.map((e) => e.message).join(", ");
    return res.status(400).json({ message: msg });
  }
  req.body = result.data;
  next();
};

const schemas = {
  register: z.object({
    name:     z.string().min(2, "Name must be at least 2 characters"),
    email:    z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
  login: z.object({
    email:    z.string().email("Invalid email"),
    password: z.string().min(1, "Password required"),
  }),
  adminLogin: z.object({
    email:           z.string().email("Invalid email"),
    password:        z.string().min(1, "Password required"),
    adminSecretKey:  z.string().min(1, "Admin secret key required"),
  }),
  product: z.object({
    name:        z.string().min(2, "Product name required"),
    category:    z.string().min(1, "Category required"),
    price:       z.coerce.number().positive("Price must be positive"),
    stock:       z.coerce.number().min(0, "Stock cannot be negative").optional(),
    rating:      z.coerce.number().min(1).max(5).optional(),
    description: z.string().min(5, "Description required"),
  }).passthrough(),
  coupon: z.object({
    code:     z.string().min(2, "Coupon code required").toUpperCase(),
    type:     z.enum(["percent", "flat"]),
    discount: z.coerce.number().positive("Discount must be positive"),
    minOrder: z.coerce.number().min(0).optional(),
    maxUses:  z.coerce.number().positive().optional().nullable(),
  }).passthrough(),
};

module.exports = { validate, schemas };
