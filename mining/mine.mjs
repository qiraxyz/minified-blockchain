import CryptoJS from 'crypto-js';
import { createClient } from '@supabase/supabase-js';
import { UUIDMAKER } from './controller/token.mjs';
import { supabase } from './centralized/supabase.mjs';
import { HASHUUIDIDENTIFY } from './currency/handling.mjs';
import { Block } from './currency/Block.mjs';

class Blockchain {
    constructor(difficulty) {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = difficulty;
        this.pendingTransactions = [];
        this.miningReward = 100;
        this.minedBlocks = 0;
    }

    createGenesisBlock() {
        return new Block(0, '0', '0', this.difficulty, 0);
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
        this.minedBlocks++;
    }

    mineBlock(minerAddress) {
        const newBlock = this.generateNextBlock(minerAddress);
        this.addBlock(newBlock);
        this.pendingTransactions = [];
        return newBlock;
    }

    generateNextBlock(minerAddress) {
        const latestBlock = this.getLatestBlock();
        const nextIndex = latestBlock.index + 1;
        const transactions = this.pendingTransactions;
        const nextData = `${nextIndex}${transactions}${minerAddress}`;
        const newBlock = this.findBlock(nextIndex, nextData, latestBlock.hash);
        return newBlock;
    }

    findBlock(index, data, previousHash) {
        let nonce = 0;
        while (true) {
            const newBlock = new Block(index, data, previousHash, this.difficulty, nonce);
            if (this.isValidBlock(newBlock)) {
                return newBlock;
            }
            nonce++;
        }
    }

    isValidBlock(newBlock) {
        const blockHash = newBlock.calculateHash();
        const difficultyTarget = '0'.repeat(this.difficulty);
        return blockHash.startsWith(difficultyTarget);
    }
}

// Inisialisasi blockchain
const difficulty = 2;
const myBlockchain = new Blockchain(difficulty);

// Simulasi penambangan blok
const chiper = CryptoJS.SHA1(HASHUUIDIDENTIFY(16)).toString();
const GenerateChiper = CryptoJS.SHA256(UUIDMAKER(8)).toString();
const minerAddress = `${chiper}${GenerateChiper}`;

export async function initialCore() {
    const { data: userData, error: userError } = await supabase
      .from('user')
      .insert({ user_chip: chiper, user_token: GenerateChiper });
  
    if (userError) {
      console.error('Error inserting user data:', userError);
      return;
    }
  
    console.log('Start Mining with SHA256 Algorithm');
  
    for (let i = 0; i < 5; i++) {
      console.log(`\nMining block ${myBlockchain.minedBlocks + 1}...`);
      const newBlock = myBlockchain.mineBlock(minerAddress);
      const blockData = {
        PrevBlock: newBlock.previousHash,
        LatestBlock: newBlock.hash,
        isMined: true,
        depth_block: `${newBlock.nonce}, ${newBlock.difficulty}`,
        Reward_block: myBlockchain.miningReward,
        data_identifier: newBlock.data,
      };
  
      const { data: blockLogData, error: blockLogError } = await supabase
        .from('genesis_block_log')
        .insert(blockData);
  
      if (blockLogError) {
        console.error('Error inserting block log data:', blockLogError);
        return;
      }
  
      console.log('Block log data:', blockData);
      console.log(`Total blocks mined: ${myBlockchain.minedBlocks}`);
    }
  }
  