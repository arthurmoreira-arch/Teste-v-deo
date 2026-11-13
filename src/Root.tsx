import {Composition} from 'remotion';
import {Episode} from './Episode';
import {FPS, HEIGHT, WIDTH, timing, Episode as Ep} from './script';
import {ep01} from './episodes/ep01';
import {ep02} from './episodes/ep02';
import {ep03} from './episodes/ep03';
import {ep04} from './episodes/ep04';
import {ep05} from './episodes/ep05';
import {ep06} from './episodes/ep06';
import {ep07} from './episodes/ep07';
import {ia01} from './episodes/ia01';
import {ComicTest} from './comic/Test';
import {ComicEp08, ep08Timing} from './comic/Ep08';
import {ComicEp09, ep09Timing} from './comic/Ep09';
import {story01} from './episodes/story01';

const comp = (id: string, ep: Ep) => (
  <Composition key={id} id={id} component={() => <Episode ep={ep} />} durationInFrames={timing(ep).total} fps={FPS} width={WIDTH} height={HEIGHT} />
);

export const Root = () => (
  <>
    {comp('EseMentalista', ep01)}
    {comp('EseMentalista2', ep02)}
    {comp('EseMentalista3', ep03)}
    {comp('EseMentalista4', ep04)}
    {comp('EseMentalista5', ep05)}
    {comp('EseTempo', ep06)}
    {comp('EseApagadas', ep07)}
    {comp('FeitoPorIA', ia01)}
    {comp('Story01', story01)}
    <Composition id="EseApagadasHQ" component={ComicEp08} durationInFrames={ep08Timing.total} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="CaosNvidia" component={ComicEp09} durationInFrames={ep09Timing.total} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="ComicTest" component={ComicTest} durationInFrames={120} fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
);
