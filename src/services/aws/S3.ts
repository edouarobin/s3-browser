import {
  ListBucketsCommand,
  ListBucketsCommandOutput,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  S3Client,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IBucketList } from '../../model/s3';

const S3_ENDPOINT_URL = process.env.S3_ENDPOINT_URL || 'https://s3.amazonaws.com';

const s3 = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT_URL,
  forcePathStyle: true,
});

export const listBuckets = async (): Promise<any> => {
  try {
    const response: ListBucketsCommandOutput = await s3.send(new ListBucketsCommand({}));
  } catch (err) {
    console.log(err);
    return [];
  }
};

const calculateSignedURL = async (data: any) => {
  const getObjectCommand = new GetObjectCommand({ Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME, Key: data?.Key });
  const client = new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT_URL,
    forcePathStyle: true,
  })
  const signedURL = await getSignedUrl(client, getObjectCommand, { expiresIn: 3600 });
  return signedURL
}

export const listObjects = async (prefix = ''): Promise<IBucketList[]> => {
  try {
    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      Prefix: prefix,
      Delimiter: '/',
    })

    const response: ListObjectsV2CommandOutput = await s3.send(listObjectsCommand);
    // console.log(response)

    const keyOrPrefixList = [];
    keyOrPrefixList.push(
      ...(response.CommonPrefixes
        ? response.CommonPrefixes.map((data) => ({
          keyOrPrefix: data.Prefix || '',
          baseUrl: S3_ENDPOINT_URL,
          signedURL: '',
        }))
        : [])
    );

    
    keyOrPrefixList.push(
      ...(response.Contents
        ? response.Contents?.map(async (data: any) => {
          const signedURL = await calculateSignedURL(data);
          return (
            {
              keyOrPrefix: data.Key || '',
              baseUrl: S3_ENDPOINT_URL,
              signedURL: signedURL,
            }
          )
        })
        : [])
    );

    const content = await Promise.all(keyOrPrefixList);
    
    return content;
  } catch (err) {
    console.log(err);
    return [];
  }
};
