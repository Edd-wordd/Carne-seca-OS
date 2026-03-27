import { randomUUID } from 'crypto';

export function makeTextAbbrev(text, length = 3) {
    const cleaned = String(text ?? '')
        .trim()
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .toUpperCase();
    if (!cleaned) return 'GEN'.slice(0, length).padEnd(length, 'X');

    const words = cleaned.split(' ').filter(Boolean);
    if (words.length === 1) return words[0].slice(0, length).padEnd(length, 'X');

    return words
        .map((word) => word[0])
        .join('')
        .slice(0, length)
        .padEnd(length, 'X');
}

export function makeRandomId(length = 4) {
    return randomUUID().replace(/-/g, '').slice(0, length).toUpperCase();
}

export function generateSku(text, { prefix = 'CP', abbrevLength = 3, randomLength = 4 } = {}) {
    return `${prefix}-${makeTextAbbrev(text, abbrevLength)}-${makeRandomId(randomLength)}`;
}
