import mongoose, { Document, Schema } from "mongoose";
import zod from "zod";

// Extend the IUser interface to include fields for local and OAuth users
interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Optional for OAuth users
  role: "admin" | "student" | "instructor";
  provider?: "local" | "google"; // Indicates the authentication provider
}

// Update the Mongoose schema to include fields for local and OAuth users
const userSchema: Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // Email must always be unique
    },
    password: {
      type: String,
      required: function (this: any) {
        return this.provider === "local"; // Password is required only for local users
      },
    },
    role: {
      type: String,
      enum: ["admin", "student", "instructor"],
      default: "student",
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local", // Default to local authentication
    },
  },
  {
    timestamps: true,
  }
);

// Define the Zod schema for user validation
const userValidationSchema = zod.object({
  name: zod.string().min(1, "Name is required"),
  email: zod.string().email("Invalid email address"),
  password: zod.string().min(6, "Password must be at least 6 characters long").optional(),
  role: zod.enum(["admin", "student", "instructor"]).optional(),
  provider: zod.enum(["local", "google"]).optional(),
});

const userLoginSchemaZod = zod.object({
  email: zod.string().email("Invalid email address"),
  password: zod.string().min(6, "Password must be at least 6 characters long"),
});


// Types
type IUserInput = zod.infer<typeof userValidationSchema>;
type IUserLoginInput = zod.infer<typeof userLoginSchemaZod>;

const User = mongoose.model<IUser>("User", userSchema);

export default User;
export { userValidationSchema, userLoginSchemaZod };
export type { IUser };
export { userSchema };
export type { IUserInput, IUserLoginInput };