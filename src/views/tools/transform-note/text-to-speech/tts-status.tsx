import { MouseEventHandler, useState } from "react";
import { Button, Flex, Spacer, Text, useToast } from "@chakra-ui/react";

import { NostrEvent } from "../../../../types/nostr-event";
import UserAvatarLink from "../../../../components/user-avatar-link";
import UserLink from "../../../../components/user-link";
import { LightningIcon } from "../../../../components/icons";
import { readablizeSats } from "../../../../helpers/bolt11";

export default function TextToSpeechStatus({ status }: { status: NostrEvent }) {
  const toast = useToast();

  const amountTag = status.tags.find((t) => t[0] === "amount" && t[1] && t[2]);
  const amountMsat = amountTag?.[1] && parseInt(amountTag[1]);
  const invoice = amountTag?.[2];

  const [paid, setPaid] = useState(false);
  const [paying, setPaying] = useState(false);
  const payInvoice: MouseEventHandler = async (e) => {
    try {
      if (window.webln && invoice) {
        setPaying(true);
        e.stopPropagation();
        await window.webln.sendPayment(invoice);
        setPaid(true);
      }
    } catch (e) {
      if (e instanceof Error) toast({ status: "error", description: e.message });
    }
    setPaying(false);
  };

  return (
    <>
      <Flex gap="2" alignItems="center" grow={1}>
        <UserAvatarLink pubkey={status.pubkey} size="sm" />
        <UserLink pubkey={status.pubkey} fontWeight="bold" />
        <Text>Offered</Text>
        <Spacer />

        {invoice && amountMsat && (
          <Button
            colorScheme="yellow"
            size="sm"
            variant="solid"
            leftIcon={<LightningIcon />}
            onClick={payInvoice}
            isLoading={paying || paid}
            isDisabled={!window.webln}
          >
            Pay {readablizeSats(amountMsat / 1000)} sats
          </Button>
        )}
      </Flex>
      <Text>{status.content}</Text>
    </>
  );
}
