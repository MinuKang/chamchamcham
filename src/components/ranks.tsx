import * as React from 'react';
import { getRankings, IRank } from '../api/rank';
import RankItem, { IFormatRank } from './rankItem';
import styled from 'styled-components';
import anime from 'animejs';

const Wrapper = styled.div`
  width: 630px;
  height: 100%;
  margin: 0 auto;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Message = styled.p`
  color: #fff;
  font-size: 30px;
  letter-spacing: -0.025em;
`;

const Scroller = styled.div`
  max-height: 440px;
  height: 100%;
  width: 100%;
  overflow-y: scroll;
  position: relative;
`;

interface IProps {
  mineId?: string;
}

export default function RankingPage(props: IProps) {
  const [isLoading, setLoading] = React.useState(false);
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const mineItemRef = React.useRef<HTMLDivElement>(null);
  const [ranks, setRanks] = React.useState<IRank[]>(() => []);
  const formatRanks = React.useMemo(() => {
    const sortRank = ranks.slice().sort((a, b) => {
      return b.point - a.point;
    });
    const rankMap = sortRank.reduce((map, rank) => {
      map.set(rank.point, 1 + (map.get(rank.point) || 0));
      return map;
    }, new Map<number, number>());
    const rankMapKeys = Array.from(rankMap.keys());
    return sortRank.map<IFormatRank>((rank, _index, allRanks) => {
      return {
        ...rank,
        joint: rankMapKeys.indexOf(rank.point),
        rank: allRanks.findIndex(({ point }) => point === rank.point),
      };
    });
  }, [ranks]);
  React.useEffect(() => {
    setLoading(true);
    (async () => {
      setRanks(await getRankings());
      setLoading(false);
    })();
  }, []);
  React.useLayoutEffect(() => {
    setTimeout(() => {
      if (scrollerRef.current && mineItemRef.current) {
        anime({
          targets: scrollerRef.current,
          scrollTop:
            mineItemRef.current.offsetTop -
            scrollerRef.current.offsetHeight +
            mineItemRef.current.offsetHeight,
          duration: 1000,
        });
      }
    }, 1500);
  }, [ranks]);
  return (
    <Wrapper>
      {isLoading ? (
        <Message>로딩 중입니다...</Message>
      ) : formatRanks.length ? (
        <Scroller ref={scrollerRef}>
          {formatRanks.map((rank) => (
            <RankItem
              rank={rank}
              key={rank.id}
              mine={rank.id === props.mineId}
              ref={rank.id === props.mineId ? mineItemRef : undefined}
            />
          ))}
        </Scroller>
      ) : (
        <Message>랭킹이 존재하지 않습니다.</Message>
      )}
    </Wrapper>
  );
}
