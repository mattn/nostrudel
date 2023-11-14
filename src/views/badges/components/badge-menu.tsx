import { MenuItem, useDisclosure } from "@chakra-ui/react";
import { useCopyToClipboard } from "react-use";

import { NostrEvent } from "../../../types/nostr-event";
import { CustomMenuIconButton, MenuIconButtonProps } from "../../../components/menu-icon-button";
import useCurrentAccount from "../../../hooks/use-current-account";
import NoteDebugModal from "../../../components/debug-modals/note-debug-modal";
import { CodeIcon, ExternalLinkIcon, RepostIcon, TrashIcon } from "../../../components/icons";
import { getSharableEventAddress } from "../../../helpers/nip19";
import { buildAppSelectUrl } from "../../../helpers/nostr/apps";
import { useDeleteEventContext } from "../../../providers/delete-event-provider";

export default function BadgeMenu({ badge, ...props }: { badge: NostrEvent } & Omit<MenuIconButtonProps, "children">) {
  const account = useCurrentAccount();
  const infoModal = useDisclosure();

  const { deleteEvent } = useDeleteEventContext();

  const [_clipboardState, copyToClipboard] = useCopyToClipboard();

  const naddr = getSharableEventAddress(badge);

  return (
    <>
      <CustomMenuIconButton {...props}>
        {naddr && (
          <>
            <MenuItem onClick={() => window.open(buildAppSelectUrl(naddr), "_blank")} icon={<ExternalLinkIcon />}>
              View in app...
            </MenuItem>
            <MenuItem onClick={() => copyToClipboard("nostr:" + naddr)} icon={<RepostIcon />}>
              Copy Share Link
            </MenuItem>
          </>
        )}
        {account?.pubkey === badge.pubkey && (
          <MenuItem icon={<TrashIcon />} color="red.500" onClick={() => deleteEvent(badge)}>
            Delete Badge
          </MenuItem>
        )}
        <MenuItem onClick={infoModal.onOpen} icon={<CodeIcon />}>
          View Raw
        </MenuItem>
      </CustomMenuIconButton>

      {infoModal.isOpen && (
        <NoteDebugModal event={badge} isOpen={infoModal.isOpen} onClose={infoModal.onClose} size="6xl" />
      )}
    </>
  );
}
