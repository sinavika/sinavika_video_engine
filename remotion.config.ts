import {Config} from '@remotion/cli/config';

// Applies to the Remotion CLI and Studio only. Programmatic renders are
// configured in src/Renderers/VideoRenderer.ts.
Config.setEntryPoint('src/index.ts');
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
