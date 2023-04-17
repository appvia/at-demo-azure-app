import { BlobServiceClient } from '@azure/storage-blob';
import { StorageSharedKeyCredential } from '@azure/storage-blob';

export default async ({ method, query: { name } }, res) => {
  
  
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



  try {
    if (method === 'PUT') {
      const content = "Hello world!";
      // const name = "newblob" + new Date().getTime();
      const blockBlobClient = containerClient.getBlockBlobClient(name);
      const uploadBlobResponse = await blockBlobClient.upload(content, content.length);
      console.log(`Upload block blob ${name} successfully`, uploadBlobResponse.requestId);


    } else if (method === 'DELETE') {
      console.log(`deleted blob ${name}`);
      // include: Delete the base blob and all of its snapshots.
      // only: Delete only the blob's snapshots and not the blob itself.
      const options = {
        deleteSnapshots: 'include' // or 'only'
      }
      const blockBlobClient = await containerClient.getBlockBlobClient(name);
      await blockBlobClient.delete(options);
      //test if blob is deleted
      const blobExists = await blockBlobClient.exists();
      console.log(`Blob ${name} exists: ${blobExists}`);    
    }
    res.statusCode = 200;
    res.json({ success: true });
  } catch (err) {
    res.statusCode = 500;
    res.json({ success: false });
  }
}
