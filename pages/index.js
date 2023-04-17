import Head from 'next/head';
import { BlobServiceClient } from '@azure/storage-blob';
import { StorageSharedKeyCredential } from '@azure/storage-blob';
import { Button, Input, Card, Icon } from 'antd';
import React, { useState, useEffect } from 'react';

export async function getServerSideProps() {
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

  return {
    props: {
      initFiles: objects,
      envDetails: {
        accountName: "atestt56789037" || "unset - run container with accountName",
        accountKey: process.env.AZURE_STORAGE_KEY || "unset - run container with AZURE_STORAGE_KEY",
        containerName: process.env.AZURE_CONTAINER_NAME || "unset - run container with AZURE_CONTAINER_NAME"
      }
    }
  }
}

export default function Home({ initFiles, envDetails }) {
  const [files, setFiles] = useState(initFiles)
  const [fileName, setFileName] = useState(null);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const refreshFiles = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/azure-storage`);
      setFiles((await res.json()).objects);
    } catch (error) {

    }
    setRefreshing(false);
  }

  const addFile = async (fileName) => {
    setSaving(true);
    try {
      await fetch(`/api/azure/${encodeURIComponent(fileName)}`, { method: 'PUT' });
      setFileName(null);
    } catch (error) {
    }
    setSaving(false);
    refreshFiles();
  }

  const deleteFile = async (fileName) => {
    setRefreshing(true);
    try {
      await fetch(`/api/azure/${encodeURIComponent(fileName)}`, { method: 'DELETE' });
    } catch (error) {
    }
    setRefreshing(false);
    refreshFiles();
  }

  const savingDisabled = saving || !fileName || fileName.trim().length === 0;

  useEffect(() => {
    const interval = setInterval(refreshFiles, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <Head>
        <title>Appvia Storage Account Demonstration App</title>
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <main>
        <Card style={{ width: "600px" }} title={<><img src="/appvia-wayfinder-logo-collapsed.svg" height="30" /> Appvia Storage Account Demonstration</>}>
          <h4>Container details:</h4>
          <ul>
            <li>containerName: {envDetails.containerName}</li>
          </ul>
          <h4>Storage Account Contents:</h4>
          <ul>
            {files.map((file) => <li key={file}>{file} <a onClick={() => deleteFile(file)}><Icon type="delete"></Icon></a></li>)}
          </ul>
          <Button loading={refreshing} onClick={refreshFiles} style={{ width: '100%' }}>Refresh</Button>
          <h4>Add new file to bucket:</h4>
          <Input.Group compact>
            <Input style={{ width: '80%' }} value={fileName} placeholder="Enter a file name to create" readOnly={saving} onChange={(e) => setFileName(e.target.value)} /> 
            <Button style={{ width: '20%' }} disabled={savingDisabled} onClick={() => addFile(fileName.trim())} loading={saving}>Create</Button>
          </Input.Group>
        </Card>
      </main>

      <footer>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        a {
          color: inherit;
          text-decoration: none;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}