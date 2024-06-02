import { Table } from 'antd';
import Column from 'antd/lib/table/Column';
import Link from 'next/link';
import { FunctionComponent } from 'react';
import Player from '../VideoPlayer/Player';
import { IBucketList } from '../../model/s3';

type BucketTableProps = {
  keyOrPrefixList: [];
  prefix: string;
};

const generateBreadcrumbs = (pathList: string[]) => {
  const breadcrumbList: any[] = [
    {
      crumb: '_',
      link: '/',
    },
  ];
  pathList.forEach((path, index) => {
    breadcrumbList.push({
      crumb: path,
      link: pathList.slice(0, index + 1).join('/'),
    });
  });
  return breadcrumbList;
};

export const BucketTable: FunctionComponent<BucketTableProps> = ({ keyOrPrefixList, prefix }) => {
  return (
    <>
      {prefix
        ? generateBreadcrumbs(prefix.split('/')).map((obj) => (
          <>
            <Link key={obj.link} href={obj.link}>
              {obj.crumb}
            </Link>
            {' / '}
          </>
        ))
        : '/'}
      <div style={{ "display": "grid", "gridTemplateColumns": "auto auto" }}>
        {keyOrPrefixList?.map((item: any) => {
          if (item.keyOrPrefix.charAt(item.keyOrPrefix.length - 1) === '/') {
            let keyOrPrefix = item.keyOrPrefix.replace(/\/\s*$/, '');
            return <div key={item.keyOrPrefix} style={{ "marginTop": 20 }}><Link href={`/${keyOrPrefix}`}>{`${keyOrPrefix.split('/').pop()}/`}</Link></div>;
          }

          const extension = item.keyOrPrefix.split('.').pop();

          if (extension === 'mp4' || extension === 'mp3') {
            return <div key={item.signedURL}>
              <Player firstURL={item.signedURL} muted playbackRate={0.25} width={"100%"} height={800} controls={false} loop />
            </div>
          }

          return (
            <a
              key={item.signedURL}
              target="_blank"
              href={item.signedURL}
              rel="noopener noreferrer"
            >
              {item.keyOrPrefix}
            </a>
          )
        })}
      </div>
    </>
    // <Table dataSource={keyOrPrefixList} pagination={false} rowKey="keyOrPrefix">
    //   <Column
    //     title={
    //       prefix
    //         ? generateBreadcrumbs(prefix.split('/')).map((obj) => (
    //           <>
    //             <Link key={obj.link} href={obj.link}>
    //               {obj.crumb}
    //             </Link>
    //             {' / '}
    //           </>
    //         ))
    //         : '/'
    //     }
    //     dataIndex="keyOrPrefix"
    //     key="keyOrPrefix"
    //     render={(keyOrPrefix, row: IBucketList) => {
    //       if (keyOrPrefix.charAt(keyOrPrefix.length - 1) === '/') {
    //         keyOrPrefix = keyOrPrefix.replace(/\/\s*$/, '');
    //         return <Link href={`/${keyOrPrefix}`}>{`${keyOrPrefix.split('/').pop()}/`}</Link>;
    //       }
    //       return (

    //         <div key={row.signedURL}>
    //           <Player firstURL={row.signedURL} muted playbackRate={0.25} width={"auto"} height={400} controls loop/>
    //           {/* <a
    //             target="_blank"
    //             href={row.signedURL || `${row.baseUrl}/${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}/${keyOrPrefix}`}
    //             rel="noopener noreferrer"
    //           >
    //             {keyOrPrefix.split('/').pop()}
    //           </a> */}
    //         </div>

    //       );
    //     }}
    //   />
    // </Table>
  );
};
