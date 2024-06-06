import { Conversation, Message } from "./conversation/types";
import { Persona } from "./persona/types";

export const getPersonas: () => Promise<Persona[]> = () => {
	return fetch("http://localhost:3000/persona", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	}).then((response) => {
		if (!response.ok) {
			throw new Error("Failed to fetch personas");
		}
		return response.json();
	});
};

export const getConversationList: () => Promise<Conversation[]> = () => {
	return fetch(`http://localhost:3000/conversation`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	}).then((response) => {
		if (!response.ok) {
			throw new Error("Failed to fetch messages");
		}
		return response.json();
	});
};

export const getMessages: (id: string) => Promise<Message[]> = (id) => {
	return fetch(`http://localhost:3000/conversation/${id}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	}).then((response) => {
		if (!response.ok) {
			throw new Error("Failed to fetch messages");
		}
		return response.json();
	});
};
export const startConversation: (
	id: string,
	persona: string,
	message: string
) => Promise<Message[]> = (id, persona, message) => {
	return fetch(`http://localhost:3000/conversation/${id}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ persona, message }),
	}).then((response) => {
		if (!response.ok) {
			throw new Error("Failed to fetch messages");
		}
		return response.json();
	});
};

export const sendMessage: (
	id: string,
	message: string
) => Promise<Message[]> = (id, message) => {
	return fetch(`http://localhost:3000/conversation/${id}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ message }),
	}).then((response) => {
		if (!response.ok) {
			throw new Error("Failed to fetch messages");
		}
		return response.json();
	});
};
