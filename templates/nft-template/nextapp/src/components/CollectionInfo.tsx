import { collectionClient, nftLaunchpadClient } from "@/utils/aptos";
import { onChainToHumanReadable } from "@/utils/math";
import {
  Heading,
  Box,
  Stack,
  StackDivider,
  Text,
  Link,
} from "@chakra-ui/react";

type Props = {
  collectionAddress: `0x${string}`;
};

export const CollectionInfo = async ({ collectionAddress }: Props) => {
  // const maxSupply = await nftLaunchpadClient.view
  //   .get_max_supply({
  //     typeArguments: [],
  //     functionArguments: [collectionAddress as `0x${string}`],
  //   })
  //   .then((res) => {
  //     return res[0] as string;
  //   });

  // const currentSupply = await nftLaunchpadClient.view
  //   .get_current_supply({
  //     typeArguments: [],
  //     functionArguments: [collectionAddress as `0x${string}`],
  //   })
  //   .then((res) => {
  //     return res[0] as string;
  //   });

  const name = await collectionClient.view
    .name({
      typeArguments: ["0x1::object::ObjectCore"],
      functionArguments: [collectionAddress],
    })
    .then((res) => {
      return res[0];
    });

  return (
    // metadata && (
    // maxSupply &&
    // currentSupply && (
    <Stack divider={<StackDivider />} spacing="4" textAlign="center">
      <Box>
        <Heading size="xs" textTransform="uppercase">
          Name
        </Heading>
        <Text pt="2" fontSize="sm">
          {name}
        </Text>
      </Box>
      {/* <Box>
        <Heading size="xs" textTransform="uppercase">
          Symbol
        </Heading>
        <Text pt="2" fontSize="sm">
          {metadata.symbol}
        </Text>
      </Box>
      <Box>
        <Heading size="xs" textTransform="uppercase">
          Decimals
        </Heading>
        <Text pt="2" fontSize="sm">
          {metadata.decimals}
        </Text>
      </Box> */}
      {/* <Box>
          <Heading size="xs" textTransform="uppercase">
            Max Supply
          </Heading>
          <Text pt="2" fontSize="sm"></Text>
          {onChainToHumanReadable(parseInt(maxSupply), metadata.decimals)}
        </Box>
        <Box>
          <Heading size="xs" textTransform="uppercase">
            Current Supply
          </Heading>
          <Text pt="2" fontSize="sm">
            {onChainToHumanReadable(parseInt(currentSupply), metadata.decimals)}
          </Text>
        </Box> */}
      <Box>
        <Heading size="xs" textTransform="uppercase">
          View on explorer
        </Heading>
        <Link
          target="_blank"
          href={`https://explorer.aptoslabs.com/object/${collectionAddress}?network=testnet`}
        >
          <Text pt="2" fontSize="sm">
            {collectionAddress}
          </Text>
        </Link>
      </Box>
    </Stack>
  );
};
