import { customAlphabet } from "nanoid";

const nanoid = customAlphabet(
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    6
)

export function generateSlug() : string {
    return nanoid();
}

export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}