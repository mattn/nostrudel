import {
  Button,
  ButtonGroup,
  ButtonProps,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  useDisclosure,
} from "@chakra-ui/react";

import { usePeopleListContext } from "../../providers/local/people-list-provider";
import useUserLists from "../../hooks/use-user-lists";
import useCurrentAccount from "../../hooks/use-current-account";
import { PEOPLE_LIST_KIND, getListName, getPubkeysFromList } from "../../helpers/nostr/lists";
import { getEventCoordinate, getEventUID } from "../../helpers/nostr/events";
import useFavoriteLists from "../../hooks/use-favorite-lists";
import { NostrEvent } from "../../types/nostr-event";
import { useCallback, useState } from "react";
import useUserContactList from "../../hooks/use-user-contact-list";
import { useUserSearchDirectoryContext } from "../../providers/global/user-directory-provider";
import { matchSorter } from "match-sorter";
import UserAvatar from "../user-avatar";
import UserName from "../user-name";

function ListCard({ list, ...props }: { list: NostrEvent } & Omit<ButtonProps, "children`">) {
  return (
    <Button justifyContent="flex-start" {...props}>
      {getListName(list)}
    </Button>
  );
}
function PersonCard({ pubkey, ...props }: { pubkey: string } & Omit<ButtonProps, "children`">) {
  return (
    <Button
      leftIcon={<UserAvatar pubkey={pubkey} size="sm" />}
      isTruncated
      justifyContent="flex-start"
      p="2"
      {...props}
    >
      <UserName pubkey={pubkey} />
    </Button>
  );
}

export default function PeopleListSelection({
  hideGlobalOption = false,
  ...props
}: {
  hideGlobalOption?: boolean;
} & Omit<ButtonProps, "children">) {
  const modal = useDisclosure();
  const account = useCurrentAccount();
  const lists = useUserLists(account?.pubkey);
  const { lists: favoriteLists } = useFavoriteLists();
  const { selected, setSelected, listEvent } = usePeopleListContext();

  const getSearchDirectory = useUserSearchDirectoryContext();
  const contacts = useUserContactList(account?.pubkey);
  const getSearchResults = useCallback(
    (search: string) => {
      const pubkeys = contacts ? getPubkeysFromList(contacts).map((p) => p.pubkey) : [];
      const filteredByContacts = getSearchDirectory().filter((p) => pubkeys.includes(p.pubkey));
      return matchSorter(filteredByContacts, search.trim(), { keys: ["names"] }).slice(0, 10);
    },
    [contacts, getSearchDirectory],
  );
  const [search, setSearch] = useState("");

  const selectList = useCallback(
    (list: NostrEvent) => {
      setSelected(getEventCoordinate(list));
      modal.onClose();
    },
    [setSelected, modal.onClose],
  );
  const selectPerson = useCallback(
    (pubkey: string) => {
      setSelected(`3:${pubkey}`);
      modal.onClose();
      setSearch("");
    },
    [setSelected, modal.onClose, setSearch],
  );

  return (
    <>
      <Button onClick={modal.onOpen} {...props}>
        {listEvent ? getListName(listEvent) : selected === "global" ? "Global" : "Loading..."}
      </Button>
      <Modal isOpen={modal.isOpen} onClose={modal.onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader p="4">Select List</ModalHeader>
          <ModalCloseButton />
          <ModalBody px="4" pb="4" pt="0" display="flex" flexDirection="column" gap="2">
            <ButtonGroup>
              {account && (
                <Button
                  onClick={() => {
                    setSelected("following");
                    modal.onClose();
                  }}
                >
                  Following
                </Button>
              )}
              {!hideGlobalOption && (
                <Button
                  onClick={() => {
                    setSelected("global");
                    modal.onClose();
                  }}
                >
                  Global
                </Button>
              )}
            </ButtonGroup>
            <Heading mt="2" size="md">
              Lists
            </Heading>
            <SimpleGrid columns={2} spacing="2">
              {lists
                .filter((l) => l.kind === PEOPLE_LIST_KIND)
                .map((list) => (
                  <ListCard key={getEventUID(list)} list={list} onClick={() => selectList(list)} />
                ))}
            </SimpleGrid>
            {favoriteLists.length > 0 && (
              <>
                <Heading mt="2" size="md">
                  Favorites
                </Heading>
                <SimpleGrid columns={2} spacing="2">
                  {favoriteLists.map((list) => (
                    <ListCard key={getEventUID(list)} list={list} onClick={() => selectList(list)} />
                  ))}
                </SimpleGrid>
              </>
            )}
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Contacts"
            />
            {search.length > 2 && (
              <SimpleGrid columns={2} spacing="2">
                {getSearchResults(search).map((person) => (
                  <PersonCard key={person.pubkey} pubkey={person.pubkey} onClick={() => selectPerson(person.pubkey)} />
                ))}
              </SimpleGrid>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
