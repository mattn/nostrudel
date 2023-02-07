import { Button, Flex, FormControl, FormLabel, Select, Spinner, Switch, useDisclosure } from "@chakra-ui/react";
import moment from "moment";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Note } from "../../components/note";
import { unique } from "../../helpers/array";
import { isNote } from "../../helpers/nostr-event";
import useSubject from "../../hooks/use-subject";
import { useTimelineLoader } from "../../hooks/use-timeline-loader";
import settings from "../../services/settings";

export const GlobalTab = () => {
  const defaultRelays = useSubject(settings.relays);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedRelay = searchParams.get("relay") ?? "";
  const setSelectedRelay = (url: string) => {
    if (url) {
      setSearchParams({ relay: url });
    } else setSearchParams({});
  };

  const availableRelays = unique([...defaultRelays, selectedRelay]).filter(Boolean);

  const { isOpen: showReplies, onToggle } = useDisclosure();
  const { events, loading, loadMore, loader } = useTimelineLoader(
    `global`,
    selectedRelay ? [selectedRelay] : availableRelays,
    { kinds: [1], since: moment().subtract(5, "minutes").unix() },
    { pageSize: moment.duration(5, "minutes").asSeconds() }
  );

  const timeline = showReplies ? events : events.filter(isNote);

  return (
    <Flex direction="column" gap="2">
      <Flex gap="2">
        <Select
          placeholder="All Relays"
          maxWidth="250"
          value={selectedRelay}
          onChange={(e) => {
            setSelectedRelay(e.target.value);
            loader.forgetEvents();
          }}
        >
          {availableRelays.map((url) => (
            <option key={url} value={url}>
              {url}
            </option>
          ))}
        </Select>
        <FormControl display="flex" alignItems="center">
          <Switch id="show-replies" isChecked={showReplies} onChange={onToggle} mr="2" />
          <FormLabel htmlFor="show-replies" mb="0">
            Show Replies
          </FormLabel>
        </FormControl>
      </Flex>
      {timeline.map((event) => (
        <Note key={event.id} event={event} />
      ))}
      {loading ? <Spinner ml="auto" mr="auto" mt="8" mb="8" /> : <Button onClick={() => loadMore()}>Load More</Button>}
    </Flex>
  );
};