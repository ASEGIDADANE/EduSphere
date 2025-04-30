


import mongoose, { Document, Schema } from "mongoose";
import zod from "zod";

// Extend the IUser interface to include instructor request fields
interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "admin" | "student" | "instructor";
  provider?: "local" | "google";
  isInstructorRequest?: boolean;
  instructorStatus?: "pending" | "approved" | "rejected";
}

// Update the Mongoose schema to include instructor request fields
const userSchema: Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: function (this: any) {
        return this.provider === "local";
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
      default: "local",
    },
    isInstructorRequest: {
      type: Boolean,
      default: false,
    },
    instructorStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Zod validation schema for user creation
const userValidationSchema = zod.object({
  name: zod.string().min(1, "Name is required"),
  email: zod.string().email("Invalid email address"),
  password: zod.string().min(6, "Password must be at least 6 characters long").optional(),
  role: zod.enum(["admin", "student", "instructor"]).optional(),
  provider: zod.enum(["local", "google"]).optional(),
  isInstructorRequest: zod.boolean().optional(),
  instructorStatus: zod.enum(["pending", "approved", "rejected"]).optional(),
});

// Zod validation for login
const userLoginSchemaZod = zod.object({
  email: zod.string().email("Invalid email address"),
  password: zod.string().min(6, "Password must be at least 6 characters long"),
});

// Types
type IUserInput = zod.infer<typeof userValidationSchema>;
type IUserLoginInput = zod.infer<typeof userLoginSchemaZod>;

// Export model and schema
const User = mongoose.model<IUser>("User", userSchema);

export default User;
export { userValidationSchema, userLoginSchemaZod };
export type { IUser };
export { userSchema };
export type { IUserInput, IUserLoginInput };
