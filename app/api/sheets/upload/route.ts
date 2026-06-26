import { NextResponse } from "next/server";
import { parseSheetBuffer } from "@/lib/parseSheet";
import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";
import SheetUpload from "@/models/SheetUpload";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { existsSync } from "fs";


export async function POST(request: Request) {
  try {

    await dbConnect();


    const formData = await request.formData();

    const file = formData.get("file") as File;



    if (!file) {
      return NextResponse.json(
        {
          error: "No file provided"
        },
        {
          status: 400
        }
      );
    }



    const uploadDir =
      process.env.UPLOAD_DIR || "./uploads";



    if (!existsSync(uploadDir)) {
      await mkdir(
        uploadDir,
        {
          recursive: true
        }
      );
    }



    // Original file buffer
    const buffer = Buffer.from(
      await file.arrayBuffer()
    );



    const uniqueFilename =
      `${crypto.randomUUID()}-${file.name}`;



    const filePath = path.join(
      uploadDir,
      uniqueFilename
    );



    // Save original file
    await writeFile(
      filePath,
      buffer
    );



    /**
     * Parse Excel/CSV
     * Encoding fix handled inside parseSheetBuffer()
     */
    const {
      parsedContacts,
      columns
    } = parseSheetBuffer(buffer);



    if (!parsedContacts.length) {
      return NextResponse.json(
        {
          error: "No data found in file"
        },
        {
          status: 400
        }
      );
    }




    const sheetUpload =
      await SheetUpload.create({

        originalFileName: file.name,

        storedFilePath: filePath,

        rowCount: parsedContacts.length,

        columns,

      });





    const contactsToInsert =
      parsedContacts.map((contact) => ({

        ...contact,

        sheetUploadId:
          sheetUpload._id,

      }));





    await Contact.insertMany(
      contactsToInsert,
      {
        ordered: false
      }
    );





    return NextResponse.json({

      success: true,

      count: parsedContacts.length,

    });




  } catch (error) {


    console.error(
      "Upload error:",
      error
    );



    return NextResponse.json(

      {
        error:
          "Failed to process upload"
      },

      {
        status: 500
      }

    );

  }
}