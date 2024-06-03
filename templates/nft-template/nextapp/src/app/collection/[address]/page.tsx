import { CollectionInfo } from "@/components/CollectionInfo";
import { MintNft } from "@/components/MintNft";
import { Box, Card, CardBody, CardFooter, CardHeader } from "@chakra-ui/react";

type Props = {
  params: { address: `0x${string}` };
};

export default async function Page({ params: { address } }: Props) {
  return (
    <Card>
      <CardHeader>
        <Box textAlign="center" fontSize="xl">
          User Created Collection
        </Box>
      </CardHeader>
      <CardBody>
        <CollectionInfo collectionAddress={address} />
      </CardBody>
      <CardFooter justifyContent="center">
        <MintNft collectionAddress={address} />
      </CardFooter>
    </Card>
  );
}
