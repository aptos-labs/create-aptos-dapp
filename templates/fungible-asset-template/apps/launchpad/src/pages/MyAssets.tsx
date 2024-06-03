import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AptosConfig, Aptos, Network } from "@aptos-labs/ts-sdk";
import { useEffect, useState } from "react";

export function MyAssets() {
  const [fas, setFAs] = useState([]);

  useEffect(() => {
    const aptosConfig = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(aptosConfig);

    const fetch = async () => {
      const res = await aptos.view({
        payload: {
          function: `${import.meta.env.VITE_MODULE_ADDRESS}::fa_launchpad::get_registry`,
        },
      });
      console.log("res", res);
    };
    fetch();
  }, []);

  return (
    <Table>
      <TableCaption>A list of your fungible assets.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Symbol</TableHead>
          <TableHead>Asset Name</TableHead>
          <TableHead>FA address</TableHead>
          <TableHead>Max Supply</TableHead>
          <TableHead>Minted</TableHead>
          <TableHead>Decimal</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fas.length > 0 &&
          fas.map((fa: any) => {
            return (
              <TableRow>
                <TableCell className="font-medium">{fa.symbol}</TableCell>
                <TableCell>{fa.name}</TableCell>
                <TableCell>{fa.asset_type}</TableCell>
                <TableCell>{fa.maximum_v2}</TableCell>
                <TableCell>{fa.supply_v2}</TableCell>
                <TableCell>{fa.decimals}</TableCell>
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
}
