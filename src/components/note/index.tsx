import React, { useContext } from "react";
import { Link as RouterLink } from "react-router-dom";
import moment from "moment";
import { Box, Card, CardBody, CardFooter, CardHeader, Flex, Heading, IconButton, Link, Text } from "@chakra-ui/react";
import { NostrEvent } from "../../types/nostr-event";
import { UserAvatarLink } from "../user-avatar-link";
import { Bech32Prefix, normalizeToBech32 } from "../../helpers/nip-19";

import { NoteContents } from "./note-contents";
import { NoteMenu } from "./note-menu";
import identityService from "../../services/identity";
import { useUserContacts } from "../../hooks/use-user-contacts";
import { UserTipButton } from "../user-tip-button";
import { NoteRelays } from "./note-relays";
import { useIsMobile } from "../../hooks/use-is-mobile";
import { UserLink } from "../user-link";
import { ReplyIcon } from "../icons";
import { PostModalContext } from "../../providers/post-modal-provider";
import { buildReply } from "../../helpers/nostr-event";
import { UserDnsIdentityIcon } from "../user-dns-identity";
import { useReadonlyMode } from "../../hooks/use-readonly-mode";
import { convertTimestampToDate } from "../../helpers/date";
import useSubject from "../../hooks/use-subject";

export type NoteProps = {
  event: NostrEvent;
  maxHeight?: number;
};
export const Note = React.memo(({ event, maxHeight }: NoteProps) => {
  const isMobile = useIsMobile();
  const readonly = useReadonlyMode();
  const { openModal } = useContext(PostModalContext);

  const pubkey = useSubject(identityService.pubkey) ?? "";
  const contacts = useUserContacts(pubkey);
  const following = contacts?.contacts || [];

  const reply = () => openModal(buildReply(event));

  return (
    <Card variant="outline">
      <CardHeader padding="2">
        <Flex flex="1" gap="2" alignItems="center" wrap="wrap">
          <UserAvatarLink pubkey={event.pubkey} size={isMobile ? "xs" : "sm"} />

          <Heading size="sm" display="inline">
            <UserLink pubkey={event.pubkey} />
          </Heading>
          <UserDnsIdentityIcon pubkey={event.pubkey} onlyIcon />
          {!isMobile && <Flex grow={1} />}
          <Link as={RouterLink} to={`/n/${normalizeToBech32(event.id, Bech32Prefix.Note)}`} whiteSpace="nowrap">
            {moment(convertTimestampToDate(event.created_at)).fromNow()}
          </Link>
        </Flex>
      </CardHeader>
      <CardBody px="2" py="0">
        <NoteContents event={event} trusted={following.includes(event.pubkey)} maxHeight={maxHeight} />
      </CardBody>
      <CardFooter padding="2" display="flex" gap="2">
        <IconButton
          icon={<ReplyIcon />}
          title="Reply"
          aria-label="Reply"
          onClick={reply}
          size="xs"
          isDisabled={readonly}
        />
        <Box flexGrow={1} />
        <UserTipButton pubkey={event.pubkey} size="xs" />
        <NoteRelays event={event} size="xs" />
        <NoteMenu event={event} />
      </CardFooter>
    </Card>
  );
});
