import { BlobServiceClient } from '@azure/storage-blob';
import { StorageSharedKeyCredential } from '@azure/storage-blob';
import { List } from 'antd';


export default async (req, res) => {

    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_STORAGE_KEY;
    const containerName = process.env.AZURE_CONTAINER_NAME;
    if (!accountName) throw Error('Azure Storage accountName not found');
    if (!containerName) throw Error('Azure Storage containerName not found');
    if (!accountKey) throw Error('Azure Storage accountKey not found');
    
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      sharedKeyCredential
    );
    
    const containerClient = blobServiceClient.getContainerClient(containerName);

    //test containerClient is working 
    const containerProperties = await containerClient.getProperties();
    // console.log(containerProperties);

    const objects = [];
    for await (const blob of containerClient.listBlobsFlat()) {
      objects.push(blob.name);
    }

    // console.log( Object.values(objects));
    // console.log(typeof Object.values(objects));
    

    res.statusCode = 200;
    res.json({ objects: Object.values(objects) })
}
