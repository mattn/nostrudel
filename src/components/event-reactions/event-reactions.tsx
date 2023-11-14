import { useMemo } from "react";
import { Button, useDisclosure } from "@chakra-ui/react";

import { NostrEvent } from "../../types/nostr-event";
import useEventReactions from "../../hooks/use-event-reactions";
import { groupReactions } from "../../helpers/nostr/reactions";
import ReactionDetailsModal from "../reaction-details-modal";
import useCurrentAccount from "../../hooks/use-current-account";
import ReactionGroupButton from "./reaction-group-button";
import { useAddReaction } from "./common-hooks";

export default function EventReactionButtons({ event, max }: { event: NostrEvent; max?: number }) {
  const account = useCurrentAccount();
  const detailsModal = useDisclosure();
  const reactions = useEventReactions(event.id) ?? [];
  const grouped = useMemo(() => groupReactions(reactions), [reactions]);

  const addReaction = useAddReaction(event, grouped);

  if (grouped.length === 0) return null;

  const clamped = Array.from(grouped);
  if (max !== undefined) clamped.length = max;

  return (
    <>
      {clamped.map((group) => (
        <ReactionGroupButton
          key={group.emoji}
          emoji={group.emoji}
          url={group.url}
          count={group.pubkeys.length}
          onClick={() => addReaction(group.emoji, group.url)}
          colorScheme={account && group.pubkeys.includes(account?.pubkey) ? "primary" : undefined}
        />
      ))}
      <Button onClick={detailsModal.onOpen}>Show all</Button>
      {detailsModal.isOpen && <ReactionDetailsModal isOpen onClose={detailsModal.onClose} reactions={reactions} />}
    </>
  );
}
