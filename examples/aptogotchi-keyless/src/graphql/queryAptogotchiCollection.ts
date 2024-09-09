export const queryAptogotchiCollection = `
query AptogotchiCollectionQuery($collection_id: String) {
  current_collections_v2(
    where: { collection_id: { _eq: $collection_id } }
  ) {
    collection_id
    collection_name
    current_supply
  }
  current_collection_ownership_v2_view(
    where: { collection_id: { _eq: $collection_id } }
    order_by: {last_transaction_version: desc}
  ) {
    owner_address
  }
}
`;
