import * as fs from "fs";
import * as path from "path";
import { Account, Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const VALID_MEDIA_EXTENSIONS = ["png", "jpg", "jpeg", "gltf"];

export const uploadCollectionAssets = async (
  collectionMediaPath: string,
  collectionMetadataJsonPath: string,
  account: Account,
  fundAmount: number,
  network: Network
): Promise<string> => {
  const aptosConfig = new AptosConfig({ network });
  const assetUploader = await AssetUploader.init(aptosConfig);
  const aptos = new Aptos(aptosConfig);
  const amount = await aptos.getAccountAPTAmount({
    accountAddress: account.accountAddress,
  });
  if (amount < fundAmount) {
    throw new Error("Account does not have enough funds.");
  }
  await assetUploader.fundNode({ account, amount: fundAmount });

  if (!isValidImageExtension(collectionMediaPath)) {
    throw new Error(
      `NFT media does not have a valid extension. It should be one of: ${VALID_MEDIA_EXTENSIONS.join(
        ", "
      )}.`
    );
  }

  // Upload collection media and update JSON
  const collectionMediaURI = await uploadAndRetrieveUri(
    assetUploader,
    account,
    collectionMediaPath
  );
  updateImageField(collectionMetadataJsonPath, collectionMediaURI);

  // Upload updated collection metadata JSON and get its URI
  const collectionMetadataJsonURI = await uploadAndRetrieveUri(
    assetUploader,
    account,
    collectionMetadataJsonPath
  );

  return collectionMetadataJsonURI;
};

export const uploadTokenAssets = async (
  tokenMediaFolderPath: string,
  tokenMetadataJsonFolderPath: string,
  account: Account,
  fundAmount: number,
  network: Network
): Promise<string> => {
  const aptosConfig = new AptosConfig({ network });
  const assetUploader = await AssetUploader.init(aptosConfig);
  const aptos = new Aptos(aptosConfig);
  const amount = await aptos.getAccountAPTAmount({
    accountAddress: account.accountAddress,
  });
  if (amount < fundAmount) {
    throw new Error("Account does not have enough funds.");
  }
  await assetUploader.fundNode({ account, amount: fundAmount });

  if (!isValidImageExtension(tokenMediaFolderPath)) {
    throw new Error(
      `NFT media does not have a valid extension. It should be one of: ${VALID_MEDIA_EXTENSIONS.join(
        ", "
      )}.`
    );
  }

  // Upload token media folder and update metadata JSONs with media URLs
  const tokenMediaFolderURI = await uploadAndRetrieveUri(
    assetUploader,
    account,
    tokenMediaFolderPath
  );
  updateURIsInFolder(
    tokenMetadataJsonFolderPath,
    tokenMediaFolderURI,
    getFileExtension(tokenMediaFolderPath)
  );

  // Upload the updated token metadata JSON folder and get its URI
  const tokenMetadataJsonFolderURI = await uploadAndRetrieveUri(
    assetUploader,
    account,
    tokenMetadataJsonFolderPath
  );

  return tokenMetadataJsonFolderURI;
};

export const uploadCollectionAndTokenAssets = async (
  collectionMediaPath: string,
  collectionMetadataJsonPath: string,
  tokenMediaFolderPath: string,
  tokenMetadataJsonFolderPath: string,
  account: Account,
  fundAmount: number,
  network: Network
): Promise<{
  collectionMetadataJsonURI: string;
  tokenMetadataJsonFolderURI: string;
}> => {
  const aptosConfig = new AptosConfig({ network });
  const assetUploader = await AssetUploader.init(aptosConfig);
  const aptos = new Aptos(aptosConfig);
  const amount = await aptos.getAccountAPTAmount({
    accountAddress: account.accountAddress,
  });
  if (amount < fundAmount) {
    throw new Error("Account does not enough fund.");
  }
  await assetUploader.fundNode({ account, amount: fundAmount });

  if (
    !isValidImageExtension(collectionMediaPath) ||
    !isValidImageExtension(tokenMediaFolderPath)
  ) {
    throw new Error(
      `NFT media does not have valid extension. It should be either ${VALID_MEDIA_EXTENSIONS.join(
        ", "
      )}.`
    );
  }

  // Upload collection media and update JSON
  const collectionMediaURI = await uploadAndRetrieveUri(
    assetUploader,
    account,
    collectionMediaPath
  );
  updateImageField(collectionMetadataJsonPath, collectionMediaURI);

  // Upload updated collection metadata JSON and get its URI
  const collectionMetadataJsonURI = await uploadAndRetrieveUri(
    assetUploader,
    account,
    collectionMetadataJsonPath
  );

  // Upload token media folder and update metadata JSONs with media URLs
  const tokenMediaFolderURI = await uploadAndRetrieveUri(
    assetUploader,
    account,
    tokenMediaFolderPath
  );
  updateURIsInFolder(
    tokenMetadataJsonFolderPath,
    tokenMediaFolderURI,
    getFileExtension(collectionMediaPath)
  );

  // Upload the updated token metadata json folder and get its URI
  const tokenMetadataJsonFolderURI = await uploadAndRetrieveUri(
    assetUploader,
    account,
    tokenMetadataJsonFolderPath
  );

  return { collectionMetadataJsonURI, tokenMetadataJsonFolderURI };
};

const uploadAndRetrieveUri = async (
  assetUploader: AssetUploader,
  account: Account,
  filePath: string
): Promise<string> => {
  const response = isDirectory(filePath)
    ? await assetUploader.uploadFolder({ account, folder: filePath })
    : await assetUploader.uploadFile({ account, file: filePath });
  return `https://arweave.net/${response!.id}`;
};

const updateImageField = (jsonFilePath: string, mediaUrl: string): void => {
  try {
    const metadataContent = fs.readFileSync(jsonFilePath, "utf8");
    const metadataJson = JSON.parse(metadataContent);

    if (!metadataJson.name || !metadataJson.description) {
      throw new Error(
        `The JSON file at ${jsonFilePath} does not have the required 'name' and/or 'description' fields.`
      );
    }

    metadataJson.uri = mediaUrl;
    fs.writeFileSync(jsonFilePath, JSON.stringify(metadataJson, null, 4));
  } catch (error) {
    throw new Error(
      `Failed to update image field in ${jsonFilePath}: ${
        error instanceof Error ? error.message : error
      }`
    );
  }
};

const updateURIsInFolder = (
  folderPath: string,
  mediaFolderUrl: string,
  extension: string
): void => {
  if (!isDirectory(folderPath)) {
    throw new Error(`${folderPath} is not a valid directory.`);
  }

  const files = fs.readdirSync(folderPath);
  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    if (filePath.endsWith(".json")) {
      const baseName = path.basename(file, ".json");

      const mediaUrl = `${mediaFolderUrl}/${baseName}.${extension}`;
      try {
        updateImageField(filePath, mediaUrl);
      } catch (error) {
        throw new Error(
          `Failed to update image URL in ${filePath}: ${
            error instanceof Error ? error.message : error
          }`
        );
      }
    } else {
      console.log(`No valid corresponding image file found for ${filePath}.`);
    }
  });
};

const isDirectory = (filePath: string): boolean => {
  return fs.statSync(filePath).isDirectory();
};

const isValidImageExtension = (filePath: string) => {
  if (isDirectory(filePath)) {
    const files = fs.readdirSync(filePath);
    return files.some((file) => {
      // Extract the file extension without the dot and convert to lowercase
      const extension = getFileExtension(file);
      return VALID_MEDIA_EXTENSIONS.includes(extension);
    });
  } else {
    const extension = getFileExtension(filePath);
    return VALID_MEDIA_EXTENSIONS.includes(extension);
  }
};

const getFileExtension = (filePath: string): string => {
  return path.extname(filePath).toLowerCase().substring(1);
};
