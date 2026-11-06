import {Composition} from 'remotion';
import {EseMentalista} from './EseMentalista';
import {FPS, HEIGHT, WIDTH, totalFrames} from './script';

export const Root = () => (
  <Composition
    id="EseMentalista"
    component={EseMentalista}
    durationInFrames={totalFrames}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
