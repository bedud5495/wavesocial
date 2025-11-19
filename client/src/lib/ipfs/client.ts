import { create } from 'ipfs-http-client';
import { IPFS_CONFIG } from '@/lib/web3/config';
import type { ProfileMetadata, PostContent } from '@shared/schema';

export class IPFSClient {
  private static instance: IPFSClient;
  private client: any;

  private constructor() {
    this.client = create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
    });
  }

  static getInstance(): IPFSClient {
    if (!IPFSClient.instance) {
      IPFSClient.instance = new IPFSClient();
    }
    return IPFSClient.instance;
  }

  async uploadJSON(data: any): Promise<string> {
    try {
      const json = JSON.stringify(data);
      const { cid } = await this.client.add(json);
      return cid.toString();
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw new Error('Failed to upload to IPFS');
    }
  }

  async uploadImage(file: File): Promise<string> {
    try {
      const buffer = await file.arrayBuffer();
      const { cid } = await this.client.add(buffer);
      return cid.toString();
    } catch (error) {
      console.error('IPFS image upload error:', error);
      throw new Error('Failed to upload image to IPFS');
    }
  }

  async fetchJSON<T>(ipfsHash: string): Promise<T | null> {
    try {
      const response = await fetch(`${IPFS_CONFIG.publicGateway}${ipfsHash}`);
      if (!response.ok) throw new Error('Failed to fetch from IPFS');
      return await response.json();
    } catch (error) {
      console.error('IPFS fetch error:', error);
      return null;
    }
  }

  getGatewayUrl(ipfsHash: string): string {
    if (IPFS_CONFIG.pinataJWT && IPFS_CONFIG.pinataGateway) {
      return `${IPFS_CONFIG.pinataGateway}${ipfsHash}`;
    }
    return `${IPFS_CONFIG.publicGateway}${ipfsHash}`;
  }
}

export const ipfsClient = IPFSClient.getInstance();

export async function uploadProfileMetadata(metadata: ProfileMetadata): Promise<string> {
  return ipfsClient.uploadJSON(metadata);
}

export async function uploadPostContent(content: PostContent): Promise<string> {
  return ipfsClient.uploadJSON(content);
}

export async function fetchProfileMetadata(ipfsHash: string): Promise<ProfileMetadata | null> {
  return ipfsClient.fetchJSON<ProfileMetadata>(ipfsHash);
}

export async function fetchPostContent(ipfsHash: string): Promise<PostContent | null> {
  return ipfsClient.fetchJSON<PostContent>(ipfsHash);
}
