import * as React from 'react';
import Hand from '../../components/hand';
import {
  TitleWrapper,
  AnimeTitle,
  Container,
  Point,
  PointValue,
  PointTrophy,
} from './styledComponents';
import useInGame, { IProps } from './useInGame';

import trophyGold from '../../resources/trophy-gold.svg';
import trophySilver from '../../resources/trophy-silver.svg';
import trophyBronze from '../../resources/trophy-bronze.svg';

export default function InGamePage(props: IProps) {
  const { showTitle, computerPosition, point, pointTrophy } = useInGame(props);
  const pointFormat = String(point * 100);
  return (
    <Container>
      <TitleWrapper>
        {Array.from(new Array(3)).map((_, index, { length }) => {
          const value = index === length - 1 ? '참!' : '참';
          return (
            <AnimeTitle
              key={index}
              style={{ visibility: showTitle > index ? 'visible' : 'hidden' }}
              title={value}>
              {value}
            </AnimeTitle>
          );
        })}
      </TitleWrapper>
      <Hand direction={computerPosition} />
      <Point>
        {pointTrophy < 3 ? (
          <PointTrophy>
            {pointTrophy === 0 ? (
              <img src={trophyGold} />
            ) : pointTrophy === 1 ? (
              <img src={trophySilver} />
            ) : (
              <img src={trophyBronze} />
            )}
          </PointTrophy>
        ) : null}
        <PointValue title={pointFormat}>{pointFormat}</PointValue>
      </Point>
    </Container>
  );
}