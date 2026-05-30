import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ImageSourcePropType,
  PanResponder,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {puzzleImageDate, puzzleImages} from './puzzleImages';

const GRID_SIZE = 3;
const PIECE_COUNT = GRID_SIZE * GRID_SIZE;
const SCREEN_WIDTH = Dimensions.get('window').width;

type Piece = {
  id: number;
  row: number;
  col: number;
  x: number;
  y: number;
};

type DraggablePieceProps = {
  boardSize: number;
  imageSource: ImageSourcePropType;
  piece: Piece;
  pieceSize: number;
};

const createRandomPieces = (boardSize: number, pieceSize: number) => {
  const spreadSize = boardSize - pieceSize;

  return Array.from({length: PIECE_COUNT}, (_, id) => {
    const row = Math.floor(id / GRID_SIZE);
    const col = id % GRID_SIZE;

    return {
      id,
      row,
      col,
      x: Math.random() * spreadSize,
      y: Math.random() * spreadSize,
    };
  });
};

const DraggablePiece = ({
  boardSize,
  imageSource,
  piece,
  pieceSize,
}: DraggablePieceProps) => {
  const pan = useRef(new Animated.ValueXY({x: piece.x, y: piece.y})).current;
  const offset = useRef({x: piece.x, y: piece.y});
  const dragStart = useRef({x: piece.x, y: piece.y});

  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          dragStart.current = offset.current;
        },
        onPanResponderMove: (_, gesture) => {
          const nextOffset = {
            x: Math.max(
              0,
              Math.min(dragStart.current.x + gesture.dx, boardSize - pieceSize),
            ),
            y: Math.max(
              0,
              Math.min(dragStart.current.y + gesture.dy, boardSize - pieceSize),
            ),
          };

          offset.current = nextOffset;
          pan.setValue(nextOffset);
        },
      }),
    [boardSize, pan, pieceSize],
  );

  return (
    <Animated.View
      {...responder.panHandlers}
      style={[
        styles.piece,
        {
          width: pieceSize,
          height: pieceSize,
          transform: pan.getTranslateTransform(),
        },
      ]}>
      <View style={[styles.pieceCrop, {width: pieceSize, height: pieceSize}]}>
        <Image
          resizeMode="cover"
          source={imageSource}
          style={{
            width: boardSize,
            height: boardSize,
            left: -piece.col * pieceSize,
            top: -piece.row * pieceSize,
          }}
        />
      </View>
      <Text style={styles.pieceNumber}>{piece.id + 1}</Text>
    </Animated.View>
  );
};

const App = (): React.JSX.Element => {
  const boardSize = Math.min(SCREEN_WIDTH - 32, 360);
  const pieceSize = boardSize / GRID_SIZE;
  const [imageIndex, setImageIndex] = useState(0);
  const [pieces, setPieces] = useState(() =>
    createRandomPieces(boardSize, pieceSize),
  );
  const [shuffleKey, setShuffleKey] = useState(1);

  const selectedImage = puzzleImages[imageIndex];

  useEffect(() => {
    setPieces(createRandomPieces(boardSize, pieceSize));
  }, [boardSize, imageIndex, pieceSize, shuffleKey]);

  const nextImage = () => {
    if (puzzleImages.length <= 1) {
      return;
    }

    setImageIndex(currentIndex => (currentIndex + 1) % puzzleImages.length);
    setShuffleKey(currentKey => currentKey + 1);
  };

  const shufflePieces = () => {
    setShuffleKey(currentKey => currentKey + 1);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#16231f" />

      <View style={styles.header}>
        <Text style={styles.kicker}>Image Puzzle</Text>
        <Text style={styles.title}>사진 퍼즐</Text>
        <Text style={styles.subtitle}>
          assets/{puzzleImageDate} 폴더의 이미지를 9조각으로 잘라 랜덤
          배치합니다.
        </Text>
      </View>

      {selectedImage ? (
        <>
          <View style={styles.toolbar}>
            <Pressable onPress={shufflePieces} style={styles.button}>
              <Text style={styles.buttonText}>섞기</Text>
            </Pressable>
            <Pressable
              disabled={puzzleImages.length <= 1}
              onPress={nextImage}
              style={[
                styles.button,
                puzzleImages.length <= 1 && styles.disabledButton,
              ]}>
              <Text style={styles.buttonText}>다음 사진</Text>
            </Pressable>
          </View>

          <View style={[styles.board, {width: boardSize, height: boardSize}]}>
            {pieces.map(piece => (
              <DraggablePiece
                boardSize={boardSize}
                imageSource={selectedImage.source}
                key={`${selectedImage.id}-${shuffleKey}-${piece.id}`}
                piece={piece}
                pieceSize={pieceSize}
              />
            ))}
          </View>

          <Text style={styles.caption}>{selectedImage.title}</Text>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>이미지를 넣어주세요</Text>
          <Text style={styles.emptyText}>
            assets/{puzzleImageDate} 폴더에 jpg, png, webp 이미지를 넣고 npm run
            prepare-images를 실행하세요.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#16231f',
    paddingHorizontal: 16,
    paddingTop: 56,
  },
  header: {
    alignItems: 'center',
    maxWidth: 420,
  },
  kicker: {
    color: '#9ae6b4',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  title: {
    color: '#f8faf7',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 0,
  },
  subtitle: {
    color: '#cbd8d1',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    textAlign: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    marginBottom: 18,
    marginTop: 28,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#e9f5ee',
    borderRadius: 8,
    marginHorizontal: 6,
    minWidth: 112,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  disabledButton: {
    opacity: 0.45,
  },
  buttonText: {
    color: '#16231f',
    fontSize: 15,
    fontWeight: '800',
  },
  board: {
    backgroundColor: '#0f1715',
    borderColor: '#355948',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  piece: {
    elevation: 6,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },
  pieceCrop: {
    backgroundColor: '#20352e',
    borderColor: '#f8faf7',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pieceNumber: {
    backgroundColor: '#16231fcc',
    borderRadius: 8,
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    left: 8,
    minWidth: 22,
    paddingHorizontal: 5,
    paddingVertical: 2,
    position: 'absolute',
    textAlign: 'center',
    top: 8,
  },
  caption: {
    color: '#cbd8d1',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#20352e',
    borderColor: '#315245',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 34,
    maxWidth: 420,
    padding: 20,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
  },
  emptyText: {
    color: '#cbd8d1',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});

export default App;
