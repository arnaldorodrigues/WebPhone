import connectDB from "@/lib/mongodb";
import { NextRequest } from "next/server";

export const Get = async(request: NextRequest) => {
  try {
    await connectDB();

    

  }  
}