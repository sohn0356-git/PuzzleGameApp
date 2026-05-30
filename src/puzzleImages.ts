import type {ImageSourcePropType} from 'react-native';

export type PuzzleImage = {
  id: string;
  title: string;
  source: ImageSourcePropType;
};

export const puzzleImageDate = '2026-05-30';

export const puzzleImages: PuzzleImage[] = [];
