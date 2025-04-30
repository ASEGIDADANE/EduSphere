// models/AdminLog.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IAdminLog extends Document {
  adminId: mongoose.Types.ObjectId;
  action: string;
  targetUserId: mongoose.Types.ObjectId;
  timestamp: Date;
}

const AdminLogSchema = new Schema<IAdminLog>({
  adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  targetUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model<IAdminLog>('AdminLog', AdminLogSchema);
