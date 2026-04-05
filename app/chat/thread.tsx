import MeshChatScreen from "@/components/screens/ChatScreen";
import { useLocalSearchParams } from "expo-router";

export default function ChatThreadPage() {
  const { selectedPeer } = useLocalSearchParams<{ selectedPeer?: string }>();

  const normalizedPeer =
    selectedPeer && selectedPeer !== "null" && selectedPeer !== "undefined"
      ? selectedPeer
      : null;

  return <MeshChatScreen initialSelectedPeer={normalizedPeer} />;
}
