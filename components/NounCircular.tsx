import {
  ImageData as data,
  getNounData,
  getBigNounData,
  BigNounImageData as bigNounData,
} from '@lilnounsdao/assets';
import { buildSVG } from '@lilnounsdao/sdk/dist/image/svg-builder';
import { BigNumber as EthersBN } from 'ethers';
import loadingNoun from '@/styles/lil-loading-skull.gif';
import loadingBigNoun from '@/styles/loading-skull-noun.gif';
import Image from 'react-bootstrap/Image';

interface StandaloneCircularNounProps {
  nounId: EthersBN;
  border?: boolean;
  seed: any;
  height: number;
  width: number;
  isBigNoun: boolean;
}

export const getLilNoun = (nounId: string | EthersBN | number, seed: any) => {
  const id = nounId.toString();
  const name = `Lilnoun ${id}`;
  const description = `Lil Noun ${id} is a member of the Lil Nouns DAO`;
  const { parts, background } = getNounData(seed);
  const svg = buildSVG(parts, data.palette, background);
  const image = `data:image/svg+xml;base64,${btoa(svg)}`;

  return {
    name,
    svg,
    description,
    image,
    parts,
    type: 'LIL_NOUNS'
  };
};

export const getNoun = (nounId: string | EthersBN | number, seed: any) => {
  const id = nounId.toString();
  const name = `Noun ${id}`;
  const description = `Noun ${id} is a member of the Nouns DAO`;
  const { parts, background } = getBigNounData(seed);
  const svg = buildSVG(parts, bigNounData.palette, background);
  const image = `data:image/svg+xml;base64,${btoa(svg)}`;

  return {
    name,
    svg,
    description,
    image,
    parts,
    type: 'NOUNS'
  };
};

const Noun: React.FC<{
  imgPath: string;
  isBigNoun?: boolean;
  alt: string;
  height: number;
  width: number;
}> = props => {
  const { imgPath, alt, isBigNoun, height, width } = props;
  return (
    <div className={`relative pt-100% !h-${height ? `[${height}px]` : 0} !w-${width ? `[${width}px]` : 'full'}`} data-tip data-for="noun-traits">
      <Image
        className={`object-pixelated object-left-top w-full h-auto align-middle rounded-full`}
        src={imgPath ? imgPath : (isBigNoun ? loadingBigNoun : loadingNoun)}
        alt={alt}
        fluid
      />
    </div>
  );
};

export const StandaloneNounCircular: React.FC<
  StandaloneCircularNounProps
> = (props: StandaloneCircularNounProps) => {
  const { nounId, seed, height, width, isBigNoun } = props;
  const noun = isBigNoun ? getNoun(nounId, seed) : getLilNoun(nounId, seed);

  return (
      <Noun
        imgPath={noun ? noun.image : ''}
        alt={noun ? noun.description : 'Lil Noun'}
        height={height}
        width={width}
        isBigNoun={isBigNoun}
      />
  );
};