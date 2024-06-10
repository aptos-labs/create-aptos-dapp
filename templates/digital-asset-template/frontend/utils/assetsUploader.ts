import { checkIfFund, uploadFile, uploadFolder } from "./Irys";

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

  // Check collection.json file exists
  const collectionMetadata = files.find(
    (file) => file.name === "collection.json"
  );
  if (!collectionMetadata) {
    alert(
      "Collection metadata not found, please make sure you include collection.json file"
    );
    return;
  }

  // check collection thumbnail image exists
  let mediaExt: string;
  const collectionCover = files.find((file) =>
    VALID_MEDIA_EXTENSIONS.some((ext) => {
      if (file.name.endsWith(`collection.${ext}`)) {
        mediaExt = ext;
        return true;
      } else {
        return false;
      }
    })
  );

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
    // upload collection thumbnail image
    const collectionCoverReceipt = await uploadFile(
      aptosWallet,
      collectionCover
    );

    // update collection metadata with the cover image and upload
    const parsedCollectionMetadata: CollectionMetadata = JSON.parse(
      await collectionMetadata.text()
    );
    setCollectionName(parsedCollectionMetadata.name);
    setCollectionDescription(parsedCollectionMetadata.description);
    parsedCollectionMetadata.image = collectionCoverReceipt;
    const updatedCollectionMetadata = new File(
      [JSON.stringify(parsedCollectionMetadata)],
      "collection.json",
      { type: collectionMetadata.type }
    );
    const collectionMetadataReceipt = await uploadFile(
      aptosWallet,
      updatedCollectionMetadata
    );

    setProjectUri(collectionMetadataReceipt);

    // upload all NFT images as a folder
    const imagesReceipt = await uploadFolder(aptosWallet, imageFiles);

    // update each image metadata with the related image URL and upload
    const updatedImageMetadatas = await Promise.all(
      nftImageMetadatas.map(async (file) => {
        const metadata: ImageMetadata = JSON.parse(await file.text());
        const imageUrl = `${imagesReceipt}/collection/images/${file.name.replace(
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
    await uploadFolder(aptosWallet, updatedImageMetadatas);

    setUploadStatus("Files uploaded successfully");
  } else {
    alert(
      "Current account balance is not enough to fund a decentrelized asset node"
    );
  }
};
