import * as xlsx from "xlsx";
import iconv from "iconv-lite";


const KNOWN_COLUMNS: Record<string, string> = {
  keyword: "keyword",
  name: "name",
  fulladdress: "fullAddress",
  streetaddress: "streetAddress",
  city: "city",
  zip: "zip",
  municipality: "municipality",
  country: "country",
  timezone: "timezone",
  phone1: "phone1",
  phonestandardformat: "phoneStandardFormat",
  phonefromwebsite: "phoneFromWebsite",
  email: "emailFromWebsite",
  emailfromwebsite: "emailFromWebsite",
  website: "website",
  domain: "domain",
  firstcategory: "firstCategory",
  secondcategory: "secondCategory",
  claimedgooglemybusiness: "claimedGoogleMyBusiness",
  businessstatus: "businessStatus",
  hours: "hours",
  imageurl: "imageUrl",
  facebookurl: "facebookUrl",
  linkedinurl: "linkedinUrl",
  twitterurl: "twitterUrl",
  instagramurl: "instagramUrl",
  youtubeurl: "youtubeUrl",
  metadescription: "metaDescription",
};



function fixMojibake(value: any) {

  if (typeof value !== "string") {
    return value;
  }


  // detect broken UTF-8 text
  if (
    value.includes("à") ||
    value.includes("¦") ||
    value.includes("Â")
  ) {

    try {

      return iconv.decode(
        Buffer.from(value, "latin1"),
        "utf8"
      );

    } catch {
      return value;
    }

  }


  return value;
}



export function parseSheetBuffer(buffer: Buffer) {


  /**
   * Try UTF-8 decode first
   * Fix Excel CSV Bengali encoding
   */
  let workbook;


  try {

    const utf8Buffer = Buffer.from(
      iconv.decode(buffer, "utf8"),
      "utf8"
    );


    workbook = xlsx.read(
      utf8Buffer,
      {
        type: "buffer",
        cellDates: true,
      }
    );


  } catch {


    workbook = xlsx.read(
      buffer,
      {
        type: "buffer",
        cellDates: true,
      }
    );

  }



  const firstSheetName = workbook.SheetNames[0];

  const worksheet = workbook.Sheets[firstSheetName];


  const rows: any[] = xlsx.utils.sheet_to_json(
    worksheet,
    {
      defval: "",
      raw: false,
    }
  );



  const parsedContacts: any[] = [];

  let columns: string[] = [];



  if (rows.length > 0) {
    columns = Object.keys(rows[0]);
  }



  for (const row of rows) {


    const contactData: any = {
      extraFields: {},
    };



    for (const [key, value] of Object.entries(row)) {


      if (value === "") continue;



      const fixedValue = fixMojibake(value);



      const normalizedKey = key
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, "");



      if (KNOWN_COLUMNS[normalizedKey]) {


        contactData[
          KNOWN_COLUMNS[normalizedKey]
        ] = fixedValue;


      } else {


        contactData.extraFields[
          key.trim()
        ] = fixedValue;


      }

    }


    parsedContacts.push(contactData);

  }



  return {
    parsedContacts,
    columns,
  };

}