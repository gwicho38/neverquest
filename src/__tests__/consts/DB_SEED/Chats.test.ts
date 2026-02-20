import { CHATS } from '../../../consts/DB_SEED/Chats';

describe('CHATS', () => {
	it('should export an array of chat configurations', () => {
		expect(Array.isArray(CHATS)).toBe(true);
		expect(CHATS.length).toBe(14);
	});

	it('should have all chats with valid structure', () => {
		CHATS.forEach((chat) => {
			expect(chat).toHaveProperty('id');
			expect(chat).toHaveProperty('chat');
			expect(typeof chat.id).toBe('number');
			expect(Array.isArray(chat.chat)).toBe(true);
		});
	});

	it('should have unique chat IDs', () => {
		const ids = CHATS.map((chat) => chat.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('should include all expected chat configurations', () => {
		const chatIds = CHATS.map((chat) => chat.id);
		expect(chatIds.length).toBe(14);
	});
});
