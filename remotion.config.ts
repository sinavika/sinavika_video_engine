import {Config} from '@remotion/cli/config';

// Applies to the Remotion CLI and Studio only. Programmatic renders are
// configured in src/Renderers/VideoRenderer.ts.
Config.setEntryPoint('src/index.ts');
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// WebGL for the 3D visuals (three.js); the programmatic renders use the same.
Config.setChromiumOpenGlRenderer('angle');
