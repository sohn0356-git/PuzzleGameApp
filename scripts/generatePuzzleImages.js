const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const assetsRoot = path.join(projectRoot, 'assets');
const now = new Date();
const today = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
].join('-');
const targetDate = process.argv[2] || today;
const targetDir = path.join(assetsRoot, targetDate);
const outputFile = path.join(projectRoot, 'src', 'puzzleImages.ts');
const extensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, {recursive: true});
}

const files = fs
  .readdirSync(targetDir)
  .filter(file => extensions.has(path.extname(file).toLowerCase()))
  .sort((a, b) => a.localeCompare(b));

const items = files
  .map((file, index) => {
    const title = path.basename(file, path.extname(file));
    const assetPath = `../assets/${targetDate}/${file}`.replace(/\\/g, '/');

    return `  {
    id: '${targetDate}-${index + 1}',
    title: '${title.replace(/'/g, "\\'")}',
    source: require('${assetPath}'),
  }`;
  })
  .join(',\n');

const contents = `import type {ImageSourcePropType} from 'react-native';

export type PuzzleImage = {
  id: string;
  title: string;
  source: ImageSourcePropType;
};

export const puzzleImageDate = '${targetDate}';

export const puzzleImages: PuzzleImage[] = [
${items}
];
`;

fs.writeFileSync(outputFile, contents);

console.log(
  `Generated ${path.relative(projectRoot, outputFile)} with ${
    files.length
  } image(s) from ${path.relative(projectRoot, targetDir)}.`,
);
