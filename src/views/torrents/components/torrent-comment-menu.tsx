import { CustomMenuIconButton, MenuIconButtonProps } from "../../../components/menu-icon-button";
import OpenInAppMenuItem from "../../../components/common-menu-items/open-in-app";
import CopyShareLinkMenuItem from "../../../components/common-menu-items/copy-share-link";
import CopyEmbedCodeMenuItem from "../../../components/common-menu-items/copy-embed-code";
import MuteUserMenuItem from "../../../components/common-menu-items/mute-user";
import DeleteEventMenuItem from "../../../components/common-menu-items/delete-event";
import { NostrEvent } from "../../../types/nostr-event";
import DebugEventMenuItem from "../../../components/debug-modal/debug-event-menu-item";

export default function TorrentCommentMenu({
  comment,
  detailsClick,
  ...props
}: { comment: NostrEvent; detailsClick?: () => void } & Omit<MenuIconButtonProps, "children">) {
  return (
    <>
      <CustomMenuIconButton {...props}>
        <OpenInAppMenuItem event={comment} />
        <CopyShareLinkMenuItem event={comment} />
        <CopyEmbedCodeMenuItem event={comment} />
        <MuteUserMenuItem event={comment} />
        <DeleteEventMenuItem event={comment} />
        <DebugEventMenuItem event={comment} />
      </CustomMenuIconButton>
    </>
  );
}
