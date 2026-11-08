import {Composition} from 'remotion';
import {Episode} from './Episode';
import {FPS, HEIGHT, WIDTH, timing, Episode as Ep} from './script';
import {ep01} from './episodes/ep01';
import {ep02} from './episodes/ep02';
import {ep03} from './episodes/ep03';

const comp = (id: string, ep: Ep) => (
  <Composition key={id} id={id} component={() => <Episode ep={ep} />} durationInFrames={timing(ep).total} fps={FPS} width={WIDTH} height={HEIGHT} />
);

export const Root = () => (
  <>
    {comp('EseMentalista', ep01)}
    {comp('EseMentalista2', ep02)}
    {comp('EseMentalista3', ep03)}
  </>
);
