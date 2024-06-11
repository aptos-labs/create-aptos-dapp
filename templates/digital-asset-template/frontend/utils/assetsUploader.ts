import { checkIfFund, uploadFolder } from "./Irys";

const VALID_MEDIA_EXTENSIONS = ["png", "jpg", "jpeg", "gltf"];
type CollectionMetadata = {
  name: string;
  description: string;
  image: string;
  external_url: string;
};
type ImageAttribute = {
  trait_type: string;
  value: string;
};
type ImageMetadata = {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: ImageAttribute[];
};

export const uploadCollectionData = async (
  aptosWallet: any,
  fileList: FileList,
  setCollectionName: React.Dispatch<React.SetStateAction<string | undefined>>,
  setCollectionDescription: React.Dispatch<
    React.SetStateAction<string | undefined>
  >,
  setProjectUri: React.Dispatch<React.SetStateAction<string | undefined>>,
  setUploadStatus: React.Dispatch<React.SetStateAction<string>>
) => {
  // Convert FileList type into a File[] type
  const files: File[] = [];
  for (let i = 0; i < fileList.length; i++) {
    files.push(fileList[i]);
  }

  let collectionFiles = files.filter((file) =>
    file.name.includes("collection")
  );
  if (collectionFiles.length !== 2) {
    alert(
      "Please make sure you include both collection.json and collection image file"
    );
    return;
  }

  // Check collection.json file exists
  const collectionMetadata = collectionFiles.find(
    (file) => file.name === "collection.json"
  );
  if (!collectionMetadata) {
    alert(
      "Collection metadata not found, please make sure you include collection.json file"
    );
    return;
  }

  const collectionCover = collectionFiles.find((file) =>
    VALID_MEDIA_EXTENSIONS.some((ext) => file.name.endsWith(`.${ext}`))
  );
  if (!collectionCover) {
    alert(
      "Collection cover not found, please make sure you include the collection image file"
    );
    return;
  }

  const mediaExt = collectionCover?.name.split(".").pop();

  if (!collectionCover) {
    alert(
      "Collection cover not found, please make sure you include the collection image file"
    );
    return;
  }

  // Check nft metadata json files exist
  const nftImageMetadatas = files.filter(
    (file) => file.name.endsWith("json") && file.name !== "collection.json"
  );

  if (nftImageMetadatas.length === 0) {
    alert(
      "Image metadata not found, please make sure you include the NFT json files"
    );
    return;
  }

  // Check NFT image files exist
  const imageFiles = files.filter(
    (file) =>
      file.name.endsWith(`.${mediaExt}`) && file.name !== collectionCover.name
  );

  if (imageFiles.length === 0) {
    alert(
      "Image files not found, please make sure you include the NFT image files"
    );
    return;
  }

  // Check nft metadata json files amount is the same as the nft image files
  if (nftImageMetadatas.length !== imageFiles.length) {
    alert("Mismatch between NFT metadata json files and images files");
    return;
  }

  // Calculate total files cost to upload to Irys
  const totalFileSize =
    collectionCover.size +
    collectionMetadata.size +
    imageFiles.reduce((acc, file) => acc + file.size, 0) +
    nftImageMetadatas.reduce((acc, file) => acc + file.size, 0);

  // Check total file size doesnt exceed 2GB due to a Browse constraints
  const GIGABYTE = Math.pow(1024, 3);
  const MAX_SIZE = 2 * GIGABYTE;
  if (totalFileSize > MAX_SIZE) {
    alert("Files size should not exceed 2GB");
    return;
  }

  // Check if need to first fund an Irys node
  const funded = await checkIfFund(aptosWallet, totalFileSize);

  if (funded) {
    // Upload collection thumbnail image and all NFT images as a folder
    const imageFolderReceipt = await uploadFolder(aptosWallet, [
      ...imageFiles,
      collectionCover,
    ]);

    // Update collection metadata with the cover image
    const parsedCollectionMetadata: CollectionMetadata = JSON.parse(
      await collectionMetadata.text()
    );
    setCollectionName(parsedCollectionMetadata.name);
    setCollectionDescription(parsedCollectionMetadata.description);
    parsedCollectionMetadata.image = `${imageFolderReceipt}/collection.${mediaExt}`;
    const updatedCollectionMetadata = new File(
      [JSON.stringify(parsedCollectionMetadata)],
      "collection.json",
      { type: collectionMetadata.type }
    );

    // Update each image metadata with the related image URL
    const updatedImageMetadatas = await Promise.all(
      nftImageMetadatas.map(async (file) => {
        const metadata: ImageMetadata = JSON.parse(await file.text());
        const imageUrl = `${imageFolderReceipt}/${file.name.replace(
          "json",
          `${mediaExt}`
        )}`;

        metadata.image = imageUrl;
        const fileMetadata = new File([JSON.stringify(metadata)], file.name, {
          type: file.type,
        });

        return fileMetadata;
      })
    );

    // Upload collection metadata and all NFTs' metadata as a folder
    const metadataFolderReceipt = await uploadFolder(aptosWallet, [
      ...updatedImageMetadatas,
      updatedCollectionMetadata,
    ]);
    setProjectUri(`${metadataFolderReceipt}/collection.json`);

    setUploadStatus("Files uploaded successfully");
  } else {
    alert(
      "Current account balance is not enough to fund a decentrelized asset node"
    );
  }
};
