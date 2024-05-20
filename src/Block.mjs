import CryptoJS from 'crypto-js';

export class Block {
    constructor(index, data, previousHash, difficulty, nonce) {
        this.index = index;
        this.data = data;
        this.previousHash = previousHash;
        this.timestamp = Date.now();
        this.difficulty = difficulty;
        this.nonce = nonce;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        const blockData = `${this.index}${this.data}${this.previousHash}${this.timestamp}${this.difficulty}${this.nonce}`;
        return CryptoJS.SHA256(blockData).toString();
    }
}