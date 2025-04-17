import mongoose ,{ Document, Schema } from "mongoose";

import zod from "zod";

interface ICourse extends Document {
    title: string;
    description: string;
    category: string;
    instructor: Schema.Types.ObjectId;
    price: number;
    studentEnrolled: Schema.Types.ObjectId[];
    rate: number;
    deleted?: boolean;
}



const courseSchema: Schema = new mongoose.Schema(
  {
    title:{
        type:String,
        required:[true,"Title is required"]
    },
    description:{
        type:String,
        minlength:[10,"Description must be at least 10 characters"],
        maxlength:[100,"Description must be at most 500 characters"],
        required:[true,"Description is required"]
    },
    category:{
        type:String,
        required:[true,"Category is required"]
    },
    instructor:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:[true,"Instructor is required"]
    },
    price:{
        type:Number,
        min:[0,"Price must be positive"],
        required: function (this: { price: number }) {
            return this.price > 0;
        }
    },
    studentEnrolled:{
        type:[Schema.Types.ObjectId],
        ref:"User",
        default:[]
    },
    rate:{
        type:Number,
        min:[0,"Rate must be positive"],
        max:[5,"Rate must be less than or equal to 5"],
        default:0
    },
    deleted: {
        type: Boolean,
        default: false
      },
}
,{timestamps:true}
);

const courseValidationSchema = zod.object({
    title:zod.string().min(1,"Title is required"),
    description:zod.string().min(1,"Description is required"),
    category:zod.string().min(1,"category is required"),
    instructor:zod.string().min(1,"Instructor is required"),
    price:zod.number().min(0,"Price must be positive"),
    studentEnrolled:zod.array(zod.string()).optional(),
    rate:zod.number().optional(),
});
const courseModel = mongoose.model<ICourse>("Course",courseSchema);
export {courseModel,courseValidationSchema};
export type {ICourse};
export default courseModel;
