import { nftLaunchpadClient } from "@/utils/aptos";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Link,
  Box,
  VStack,
} from "@chakra-ui/react";

export const Registry = async () => {
  const registry = await nftLaunchpadClient.view
    .get_registry({
      typeArguments: [],
      functionArguments: [],
    })
    .then((res) => {
      const faObjects = res[0] as { inner: string }[];
      return faObjects.map((faObject) => faObject.inner);
    });

  return registry ? (
    <TableContainer>
      <Table variant="simple">
        <TableCaption>
          <VStack>
            <Box>Discover all NFT collections created by the launchpad. </Box>
            <Link
              href="https://learn.aptoslabs.com/example/ERC-721-token-standard"
              target="_blank"
              color="blue.500"
            >
              Learn more about the Digital Asset Standard
            </Link>
          </VStack>
        </TableCaption>
        <Thead>
          <Tr>
            <Th textAlign="center">Collection Address</Th>
          </Tr>
        </Thead>
        <Tbody>
          {registry.map((collectionAddress) => {
            return (
              <Tr key={collectionAddress}>
                <Td textAlign="center">
                  <Link href={`/collection/${collectionAddress}`}>
                    {collectionAddress}
                  </Link>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  ) : (
    <></>
  );
};
