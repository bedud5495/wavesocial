import { create } from 'ipfs-http-client';
import { IPFS_CONFIG } from '@/lib/web3/config';
import type { ProfileMetadata, PostContent } from '@shared/schema';

export class IPFSClient {
  private static instance: IPFSClient;
  private client: any;

  private constructor() {
    const apiUrl = IPFS_CONFIG.apiUrl;
    
    try {
      const url = new URL(apiUrl);
      this.client = create({
        url: apiUrl,
      });
    } catch (error) {
      console.error('Invalid IPFS API URL, using default:', error);
      this.client = create({
        url: 'https://ipfs.infura.io:5001',
      });
    }
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
      const gatewayUrl = IPFS_CONFIG.gatewayUrl.endsWith('/') 
        ? IPFS_CONFIG.gatewayUrl 
        : `${IPFS_CONFIG.gatewayUrl}/`;
      const response = await fetch(`${gatewayUrl}${ipfsHash}`);
      if (!response.ok) throw new Error('Failed to fetch from IPFS');
      return await response.json();
    } catch (error) {
      console.error('IPFS fetch error:', error);
      return null;
    }
  }

  getGatewayUrl(ipfsHash: string): string {
    const gatewayUrl = IPFS_CONFIG.gatewayUrl.endsWith('/') 
      ? IPFS_CONFIG.gatewayUrl 
      : `${IPFS_CONFIG.gatewayUrl}/`;
    return `${gatewayUrl}${ipfsHash}`;
  }
}

export const ipfsClient = IPFSClient.getInstance();

export async function uploadImage(file: File): Promise<string> {
  return ipfsClient.uploadImage(file);
}

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
