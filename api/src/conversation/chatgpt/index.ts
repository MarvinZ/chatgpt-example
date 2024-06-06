import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { Message } from "../types";
import fetch from "node-fetch";

const openai = new OpenAI({
	apiKey: '' // process.env.OPENAI_API_KEY,
});

type StorageMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam & {
	sent: Date;
};
type ConversationStorageData = { persona: string; messages: StorageMessage[] };
const ConversationStorage: Record<string, ConversationStorageData> = {};

export class ChatGptConversationService {
	private newMessage = (
		message: OpenAI.Chat.Completions.ChatCompletionMessageParam
	) => ({ ...message, sent: new Date() });

	getConversationList = () => Promise.resolve(ConversationStorage);

	getConversation = (id: string) =>
		Promise.resolve(
			ConversationStorage[id]?.messages
				.filter((m) => m.role !== "system")
				.map<Message>((m) => ({
					text: String(m.content),
					sent: m.sent,
					source: m.role === "user" ? "user" : "bot",
				}))
		);

	startConversation = async (
		id: string,
		systemPersona: string,
		persona: string,
		message: string
	) => {
		const startConversationTime = new Date();
		const startMessages: ChatCompletionMessageParam[] = [
			{ role: "system", content: systemPersona },
			{ role: "user", content: message },
		];
		const response = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: startMessages,
		});
		ConversationStorage[id] = {
			persona: persona,
			messages: startMessages
				.map((m) => ({ ...m, sent: startConversationTime }))
				.concat({
					role: "assistant",
					sent: new Date(),
					content: response.choices[0].message.content,
				}),
		};
		
		// Ensure response content is not null
		if (response.choices[0].message.content) {
			this.handleApiResponse(response.choices[0].message.content);
		}
		
		return response.choices[0].message.content;
	};

	sendMessages = async (
		id: string,
		messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
	) => {
		ConversationStorage[id].messages.push(...messages.map(this.newMessage));
		const response = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: ConversationStorage[id].messages,
		});
		ConversationStorage[id].messages.push(
			this.newMessage(response.choices[0].message)
		);
		
		// Ensure response content is not null
		if (response.choices[0].message.content) {
			this.handleApiResponse(response.choices[0].message.content);
		}
		
		return response.choices[0].message.content;
	};

	deleteConversation = (id: string) => {
		if (id in ConversationStorage) {
			delete ConversationStorage[id];
			return Promise.resolve(true);
		}
		return Promise.resolve(false);
	};

	private handleApiResponse = (responseContent: string) => {
		const workOrderJson = this.createWorkOrderJson(responseContent);
		this.postWorkOrder(workOrderJson);
	}

	private createWorkOrderJson = (responseJson: any) => {
		// Extract values from the response JSON
		const location = responseJson.location;
		const issue = responseJson.issue;
		const contact = responseJson.contact;
	
		// Create the work order JSON structure
		return {
			"ObjectType": "WorkOrder",
			"EventType": "WorkOrderCreate",
			"ReturnResult": "true",
			"Payload": {
				"WorkOrderType": "Work Order",
				"ClientWorkOrderNumber": "MFWO10004",  // Static value for now
				"SupplierPurchaseOrderNumber": "",  // Empty value for now
				"ClientId": "DGC-HQ",
				"ProviderId": "YOU72644AR",
				"LocationNumber": "DGC-13920", // location.address,  // Assuming location number is derived from the address
				"ServiceLocationName": "Lobby",
				"Status": "Unscheduled",
				"SubStatus": "",
				"Caller": "Jan Jackson",
				"Priority": "ND10",
				"Trade": "MAJOR PLUMBING",
				"RequestType": "MAJOR PLUMBING",
				"RequestCode": "Plumbing Other",  // Assuming summary is used for the request code
				"ScheduledStartDatetime": "",  // Current date/time for now
				"TargetStartDate": "",  // Current date/time for now
				"TargetEndDate": "",  // Current date/time for now
				"Description": "TEST DESC MF",
				"DNE": "1000",  // Static value for now
				"CurrencyCode": "USD",
				"PriceList": "CBRE Default",
				"autoDispatch": "false",
				"autoAccept": "false"
			}
		};
	}
	

	private getToken = async (): Promise<string | null> => {
		const tokenUrl = 'https://api-test.cbre.com:443/token?grant_type=client_credentials';
		const response = await fetch(tokenUrl, {
			method: 'POST',
			headers: {
				'Authorization': 'Basic ' + Buffer.from('OdVrUAaAvETm9cuGVPJMSyrDuGga:OJ3Lj0IxXOAW5YOMCyAVjwNrRpYa').toString('base64'),
			},
		});
		
		if (response.ok) {
			const data = await response.json();
			return data.access_token;
		} else {
			console.error(`Failed to obtain token: ${response.status}`);
			return null;
		}
	}

	private postWorkOrder = async (workOrderJson: any) => {
		console.log("Posting work order:", workOrderJson);
		const token = await this.getToken();
		if (!token) {
			console.error("No token obtained. Cannot proceed with posting work order.");
			return;
		}
		
		const url = 'https://api-test.cbre.com:443/t/gws_us_fm/uat/workorder/v1/api/workorder';
		const headers = {
			'Authorization': `Bearer ${token}`,
			'Content-Type': 'application/json'
		};
		
		const response = await fetch(url, {
			method: 'POST',
			headers: headers,
			body: JSON.stringify(workOrderJson)
		});
		
		const responseBody = await response.text();
		
		if (response.ok) {
			if (typeof window !== 'undefined') {
				alert('Work order posted successfully!');
			} else {
				console.log('Work order posted successfully!');
			}
		} else {
			if (typeof window !== 'undefined') {
				alert(`Failed to post work order: ${response.status}`);
			} else {
				console.error(`Failed to post work order: ${response.status}`);
			}
		}
		
		console.log(`Status Code: ${response.status}`);
		console.log(`Response Content: ${responseBody}`);
	}
}
