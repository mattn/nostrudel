import { useMemo, useState } from "react";
import {
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Td,
  Tr,
  Th,
  Flex,
} from "@chakra-ui/react";
import relayPoolService from "../services/relay-pool";
import { useInterval } from "react-use";
import { RelayStatus } from "./relay-status";
import { useIsMobile } from "../hooks/use-is-mobile";
import { RelayIcon } from "./icons";
import { Relay } from "../classes/relay";
import { RelayFavicon } from "./relay-favicon";
import relayScoreboardService from "../services/relay-scoreboard";

export const ConnectedRelays = () => {
  const isMobile = useIsMobile();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [relays, setRelays] = useState<Relay[]>(relayPoolService.getRelays());
  const sortedRelays = useMemo(() => relayScoreboardService.getRankedRelays(relays.map((r) => r.url)), [relays]);

  useInterval(() => {
    setRelays(relayPoolService.getRelays());
  }, 1000);

  const connected = relays.filter((relay) => relay.okay);

  return (
    <>
      <Button variant="link" onClick={onOpen} leftIcon={<RelayIcon />}>
        {isMobile ? (
          <span>
            {connected.length}/{relays.length}
          </span>
        ) : (
          <span>
            {connected.length}/{relays.length} of relays connected
          </span>
        )}
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size="5xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader pb="0">Connected Relays</ModalHeader>
          <ModalCloseButton />
          <ModalBody p="2">
            <TableContainer>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Relay</Th>
                    <Th isNumeric>Claims</Th>
                    <Th isNumeric>Avg Response</Th>
                    <Th isNumeric>Disconnects</Th>
                    <Th isNumeric>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {sortedRelays.map((url) => (
                    <Tr key={url}>
                      <Td>
                        <Flex alignItems="center" maxW="sm" overflow="hidden">
                          <RelayFavicon size="xs" relay={url} mr="2" />
                          <Text>{url}</Text>
                        </Flex>
                      </Td>
                      <Td isNumeric>{relayPoolService.getRelayClaims(url).size}</Td>
                      <Td isNumeric>{relayScoreboardService.getAverageResponseTime(url).toFixed(2)}ms</Td>
                      <Td isNumeric>{relayScoreboardService.getDisconnects(url)}</Td>
                      <Td isNumeric>
                        <RelayStatus url={url} />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
