import db from "./db";
import { kinds } from "nostr-tools";
import _throttle from "lodash.throttle";

import { Kind0ParsedContent, getSearchNames, parseKind0Event } from "../helpers/user-metadata";
import SuperMap from "../classes/super-map";
import Subject from "../classes/subject";
import replaceableEventLoaderService, { RequestOptions } from "./replaceable-event-requester";

const WRITE_USER_SEARCH_BATCH_TIME = 500;

class UserMetadataService {
  private metadata = new SuperMap<string, Subject<Kind0ParsedContent>>((pubkey) => {
    const sub = new Subject<Kind0ParsedContent>();
    sub.subscribe((metadata) => {
      if (metadata) {
        this.writeSearchQueue.add(pubkey);
        this.writeSearchDataThrottle();
      }
    });
    return sub;
  });
  getSubject(pubkey: string) {
    return this.metadata.get(pubkey);
  }
  requestMetadata(pubkey: string, relays: Iterable<string>, opts: RequestOptions = {}) {
    const sub = this.metadata.get(pubkey);
    const requestSub = replaceableEventLoaderService.requestEvent(relays, kinds.Metadata, pubkey, undefined, opts);
    sub.connectWithHandler(requestSub, (event, next) => next(parseKind0Event(event)));
    return sub;
  }

  private writeSearchQueue = new Set<string>();
  private writeSearchDataThrottle = _throttle(this.writeSearchData.bind(this), WRITE_USER_SEARCH_BATCH_TIME);
  private async writeSearchData() {
    if (this.writeSearchQueue.size === 0) return;

    const keys = Array.from(this.writeSearchQueue);
    this.writeSearchQueue.clear();

    const transaction = db.transaction("userSearch", "readwrite");
    for (const pubkey of keys) {
      const metadata = this.getSubject(pubkey).value;
      if (metadata) {
        const names = getSearchNames(metadata);
        transaction.objectStore("userSearch").put({ pubkey, names });
      }
    }
    transaction.commit();
    await transaction.done;
  }
}

const userMetadataService = new UserMetadataService();

if (import.meta.env.DEV) {
  // @ts-ignore
  window.userMetadataService = userMetadataService;
}

// random helper for logging
export function nameOrPubkey(pubkey: string) {
  const parsed = userMetadataService.getSubject(pubkey).value;
  return parsed?.displayName || parsed?.display_name || parsed?.name || pubkey;
}

export default userMetadataService;
