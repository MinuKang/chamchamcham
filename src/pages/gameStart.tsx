import * as React from 'react';
import styled, { keyframes } from 'styled-components';
import { Title, Button, TrophyButton } from '../styledComponents';
import { IGameDrawHandler } from '../useGame';
import { C3FaceMatch } from '../modules/chamchamcham';
import { FacePosition } from '../types';
import useButtonAudio from '../useButtonAudio';

interface IProps {
  onStartClick(faceMatch: C3FaceMatch): void;
  onRankingClick(): void;
  gameDrawHandlerRef: React.MutableRefObject<IGameDrawHandler | undefined>;
  setToastMessage: React.Dispatch<string | null>;
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120px 0 80px;
  justify-content: space-between;
`;

const animeLetterKeyframe = keyframes`
  from {
    transform: scale(1, 1);
  }
  to {
    transform: scale(1, 1.1);
  }
`;

const AnimeTitle = styled(Title)`
  display: inline-block;
  transform-origin: 50% 100%;
  animation: ${animeLetterKeyframe} 500ms infinite alternate-reverse;
  ${Array.from(new Array(3))
    .map((_, index) => {
      return `&:nth-of-type(${index + 1}) {
      animation-delay: ${index * 200}ms;
    }`;
    })
    .join('\n')}
`;

const TitleWrapper = styled.hgroup``;

export default function GameStartPage(props: IProps) {
  const {
    gameDrawHandlerRef,
    onRankingClick,
    onStartClick,
    setToastMessage,
  } = props;
  const [position, setPosition] = React.useState<FacePosition | null>();
  const [startFace, setStartFace] = React.useState<C3FaceMatch | null>(null);
  React.useEffect(() => {
    if (position && startFace && position === 'center') {
      setToastMessage(null);
    } else {
      if (startFace && position !== 'center') {
        setToastMessage('중앙을 바라봐주세요');
      } else {
        setToastMessage('얼굴을 인식할 수 없습니다.');
      }
    }
  }, [position, startFace]);
  React.useEffect(() => {
    gameDrawHandlerRef.current = async ({ c3 }) => {
      const detection = await c3.getDetectSingleFace();
      if (detection) {
        const facePosition = c3.getMatchFacePositionType(detection);
        setPosition(facePosition);
        setStartFace(detection);
        c3.drawLandmark(detection);
      } else {
        c3.clear();
        setStartFace(null);
      }
    };
    return () => {
      gameDrawHandlerRef.current = undefined;
      setToastMessage(null);
    };
  }, []);
  const { handleClick, handleHover } = useButtonAudio();
  const handleStartClick = React.useCallback(() => {
    if (startFace) {
      handleClick();
      onStartClick(startFace);
    }
  }, [startFace, onStartClick, handleClick]);
  const handleRankingClick = React.useCallback(() => {
    handleClick();
    onRankingClick();
  }, [handleClick, onRankingClick]);
  const disabledStart = !Boolean(startFace && position === 'center');
  return (
    <Container>
      <TrophyButton
        onMouseEnter={handleHover}
        title="랭킹"
        onClick={handleRankingClick}
      />
      <TitleWrapper>
        <AnimeTitle title="참">참</AnimeTitle>
        <AnimeTitle title="참">참</AnimeTitle>
        <AnimeTitle title="참">참</AnimeTitle>
      </TitleWrapper>
      <Button
        disabled={disabledStart}
        onMouseEnter={!disabledStart ? handleHover : undefined}
        onClick={handleStartClick}>
        시작하기
      </Button>
    </Container>
  );
}
