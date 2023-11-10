import { useEffect, useState, useRef } from 'react';
import BreadcrumbWrap from '../../components/Breadcrumb/BreadcrumbWrap';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import StyledMain from './StyledMain';
import StyledH2 from '../../components/StyledH2';
import { useParams } from 'react-router-dom';
import useGetAlbumFeedList from '../../hooks/useGetAlbumFeedList';
import useGetFeedListData from '../../hooks/useGetFeedListData';
import { DocumentData } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import StyledGridFeed, { StyledFeedItem } from './StyledGridFeed';
import EditIcon from '../../asset/icon/Edit.svg';
import AddIcon from '../../asset/icon/Add_L.svg';
import useEditContext from '../../hooks/useEditContext';
import useUploadContext from '../../hooks/useUploadContext';

export default function Album() {
  const [clientWitch, setClientWitch] = useState(
    document.documentElement.clientWidth,
  );
  const ulRef = useRef<null | HTMLUListElement>(null);
  const { setFeedIdtoEdit, setIsEditModalOpen } = useEditContext();
  const [feedList, setFeedList] = useState<DocumentData[]>([]);
  const { id } = useParams();
  const albumName = id?.replace('-', ' ');
  const getAlbumFeedList = useGetAlbumFeedList();
  const getFeedListData = useGetFeedListData();
  const { setAlbumNametoAdd, setIsUploadModalOpen } = useUploadContext();

  useEffect(() => {
    window.addEventListener('resize', () => {
      setClientWitch(document.documentElement.clientWidth);
    });

    (async () => {
      if (!albumName) {
        setFeedList([{}]);
        return;
      }

      const feedList = await getAlbumFeedList(albumName);

      if (!feedList?.length) {
        setFeedList([{}]);
        return;
      }

      const feedListData = await getFeedListData(feedList);

      if (!feedListData) {
        setFeedList([{}]);
        return;
      }

      setFeedList([...feedListData, {}]);
    })();
  }, []);

  const setEditFeedContext = (feedId: string) => {
    setFeedIdtoEdit(feedId);
    setIsEditModalOpen(true);
  };

  const setRowEnd = () => {
    if (!ulRef.current) {
      return;
    }

    [...ulRef.current?.querySelectorAll('li')].forEach((item) => {
      if (clientWitch > 430) {
        item.style.gridRowEnd = `span ${item.clientHeight + 16}`;
      } else {
        item.style.gridRowEnd = `span ${item.clientHeight + 12}`;
      }
    });
  };

  useEffect(() => {
    setRowEnd();
  }, [clientWitch]);

  const showHoverStyle = (
    e:
      | React.MouseEvent<HTMLAnchorElement>
      | React.FocusEvent<HTMLAnchorElement>,
  ) => {
    if (e.currentTarget.firstElementChild) {
      e.currentTarget.firstElementChild.className = 'hover-wrap';
    }
  };

  const hiddenHoverStyle = (
    e:
      | React.MouseEvent<HTMLAnchorElement>
      | React.FocusEvent<HTMLAnchorElement>,
  ) => {
    if (e.currentTarget.firstElementChild) {
      e.currentTarget.firstElementChild.className = 'a11y-hidden';
    }
  };

  const setUlRef = (node: HTMLUListElement) => {
    if (ulRef.current === null && node.children.length === feedList.length) {
      ulRef.current = node;
      setRowEnd();
    }
  };

  const setUploadContext = () => {
    if (albumName) {
      setAlbumNametoAdd(albumName);
    }

    setIsUploadModalOpen(true);
  };

  return (
    <StyledMain>
      {clientWitch > 1024 && (
        <>
          <StyledH2>{albumName}</StyledH2>
          <Breadcrumb
            navList={[
              { path: 'home', text: 'Home' },
              { path: 'feed', text: albumName || '' },
            ]}
          />
        </>
      )}
      {clientWitch > 430 && clientWitch <= 1024 && (
        <BreadcrumbWrap
          navList={[
            { path: 'home', text: 'Home' },
            { path: 'feed', text: albumName || '' },
          ]}
          title={albumName || ''}
        />
      )}
      <section>
        <h3 className="a11y-hidden">게시글 목록</h3>
        {feedList.length > 0 && (
          <StyledGridFeed
            ref={(node) => {
              if (node) {
                setUlRef(node);
              }
            }}
          >
            {feedList.map((v, i) => {
              if (i === feedList.length - 1) {
                let aspectRatio;

                if (i === 0) {
                  aspectRatio = '3/4';
                } else {
                  const img = new Image();
                  img.src = feedList[i - 1].imageUrl[0];
                  aspectRatio = img.width + '/' + img.height;
                }

                return (
                  <StyledFeedItem $aspectRatio={aspectRatio}>
                    <button
                      className="upload"
                      type="button"
                      aria-label="새 게시물"
                      onClick={setUploadContext}
                    >
                      <img src={AddIcon} alt="추가하기" />
                    </button>
                  </StyledFeedItem>
                );
              } else {
                const img = new Image();
                img.src = v.imageUrl[0];

                return (
                  <StyledFeedItem
                    key={v.id}
                    $aspectRatio={img.width + '/' + img.height}
                  >
                    <Link
                      to={`/feed/${v.id}`}
                      onMouseOver={showHoverStyle}
                      onFocus={showHoverStyle}
                      onMouseLeave={hiddenHoverStyle}
                      onBlur={hiddenHoverStyle}
                    >
                      <div className="a11y-hidden">
                        <strong>{v.title}</strong>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setEditFeedContext(v.id);
                          }}
                        >
                          <img src={EditIcon} alt="수정하기" />
                        </button>
                      </div>
                      <img src={v.imageUrl[0]} alt="" />
                    </Link>
                  </StyledFeedItem>
                );
              }
            })}
          </StyledGridFeed>
        )}
      </section>
    </StyledMain>
  );
}
