"use client";

import { gql } from "@apollo/client/core";
import { apolloClient } from "@/app/providers/apolloClient";
import type { ReceiveOrderInput } from "@/app/_lib/order-types";

type ReceivedAssetDto = {
  id: string;
  assetCode: string;
  qrCode: string;
  assetName: string;
  serialNumber: string | null;
  conditionStatus: string;
  assetStatus: string;
  currentStorageId: string | null;
};

type ReceiveOrderItemPayloadDto = {
  receive: {
    id: string;
  };
  order: {
    id: string;
  };
  assets: ReceivedAssetDto[];
};

const receiveOrderItemMutation = gql`
  mutation ReceiveOrderItem(
    $orderId: ID!
    $catalogId: ID
    $itemCode: String!
    $quantityReceived: Int!
    $receivedAt: String
    $receivedCondition: String!
    $receivedNote: String
    $storageLocation: String
    $serialNumbers: [String!]
    $assetImageDataUrl: String
    $assetImageFileName: String
  ) {
    receiveOrderItem(
      orderId: $orderId
      catalogId: $catalogId
      itemCode: $itemCode
      quantityReceived: $quantityReceived
      receivedAt: $receivedAt
      receivedCondition: $receivedCondition
      receivedNote: $receivedNote
      storageLocation: $storageLocation
      serialNumbers: $serialNumbers
      assetImageDataUrl: $assetImageDataUrl
      assetImageFileName: $assetImageFileName
    ) {
      receive {
        id
      }
      order {
        id
      }
      assets {
        id
        assetCode
        qrCode
        assetName
        serialNumber
        conditionStatus
        assetStatus
        currentStorageId
      }
    }
  }
`;

export async function receiveOrderItemRequest(input: ReceiveOrderInput) {
  const { data } = await apolloClient.mutate<{
    receiveOrderItem: ReceiveOrderItemPayloadDto;
  }>({
    mutation: receiveOrderItemMutation,
    variables: {
      orderId: input.orderId,
      catalogId: input.catalogId || null,
      itemCode: input.itemCode,
      quantityReceived: input.quantityReceived,
      receivedAt: input.receivedAt,
      receivedCondition: input.receivedCondition,
      receivedNote: input.receivedNote,
      storageLocation: input.storageLocation,
      serialNumbers: input.serialNumbers,
      assetImageDataUrl: input.assetImageDataUrl ?? null,
      assetImageFileName: input.assetImageFileName ?? null,
    },
    fetchPolicy: "no-cache",
  });

  if (!data?.receiveOrderItem) {
    throw new Error("Failed to receive order item.");
  }

  return data.receiveOrderItem;
}
