import React, {useMemo, useState} from 'react';
import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

const GRID_SIZE = 3;
const EMPTY_TILE = 0;
const SOLVED_BOARD = [1, 2, 3, 4, 5, 6, 7, 8, EMPTY_TILE];

const isSolved = (board: number[]) =>
  board.every((tile, index) => tile === SOLVED_BOARD[index]);

const canMove = (board: number[], index: number) => {
  const emptyIndex = board.indexOf(EMPTY_TILE);
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;
  const emptyRow = Math.floor(emptyIndex / GRID_SIZE);
  const emptyCol = emptyIndex % GRID_SIZE;

  return Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;
};

const moveTile = (board: number[], index: number) => {
  if (!canMove(board, index)) {
    return board;
  }

  const nextBoard = [...board];
  const emptyIndex = nextBoard.indexOf(EMPTY_TILE);
  nextBoard[emptyIndex] = nextBoard[index];
  nextBoard[index] = EMPTY_TILE;
  return nextBoard;
};

const createShuffledBoard = () => {
  let board = [...SOLVED_BOARD];
  let previousEmptyIndex = -1;

  for (let step = 0; step < 120; step += 1) {
    const emptyIndex = board.indexOf(EMPTY_TILE);
    const possibleMoves = board
      .map((_, index) => index)
      .filter(index => canMove(board, index) && index !== previousEmptyIndex);
    const nextIndex =
      possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

    previousEmptyIndex = emptyIndex;
    board = moveTile(board, nextIndex);
  }

  return isSolved(board) ? moveTile(board, SOLVED_BOARD.length - 2) : board;
};

const App = (): React.JSX.Element => {
  const {width} = useWindowDimensions();
  const boardSize = Math.min(width - 32, 360);
  const tileSize = boardSize / GRID_SIZE;
  const [board, setBoard] = useState(createShuffledBoard);
  const [moves, setMoves] = useState(0);
  const solved = useMemo(() => isSolved(board), [board]);

  const handleTilePress = (index: number) => {
    setBoard(currentBoard => {
      if (!canMove(currentBoard, index) || isSolved(currentBoard)) {
        return currentBoard;
      }

      setMoves(currentMoves => currentMoves + 1);
      return moveTile(currentBoard, index);
    });
  };

  const restartGame = () => {
    setBoard(createShuffledBoard());
    setMoves(0);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#16231f" />

      <View style={styles.header}>
        <Text style={styles.kicker}>Sliding Puzzle</Text>
        <Text style={styles.title}>숫자 퍼즐</Text>
        <Text style={styles.subtitle}>
          빈칸 옆 숫자를 움직여 1부터 8까지 순서대로 맞춰보세요.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>이동</Text>
          <Text style={styles.statValue}>{moves}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>상태</Text>
          <Text style={styles.statValue}>{solved ? '완성' : '진행'}</Text>
        </View>
      </View>

      <View style={[styles.board, {width: boardSize, height: boardSize}]}>
        {board.map((tile, index) => {
          const empty = tile === EMPTY_TILE;

          return (
            <Pressable
              accessibilityLabel={empty ? '빈 칸' : `${tile}번 타일`}
              accessibilityRole="button"
              disabled={empty || solved}
              key={`${tile}-${index}`}
              onPress={() => handleTilePress(index)}
              style={[
                styles.tile,
                empty && styles.emptyTile,
                canMove(board, index) &&
                  !empty &&
                  !solved &&
                  styles.movableTile,
                {width: tileSize - 10, height: tileSize - 10},
              ]}>
              {!empty && <Text style={styles.tileText}>{tile}</Text>}
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.successText}>
        {solved ? '좋아요! 퍼즐을 완성했습니다.' : ' '}
      </Text>

      <Pressable onPress={restartGame} style={styles.restartButton}>
        <Text style={styles.restartButtonText}>새 퍼즐</Text>
      </Pressable>
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
  statsRow: {
    flexDirection: 'row',
    marginBottom: 22,
    marginTop: 30,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#20352e',
    borderColor: '#315245',
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 6,
    minWidth: 104,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  statLabel: {
    color: '#a6b8ae',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  board: {
    backgroundColor: '#0f1715',
    borderColor: '#355948',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
  },
  tile: {
    alignItems: 'center',
    backgroundColor: '#f2c14e',
    borderRadius: 8,
    elevation: 4,
    justifyContent: 'center',
    margin: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
  movableTile: {
    backgroundColor: '#ffd166',
  },
  emptyTile: {
    backgroundColor: '#16231f',
    borderColor: '#284239',
    borderStyle: 'dashed',
    borderWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
  },
  tileText: {
    color: '#1d2521',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
  },
  successText: {
    color: '#9ae6b4',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
    minHeight: 24,
  },
  restartButton: {
    alignItems: 'center',
    backgroundColor: '#e9f5ee',
    borderRadius: 8,
    marginTop: 22,
    minWidth: 148,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  restartButtonText: {
    color: '#16231f',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default App;
