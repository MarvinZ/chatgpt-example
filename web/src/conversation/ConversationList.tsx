import { useMemo } from "react";
import { Conversation } from "./types";
import { PersonaContactIcon } from "../persona";
import { Persona } from "../persona/types";

type ConversationListProps = {
	conversations: Conversation[];
	personas: Persona[];
	onLoadConversation?: (converstion: Conversation) => void;
};
export const ConversationList = ({
	conversations,
	personas,
	onLoadConversation,
}: ConversationListProps) => {
	const conversationList = useMemo(() => {
		return conversations
			.map((c) => {
				const persona = personas.find((p) => p.id === c.persona);
				if (!persona) {
					return null;
				}
				return (
					<div
						id={c.id}
						className="conversation-list-entry"
						onClick={() => onLoadConversation?.(c)}
					>
						<PersonaContactIcon size={"sm"} persona={persona} />{" "}
						<div className="conversation-list-entry-text">
							{c.firstMessage.text}
						</div>
					</div>
				);
			})
			.filter((c) => c !== null) as JSX.Element[];
	}, [conversations, onLoadConversation, personas]);
	return (
		<div className="conversation-list">
			<h3>Request History</h3>
			{conversationList}
		</div>
	);
};
