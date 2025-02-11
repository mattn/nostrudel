import { useMemo } from "react";

import { useReadRelays } from "./use-client-relays";
import replaceableEventLoaderService, { RequestOptions } from "../services/replaceable-event-requester";
import { CustomAddressPointer, parseCoordinate } from "../helpers/nostr/events";
import useSubject from "./use-subject";

export default function useReplaceableEvent(
  cord: string | CustomAddressPointer | undefined,
  additionalRelays?: Iterable<string>,
  opts: RequestOptions = {},
) {
  const readRelays = useReadRelays(additionalRelays);
  const sub = useMemo(() => {
    const parsed = typeof cord === "string" ? parseCoordinate(cord) : cord;
    if (!parsed) return;
    return replaceableEventLoaderService.requestEvent(
      parsed.relays ? [...readRelays, ...parsed.relays] : readRelays,
      parsed.kind,
      parsed.pubkey,
      parsed.identifier,
      opts,
    );
  }, [cord, readRelays.urls.join("|"), opts?.alwaysRequest, opts?.ignoreCache]);

  return useSubject(sub);
}
