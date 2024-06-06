import { WebIrys } from "@irys/sdk";

type Tag = {
  name: string;
  value: string;
};

const GATEWAY_BASE = (
  process.env.NEXT_PUBLIC_GATEWAY || "https://gateway.irys.xyz/"
).endsWith("/")
  ? process.env.NEXT_PUBLIC_GATEWAY || "https://gateway.irys.xyz/"
  : (process.env.NEXT_PUBLIC_GATEWAY || "https://gateway.irys.xyz/") + "/";

// Function Overloading
async function fundAndUpload(
  irys: WebIrys,
  file: File,
  tags: Tag[]
): Promise<string>;
async function fundAndUpload(
  irys: WebIrys,
  files: File[],
  tags: Tag[]
): Promise<string[]>;
async function fundAndUpload(
  irys: WebIrys,
  files: File | File[],
  tags: Tag[]
): Promise<string | string[]> {
  if (Array.isArray(files)) {
    return await fundAndUploadMultipleFiles(irys, files, tags);
  } else {
    return await fundAndUploadSingleFile(irys, files, tags);
  }
}

async function fundAndUploadMultipleFiles(
  irys: WebIrys,
  files: File[],
  tags: Tag[]
): Promise<string[]> {
  try {
    let size = 0;
    for (const file of files) {
      size += file.size;
    }
    const price = await irys.getPrice(size);
    const balance = await irys.getLoadedBalance();

    if (price.isGreaterThanOrEqualTo(balance)) {
      console.log("Funding node.");
      await irys.fund(price, 1.2);
    } else {
      console.log("Funding not needed, balance sufficient.");
    }

    const receipt = await irys.uploadFolder(files, {
      //@ts-ignore
      tags,
    });
    console.log("folder uploaded ", receipt);
    console.log(`Uploaded successfully. ${GATEWAY_BASE}${receipt.manifestId}`);

    return [receipt?.manifestId || "", receipt?.id || ""];
  } catch (e) {
    console.log("Error uploading single file ", e);
  }
  return ["", ""];
}

async function fundAndUploadSingleFile(
  irys: WebIrys,
  file: File,
  tags: Tag[]
): Promise<string> {
  console.log(irys);
  try {
    const price = await irys.getPrice(file?.size);
    const balance = await irys.getLoadedBalance();

    if (price.isGreaterThanOrEqualTo(balance)) {
      console.log("Funding node.");
      await irys.fund(price, 1.2);
    } else {
      console.log("Funding not needed, balance sufficient.");
    }

    const receipt = await irys.uploadFile(file, {
      tags,
    });
    console.log(`Uploaded successfully. ${GATEWAY_BASE}${receipt.id}`);

    return receipt.id;
  } catch (e) {
    console.log("Error uploading single file ", e);
  }
  return "";
}

export { fundAndUpload };
