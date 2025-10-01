import * as esbuild from 'esbuild';
import { createBuildSettings } from './esbuild.settings';

const settings = createBuildSettings({ minify: false });
esbuild.build(settings).then();
